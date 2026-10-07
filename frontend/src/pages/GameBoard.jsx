import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const chessStart = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  Array(8).fill("♟"),
  ...Array.from({ length: 4 }, () => Array(8).fill("")),
  Array(8).fill("♙"),
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

const wordCards = [
  "ORBIT", "MAPLE", "RIVER", "ROBOT", "CROWN",
  "PEARL", "COMET", "CASTLE", "DRUM", "CLOUD",
  "PIRATE", "FOREST", "LASER", "MOON", "JAZZ",
  "BRIDGE", "PEACH", "TOWER", "GHOST", "GARDEN",
  "SPARK", "OCEAN", "KNIGHT", "CLOCK", "FALCON",
];

const mosaicColors = ["#50cdbd", "#987cff", "#f3b95f", "#ef7898", "#72a8ff"];
const cardDeck = ["🂡", "🂮", "🂭", "🂫", "🂪", "🂩"];

function getBoardKind(name, category = "") {
  const title = name.toLowerCase();
  if (title.includes("chess") || title.includes("checkers")) return "chess";
  if (title.includes("ludo")) return "ludo";
  if (title.includes("catan")) return "catan";
  if (title.includes("codenames")) return "words";
  if (title.includes("azul")) return "mosaic";
  if (title.includes("ticket to ride")) return "railway";
  if (["uno", "exploding kittens", "sushi go", "dixit"].some((game) => title.includes(game))) return "cards";
  if (title.includes("pandemic")) return "network";
  if (title.includes("wingspan")) return "habitat";
  if (title.includes("monopoly")) return "classic";
  if (category.toLowerCase().includes("card")) return "cards";
  return "tabletop";
}

function ChessBoard() {
  const [selectedSquare, setSelectedSquare] = useState("");

  return (
    <div className="chess-board" role="grid" aria-label="Chess board preview">
      {chessStart.flatMap((row, rowIndex) => row.map((piece, columnIndex) => {
        const square = `${rowIndex}-${columnIndex}`;
        return (
          <button
            className={`chess-square ${(rowIndex + columnIndex) % 2 ? "is-dark" : "is-light"}${selectedSquare === square ? " is-selected" : ""}`}
            key={square}
            type="button"
            role="gridcell"
            aria-label={`${piece ? `${piece} on ` : ""}${String.fromCharCode(65 + columnIndex)}${8 - rowIndex}${selectedSquare === square ? ", selected" : ""}`}
            onClick={() => setSelectedSquare(square)}
          >
            {piece}
          </button>
        );
      }))}
    </div>
  );
}

function LudoBoard() {
  const [face, setFace] = useState(1);
  const [moves, setMoves] = useState(0);
  const roll = () => {
    setFace((current) => {
      const next = Math.floor(Math.random() * 6) + 1;
      return next === current ? (next % 6) + 1 : next;
    });
    setMoves((current) => current + 1);
  };

  return (
    <div className="ludo-board-wrap">
      <div className="ludo-board" role="img" aria-label="Ludo cross-shaped board preview">
        {Array.from({ length: 225 }, (_, index) => {
          const row = Math.floor(index / 15);
          const column = index % 15;
          let quadrant = "";
          if (row < 6 && column < 6) quadrant = "red";
          if (row < 6 && column > 8) quadrant = "green";
          if (row > 8 && column < 6) quadrant = "blue";
          if (row > 8 && column > 8) quadrant = "yellow";
          const isPath = !quadrant && (row === 6 || row === 7 || row === 8 || column === 6 || column === 7 || column === 8);
          const isCenter = row >= 6 && row <= 8 && column >= 6 && column <= 8;
          const token = (row === 2 && column === 2) ? "🔴"
            : (row === 2 && column === 12) ? "🟢"
              : (row === 12 && column === 2) ? "🔵"
                : (row === 12 && column === 12) ? "🟡" : "";
          return (
            <span
              key={index}
              className={`ludo-cell${quadrant ? ` home-${quadrant}` : ""}${isPath ? " ludo-path" : ""}${isCenter ? " ludo-center" : ""}`}
            >
              {token || (isCenter && row === 7 && column === 7 ? "★" : "")}
            </span>
          );
        })}
      </div>
      <div className="board-controls">
        <span className="board-turn">Turn {moves + 1}</span>
        <button type="button" className="board-action" onClick={roll}>
          Roll dice <strong>{face}</strong>
        </button>
      </div>
    </div>
  );
}

function CatanBoard() {
  const hexTiles = [
    ["🌲", "🌾", "🐑"],
    ["🧱", "🐑", "⛰️", "🌲"],
    ["🌾", "⛰️", "🏜️", "🌲", "🐑"],
    ["🐑", "🧱", "🌾", "⛰️"],
    ["🌲", "🌾", "🐑"],
  ];
  return (
    <div className="catan-board" aria-label="Catan hex map preview">
      {hexTiles.map((row, rowIndex) => (
        <div className="catan-hex-row" key={rowIndex}>
          {row.map((resource, index) => (
            <button className="catan-hex" type="button" key={`${rowIndex}-${index}`} aria-label={`${resource} resource tile`}>
              <span>{resource}</span><small>{[5, 8, 10, 4, 9, 6, 11, 3, 12, 5, 8, 4, 10, 6, 9, 3, 11, 2, 7][rowIndex * 3 + index]}</small>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function WordBoard() {
  const [revealed, setRevealed] = useState([]);
  return (
    <div className="word-board" aria-label="Codenames word grid">
      {wordCards.map((word, index) => (
        <button
          type="button"
          className={`word-tile${revealed.includes(index) ? ` team-${index % 3}` : ""}`}
          key={word}
          onClick={() => setRevealed((current) => current.includes(index) ? current : [...current, index])}
        >
          {word}
        </button>
      ))}
    </div>
  );
}

function MosaicBoard() {
  const [selected, setSelected] = useState({});
  return (
    <div className="mosaic-board" aria-label="Color tile board preview">
      {Array.from({ length: 25 }, (_, index) => (
        <button
          type="button"
          aria-label={`Mosaic tile ${index + 1}`}
          key={index}
          className="mosaic-tile"
          style={{ "--tile-color": mosaicColors[selected[index] ?? (index * 3 + Math.floor(index / 5)) % mosaicColors.length] }}
          onClick={() => setSelected((current) => ({ ...current, [index]: ((current[index] ?? (index * 3 + Math.floor(index / 5)) % mosaicColors.length) + 1) % mosaicColors.length }))}
        />
      ))}
    </div>
  );
}

function CardTable() {
  const [drawn, setDrawn] = useState(0);
  return (
    <div className="card-table">
      <div className="card-table-top">
        <span className="card-deck">{cardDeck[(drawn + 2) % cardDeck.length]}</span>
        <span className="card-table-logo">BOARD<br />NIGHT</span>
        <span className="card-deck card-deck-alt">{cardDeck[(drawn + 4) % cardDeck.length]}</span>
      </div>
      <div className="player-hand">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={`${drawn}-${index}`} style={{ "--hand-index": index }}>{cardDeck[(index + drawn) % cardDeck.length]}</span>
        ))}
      </div>
      <div className="board-controls">
        <span className="board-turn">Cards drawn: {drawn}</span>
        <button type="button" className="board-action" onClick={() => setDrawn((value) => value + 1)}>Draw a card</button>
      </div>
    </div>
  );
}

function RouteBoard({ gameName, kind }) {
  const [position, setPosition] = useState(0);
  const spaces = kind === "railway"
    ? ["Seattle", "Portland", "San Francisco", "Los Angeles", "Las Vegas", "Phoenix", "Denver", "Dallas", "Chicago", "New York", "Boston", "Miami"]
    : kind === "network"
      ? ["Atlanta", "Chicago", "Lagos", "London", "Madrid", "Mumbai", "New York", "Paris", "Riyadh", "Seoul", "Sydney", "Tokyo"]
      : kind === "habitat"
        ? ["Forest", "Wetlands", "Grasslands", "Nest", "Food", "Eggs", "Bird", "Bonus", "Forest", "Wetlands", "Grasslands", "Nest"]
        : ["START", "Forest", "Market", "Bridge", "Cave", "River", "Outpost", "Bonus", "Village", "Castle", "Forest", "Finish"];
  const labels = spaces;
  return (
    <div className={`route-board route-board--${kind}`}>
      <div className="route-board-title">{gameName}</div>
      <div className="route-board-path">
        {labels.map((label, index) => (
          <button
            type="button"
            className={`route-space${position === index ? " is-current" : ""}`}
            key={`${label}-${index}`}
            onClick={() => setPosition(index)}
          >
            <small>{String(index + 1).padStart(2, "0")}</small>{label}
          </button>
        ))}
      </div>
      <div className="board-controls">
        <span className="board-turn">Piece at space {position + 1} of {labels.length}</span>
        <button type="button" className="board-action" onClick={() => setPosition((value) => (value + 1) % labels.length)}>Move piece →</button>
      </div>
    </div>
  );
}

function GameBoard() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadGame = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("boardnightUser") || "null");
        if (!user?.id) throw new Error("Please log in to open a game board.");
        const response = await fetch(`http://localhost:5000/api/games/${user.id}`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "Unable to load your games.");
        const selectedGame = data.games.find((item) => String(item.id) === gameId);
        if (!selectedGame) throw new Error("That game is not in your collection.");
        if (active) setGame(selectedGame);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load this game board.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadGame();
    return () => { active = false; };
  }, [gameId]);

  const boardKind = game ? getBoardKind(game.name, game.category) : "tabletop";
  const playerSummary = game
    ? game.min_players === game.max_players
      ? `${game.min_players} player${game.min_players === 1 ? "" : "s"}`
      : `${game.min_players}–${game.max_players} players`
    : "";

  return (
    <div className={`game-board-page game-board-page--${boardKind}`}>
      <header className="game-board-header">
        <Link to="/games" className="game-board-back">← Back to collection</Link>
        <span>BOARDNIGHT TABLE</span>
      </header>
      <main className="game-board-main">
        {loading ? (
          <div className="game-board-state">Setting up your board…</div>
        ) : error ? (
          <div className="game-board-state" role="alert">{error}<Link to="/games">Return to games</Link></div>
        ) : (
          <>
            <div className="game-board-heading">
              <div className="game-board-game-icon">{boardKind === "chess" ? "♟️" : boardKind === "ludo" ? "🎲" : "🎮"}</div>
              <p>READY TO PLAY</p>
              <h1>{game.name}</h1>
              <span>{playerSummary} <i>·</i> {game.play_time_minutes} min</span>
            </div>
            <section className={`game-board-surface game-board-surface--${boardKind}`}>
              {boardKind === "chess" ? <ChessBoard />
                : boardKind === "ludo" ? <LudoBoard />
                  : boardKind === "catan" ? <CatanBoard />
                    : boardKind === "words" ? <WordBoard />
                      : boardKind === "mosaic" ? <MosaicBoard />
                        : boardKind === "cards" ? <CardTable />
                          : <RouteBoard gameName={game.name} kind={boardKind} />}
            </section>
            <p className="game-board-note">{game.description || "Your tabletop is ready. Gather your players and let the game begin."}</p>
          </>
        )}
      </main>
    </div>
  );
}

export default GameBoard;
