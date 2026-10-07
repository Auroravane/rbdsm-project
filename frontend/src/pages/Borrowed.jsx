import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("boardnightUser") || "null");
  } catch {
    return null;
  }
}

function Borrowed() {
  const [games, setGames] = useState([]);
  const [borrowedGames, setBorrowedGames] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(() => Boolean(getStoredUser()?.id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(() =>
    getStoredUser()?.id ? "" : "Please log in to manage borrowed games."
  );
  const [newBorrow, setNewBorrow] = useState({
    game: "",
    person: "",
    borrowedDate: "",
    returnDate: "",
  });

  const fetchBorrowingData = async () => {
    const user = getStoredUser();
    if (!user?.id) throw new Error("Please log in to manage borrowed games.");

    const [gamesResponse, borrowedResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/games/${user.id}`),
      fetch(`${API_BASE_URL}/api/borrowed/${user.id}`),
    ]);
    const [gamesData, borrowedData] = await Promise.all([
      gamesResponse.json(),
      borrowedResponse.json(),
    ]);
    if (!gamesResponse.ok || !gamesData.success) {
      throw new Error(gamesData.message || "Unable to load your games.");
    }
    if (!borrowedResponse.ok || !borrowedData.success) {
      throw new Error(borrowedData.message || "Unable to load borrowing records.");
    }

    return { games: gamesData.games, borrowings: borrowedData.borrowings };
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchBorrowingData();
        if (!active) return;
        setGames(data.games);
        setBorrowedGames(data.borrowings);
        localStorage.setItem("boardnightGames", JSON.stringify(data.games));
        localStorage.setItem("boardnightBorrowed", JSON.stringify(data.borrowings));
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to connect to the BoardNight backend.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const refreshData = async () => {
    const data = await fetchBorrowingData();
    setGames(data.games);
    setBorrowedGames(data.borrowings);
    localStorage.setItem("boardnightGames", JSON.stringify(data.games));
    localStorage.setItem("boardnightBorrowed", JSON.stringify(data.borrowings));
  };

  const availableGameList = useMemo(
    () => games.filter((game) => game.status !== "borrowed"),
    [games]
  );

  const availableGames = availableGameList.length;

  const handleGameChange = (gameName) => {
    setNewBorrow((current) => ({ ...current, game: gameName }));
  };

  const normalizedGameName = newBorrow.game.trim();

  const canRecordBorrow = normalizedGameName.length > 0 && !borrowedGames.some(
    (record) => record.game.toLowerCase() === normalizedGameName.toLowerCase()
  );

  const peopleBorrowing = useMemo(
    () => new Set(borrowedGames.map((item) => item.person)).size,
    [borrowedGames]
  );

  const returnSoon = useMemo(
    () => borrowedGames.filter((record) => new Date(record.returnDate) > new Date()).length,
    [borrowedGames]
  );

  const handleAddBorrow = async (e) => {
    e.preventDefault();

    if (!normalizedGameName || !newBorrow.person.trim() || !canRecordBorrow) {
      return;
    }

    const user = JSON.parse(localStorage.getItem("boardnightUser") || "null");
    try {
      setSaving(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/borrowed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          game: normalizedGameName,
          person: newBorrow.person.trim(),
          borrowedDate: newBorrow.borrowedDate,
          returnDate: newBorrow.returnDate,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to record this borrow.");
      }

      await refreshData();
      setNewBorrow({ game: "", person: "", borrowedDate: "", returnDate: "" });
      setShowForm(false);
    } catch (saveError) {
      setError(saveError.message || "Unable to connect to the BoardNight backend.");
    } finally {
      setSaving(false);
    }
  };

  const updateBorrowing = async (id, markReturned) => {
    const record = borrowedGames.find((item) => item.id === id);
    if (!record) return;

    const action = markReturned ? "Mark" : "Delete";
    const confirmed = window.confirm(`${action} "${record.game}" ${markReturned ? "as returned" : "borrowing record"}?`);
    if (!confirmed) return;

    const user = JSON.parse(localStorage.getItem("boardnightUser") || "null");
    try {
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/api/borrowed/${id}${markReturned ? "/return" : `?userId=${user.id}`}`,
        {
          method: markReturned ? "PUT" : "DELETE",
          ...(markReturned && {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update this borrow.");
      }
      await refreshData();
    } catch (updateError) {
      setError(updateError.message || "Unable to connect to the BoardNight backend.");
    }
  };

  const handleReturn = (id) => updateBorrowing(id, true);
  const handleDelete = (id) => updateBorrowing(id, false);

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-page dashboard-page--borrowed">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          🎲 Board<span>Night</span>
        </div>

        <nav>
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/games">🎲 My Games</Link>
          <Link to="/planner">📅 Game Planner</Link>
          <Link to="/borrowed" className="active">📦 Borrowed</Link>
          <Link to="/profile">👤 Profile</Link>
        </nav>

        <Link to="/" className="logout-link">← Back to Home</Link>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">GAME TRACKING</p>
            <h1>Borrowed Games 📦</h1>
            <p>Keep track of what is out and what is available to play.</p>
          </div>

          <button className="dashboard-action" onClick={() => setShowForm(true)}>
            + Record Borrow
          </button>
        </header>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <section className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div>
              <strong>{borrowedGames.length}</strong>
              <p>Currently Borrowed</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div>
              <strong>{peopleBorrowing}</strong>
              <p>People Borrowing</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🎲</span>
            <div>
              <strong>{availableGames}</strong>
              <p>Games Available</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🔔</span>
            <div>
              <strong>{returnSoon}</strong>
              <p>Due Soon</p>
            </div>
          </div>
        </section>

        <section className="borrowed-section">
          <div className="borrowed-section-heading">
            <div>
              <p className="card-label">CURRENT LOANS</p>
              <h2>Borrowed from collection</h2>
            </div>
            <span className="game-count">{borrowedGames.length} records</span>
          </div>

          {loading ? (
            <p>Loading your borrowing records...</p>
          ) : borrowedGames.length === 0 ? (
            <div className="empty-borrowed">
              <div>🎉</div>
              <h3>All games are home!</h3>
              <p>No games are currently borrowed.</p>
              <button className="dashboard-action" onClick={() => setShowForm(true)}>
                + Record Borrow
              </button>
            </div>
          ) : (
            <div className="borrowed-grid">
              {borrowedGames.map((item) => (
                <div className="borrowed-card" key={item.id}>
                  <div className="borrowed-card-icon">📦</div>

                  <div className="borrowed-card-content">
                    <div className="borrowed-card-top">
                      <div>
                        <p className="planner-label">BORROWED GAME</p>
                        <h3>{item.game}</h3>
                      </div>
                      <span className="borrowed-badge">Borrowed</span>
                    </div>

                    <div className="borrowed-info">
                      <div>👤 <span>{item.person}</span></div>
                      <div>📅 <span>Borrowed {formatDate(item.borrowedDate)}</span></div>
                      <div>🔔 <span>Return by {formatDate(item.returnDate)}</span></div>
                    </div>

                    <div className="borrowed-actions">
                      <button className="return-button" onClick={() => handleReturn(item.id)}>
                        ✓ Mark Returned
                      </button>
                      <button className="delete-borrow-button" onClick={() => handleDelete(item.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div className="game-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()}>
            <div className="game-modal-header">
              <div>
                <p className="dashboard-eyebrow">GAME TRACKING</p>
                <h2>Record borrowed game</h2>
              </div>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBorrow}>
              <label>Game</label>
              <input
                type="text"
                list="available-games"
                placeholder="Choose or type a game name"
                value={newBorrow.game}
                onChange={(e) => handleGameChange(e.target.value)}
                required
              />
              <datalist id="available-games">
                {availableGameList.map((game) => (
                  <option key={game.id ?? game.name} value={game.name} />
                ))}
              </datalist>
              {normalizedGameName && !canRecordBorrow && (
                <small className="borrow-game-hint">This game is already marked as borrowed.</small>
              )}

              <label>Borrowed By</label>
              <input
                type="text"
                placeholder="e.g. Karan"
                value={newBorrow.person}
                onChange={(e) => setNewBorrow({ ...newBorrow, person: e.target.value })}
                required
              />

              <label>Borrow Date</label>
              <input
                type="date"
                value={newBorrow.borrowedDate}
                onChange={(e) => setNewBorrow({ ...newBorrow, borrowedDate: e.target.value })}
                required
              />

              <label>Expected Return Date</label>
              <input
                type="date"
                value={newBorrow.returnDate}
                onChange={(e) => setNewBorrow({ ...newBorrow, returnDate: e.target.value })}
                required
              />

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save" disabled={!canRecordBorrow}>
                    {saving ? "Saving..." : "Record Borrow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Borrowed;