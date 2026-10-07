import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";

const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const featuredGames = [
  { name: "Catan", icon: "♟️", players: "3–4 players", time: "60–90 min", category: "Strategy" },
  { name: "Wingspan", icon: "🪶", players: "1–5 players", time: "40–70 min", category: "Engine builder" },
  { name: "Ticket to Ride", icon: "🚂", players: "2–5 players", time: "30–60 min", category: "Family favorite" },
  { name: "Codenames", icon: "🕵️", players: "4–8+ players", time: "15 min", category: "Party game" },
];

function getWeeklyBorrowActivity(borrowings) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const count = borrowings.filter((borrowing) => {
      const borrowedDate =
        borrowing.borrowedDate || borrowing.borrowed_date || "";
      return String(borrowedDate).slice(0, 10) === dateKey;
    }).length;

    return {
      dateKey,
      day: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
      count,
    };
  });
}

function DashboardDie() {
  const [face, setFace] = useState(() => Math.floor(Math.random() * diceFaces.length));
  const [rolling, setRolling] = useState(false);
  const reduceMotion = useReducedMotion();
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const roll = useCallback(() => {
    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);
    setRolling(true);

    if (reduceMotion) {
      setFace((current) => (current + 1 + Math.floor(Math.random() * 5)) % diceFaces.length);
      setRolling(false);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setFace((current) => (current + 1 + Math.floor(Math.random() * 5)) % diceFaces.length);
    }, 75);

    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setFace((current) => (current + 1 + Math.floor(Math.random() * 5)) % diceFaces.length);
      setRolling(false);
      timeoutRef.current = null;
    }, 900);
  }, [reduceMotion]);

  useEffect(() => {
    const startTimeout = window.setTimeout(roll, 0);
    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, [roll]);

  return (
    <motion.button
      type="button"
      className={`event-date dashboard-die${rolling ? " is-rolling" : ""}`}
      onClick={roll}
      aria-label={`Roll the die. It currently shows ${face + 1}`}
      title="Roll the die"
      whileHover={reduceMotion ? undefined : { scale: 1.08, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
    >
      <motion.span
        key={face}
        initial={reduceMotion ? false : { opacity: 0.65, scale: 0.65, rotate: -35 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 16 }}
        aria-hidden="true"
      >
        {diceFaces[face]}
      </motion.span>
    </motion.button>
  );
}

function Dashboard() {
  const [games, setGames] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("boardnightUser") || "null");
        if (!storedUser?.id) {
          setError("Please log in to view your dashboard.");
          return;
        }

        const [gamesResponse, borrowedResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/games/${storedUser.id}`),
          fetch(`${API_BASE_URL}/api/borrowed/${storedUser.id}`),
        ]);
        const [gamesData, borrowedData] = await Promise.all([
          gamesResponse.json(),
          borrowedResponse.json(),
        ]);

        if (!gamesResponse.ok || !gamesData.success) {
          throw new Error(gamesData.message || "Unable to load your games.");
        }
        if (!borrowedResponse.ok || !borrowedData.success) {
          throw new Error(borrowedData.message || "Unable to load your borrowing records.");
        }
        if (!active) return;

        setUser(storedUser);
        setGames(gamesData.games);
        setBorrowed(borrowedData.borrowings);
        localStorage.setItem("boardnightGames", JSON.stringify(gamesData.games));
        localStorage.setItem("boardnightBorrowed", JSON.stringify(borrowedData.borrowings));
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to connect to the BoardNight backend.");
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const totalGames = games.length;
  const availableGames = games.filter((game) => (game.status || "available") !== "borrowed").length;
  const borrowedCount = borrowed.length;

  const borrowerMap = borrowed.reduce((acc, item) => {
    acc[item.person] = (acc[item.person] || 0) + 1;
    return acc;
  }, {});

  const topBorrowers = Object.entries(borrowerMap)
    .map(([person, count]) => ({ person, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const activityFeed = [
    { label: "Borrow record added", value: `${borrowedCount} active loans` },
    { label: "Library health", value: `${availableGames} games ready to play` },
    { label: "Top lender", value: topBorrowers[0]?.person ? `${topBorrowers[0].person} borrowed ${topBorrowers[0].count} ${topBorrowers[0].count === 1 ? "game" : "games"}` : "No loans yet" },
  ];

  const recentGames = games.slice(0, 3);
  const weeklyBorrowActivity = getWeeklyBorrowActivity(borrowed);
  const chartMaximum = Math.max(...weeklyBorrowActivity.map(({ count }) => count), 1);

  return (
    <div className="dashboard-page dashboard-page--overview">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          🎲 Board<span>Night</span>
        </div>

        <nav>
          <Link to="/dashboard" className="active">
            📊 Dashboard
          </Link>
          <Link to="/games">🎲 My Games</Link>
          <Link to="/planner">📅 Game Planner</Link>
          <Link to="/borrowed">📦 Borrowed</Link>
          <Link to="/profile">👤 Profile</Link>
        </nav>

        <Link to="/" className="logout-link">
          ← Back to Home
        </Link>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">YOUR DASHBOARD</p>
            <h1>Good evening{user?.name ? `, ${user.name}` : ""} 👋</h1>
            <p>Track your collection, borrow flow, and game-night momentum.</p>
            {error && <p role="alert">{error}</p>}
          </div>

          <Link to="/planner" className="dashboard-action">
            + Plan Game Night
          </Link>
        </header>

        <section className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-icon">🎲</span>
            <div>
              <strong>{totalGames}</strong>
              <p>Total Games</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div>
              <strong>{availableGames}</strong>
              <p>Available</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div>
              <strong>{borrowedCount}</strong>
              <p>Borrowed</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <div>
              <strong>{totalGames ? Math.round((availableGames / totalGames) * 100) : 0}%</strong>
              <p>Ready to Play</p>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel panel-hero">
            <div className="panel-header">
              <div>
                <p className="card-label">NEXT EVENT</p>
                <h2>Plan your next game night</h2>
              </div>
              <DashboardDie />
            </div>

            <p className="card-description">A casual night of strategy, chaos, and laughs with the crew.</p>

            <div className="event-info">
              <span>👥 Invite friends</span>
              <span>🕖 Pick a time</span>
              <span>📍 Choose a place</span>
            </div>

            <div className="game-tags">
              {games.slice(0, 3).map((game) => <span key={game.id}>{game.name}</span>)}
            </div>

            <Link to="/planner" className="card-button">
              View Game Night →
            </Link>
          </div>

          <div className="panel">
            <div className="panel-header compact-header">
              <div>
                <p className="card-label">BORROWING PULSE</p>
                <h2>Who’s borrowing?</h2>
              </div>
            </div>

            <div className="pulse-list">
              {topBorrowers.length > 0 ? (
                topBorrowers.map(({ person, count }) => (
                  <div key={person} className="pulse-row">
                    <div className="pulse-meta">
                      <span className="pulse-avatar">{person.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <strong>{person}</strong>
                        <small>{count} games</small>
                      </div>
                    </div>
                    <div className="pulse-bar">
                      <span style={{ width: `${Math.min((count / Math.max(borrowedCount, 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-mini-label">No active borrow records yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard-grid dashboard-grid-bottom">
          <div className="panel panel-chart">
            <div className="panel-header compact-header">
              <div>
                <p className="card-label">LAST 7 DAYS</p>
                <h2>Active loans by start date</h2>
                <p className="chart-caption">Currently borrowed games, grouped by the date they were lent.</p>
              </div>
            </div>

            <div
              className="chart-bars"
              role="img"
              aria-label={`Currently active loans started by date over the last seven days. ${weeklyBorrowActivity
                .map(({ day, count }) => `${day}: ${count}`)
                .join(", ")}`}
            >
              {weeklyBorrowActivity.map(({ dateKey, day, count }, index) => (
                <div key={dateKey} className="bar-column">
                  <span className="bar-value" aria-hidden="true">{count}</span>
                  <div className="bar-track">
                    <span
                      className="bar-fill"
                      style={{
                        height: `${count ? Math.max((count / chartMaximum) * 100, 8) : 3}%`,
                        animationDelay: `${380 + index * 70}ms`,
                      }}
                    />
                  </div>
                  <small>{day}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header compact-header">
              <div>
                <p className="card-label">ACTIVITY</p>
                <h2>Recent updates</h2>
              </div>
            </div>

            <ul className="activity-feed">
              {activityFeed.map((item) => (
                <li key={item.label}>
                  <span className="dot" />
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.value}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="dashboard-card recent-games">
          <div className="card-heading">
            <div>
              <p className="card-label">YOUR COLLECTION</p>
              <h2>Recent favorites</h2>
            </div>
            <Link to="/games">View All →</Link>
          </div>

          <div className="recent-game-list">
            {recentGames.map((game) => (
              <Link to={`/games/${game.id}/board`} className="recent-game" key={game.id}>
                <div className="recent-game-icon">{game.name.includes("Catan") ? "♟️" : game.name.includes("UNO") ? "🎴" : game.name.includes("Codenames") ? "🕵️" : "🎲"}</div>
                <div>
                  <strong>{game.name}</strong>
                  <p>{(game.status || "available") === "borrowed" ? "Currently borrowed" : "Ready to play"}</p>
                </div>
                <span className={(game.status || "available") === "borrowed" ? "borrowed-badge" : "available-badge"}>
                  {(game.status || "available") === "borrowed" ? "Borrowed" : "Available"}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-card dashboard-picks">
          <div className="card-heading">
            <div>
              <p className="card-label">TONIGHT'S TABLE</p>
              <h2>Game night picks</h2>
            </div>
            <Link to="/games">Explore collection →</Link>
          </div>
          <p className="picks-intro">A few crowd-pleasers to get your next game night rolling.</p>
          <div className="quick-picks-grid">
            {featuredGames.map((game, index) => (
              <Link
                to={`/games?board=${encodeURIComponent(game.name)}`}
                className="quick-pick-card"
                key={game.name}
                style={{ "--pick-index": index }}
              >
                <span className="quick-pick-icon" aria-hidden="true">{game.icon}</span>
                <span className="quick-pick-category">{game.category}</span>
                <strong>{game.name}</strong>
                <span className="quick-pick-meta">{game.players} <span>·</span> {game.time}</span>
                <span className="quick-pick-action">Browse games <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;