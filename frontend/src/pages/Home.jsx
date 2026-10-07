import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const dieFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function Home() {
  const [dieFace, setDieFace] = useState(() => Math.floor(Math.random() * dieFaces.length));
  const reduceMotion = useReducedMotion();

  const rollDie = () => {
    setDieFace((current) => (current + 1 + Math.floor(Math.random() * (dieFaces.length - 1))) % dieFaces.length);
  };

  return (
    <div className="home-page">

      {/* NAVBAR */}

      <nav className="home-navbar">

        <div className="home-logo">
          🎲 Board<span>Night</span>
        </div>

        <div className="home-nav-links">
          <Link to="/games">Games</Link>
          <Link to="/planner">Planner</Link>
          <Link to="/borrowed">Borrowed</Link>
        </div>

        <Link
          to="/login"
          className="home-login-button"
        >
          Login
        </Link>

      </nav>


      {/* HERO */}

      <section className="home-hero">

        <div className="home-hero-content">

          <div className="home-badge">
            🎲 YOUR BOARD GAME COMPANION
          </div>

          <h1>
            Plan the night.
            <br />
            <span>Play the game.</span>
          </h1>

          <p>
            Manage your board games, organize game nights,
            and keep track of borrowed games — all in one place.
          </p>

          <div className="home-hero-buttons">

            <Link
              to="/planner"
              className="home-primary-button"
            >
              📅 Plan a Game Night
            </Link>

            <Link
              to="/games"
              className="home-secondary-button"
            >
              🎲 Browse Games
            </Link>

          </div>

        </div>


        {/* DICE CARD */}

        <div className="home-visual">

          <div className="dice-glow" aria-hidden="true"></div>
          <div className="home-orbit home-orbit-one" aria-hidden="true"></div>
          <div className="home-orbit home-orbit-two" aria-hidden="true"></div>

          <div className="home-floating-chip home-floating-chip--top" aria-hidden="true">
            <span>✨</span> GAME NIGHT
          </div>
          <div className="home-floating-chip home-floating-chip--bottom" aria-hidden="true">
            <span>👥</span> YOUR CREW IS WAITING
          </div>

          <div className="dice-card">

            <motion.button
              type="button"
              className="large-dice"
              onClick={rollDie}
              aria-label={`Roll the die. It currently shows ${dieFace + 1}`}
              title="Roll the die"
              whileHover={reduceMotion ? undefined : { scale: 1.08, y: -4 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9, rotate: -12 }}
              animate={reduceMotion ? undefined : { rotateY: [0, 360], scale: [1, 1.08, 1] }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              key={dieFace}
            >
              {dieFaces[dieFace]}
            </motion.button>

            <div className="dice-card-text">
              <strong>
                Game Night
              </strong>

              <span>
                Tap the dice to roll your next adventure.
              </span>
            </div>
            <div className="home-dice-dots" aria-hidden="true"><i /><i /><i /></div>

          </div>

        </div>

      </section>


      {/* STATS */}

      <section className="home-stats">

        <div>
          <strong>
            24+
          </strong>

          <span>
            Board Games
          </span>
        </div>

        <div>
          <strong>
            12
          </strong>

          <span>
            Game Nights
          </span>
        </div>

        <div>
          <strong>
            18
          </strong>

          <span>
            Friends
          </span>
        </div>

        <div>
          <strong>
            ∞
          </strong>

          <span>
            Memories
          </span>
        </div>

      </section>


      {/* POPULAR GAMES */}

      <section className="home-games">

        <div className="home-section-heading">

          <div>
            <p>
              EXPLORE YOUR COLLECTION
            </p>

            <h2>
              Popular Games
            </h2>
          </div>

          <Link to="/games">
            View All →
          </Link>

        </div>


        <div className="home-game-grid">

          <Link to="/games?board=Catan" className="home-game-card">

            <div className="home-game-icon">
              ♟️
            </div>

            <h3>
              Catan
            </h3>

            <p>
              3–4 Players · 60–90 min
            </p>

          </Link>


          <Link to="/games?board=Exploding%20Kittens" className="home-game-card">

            <div className="home-game-icon">
              🃏
            </div>

            <h3>
              Exploding Kittens
            </h3>

            <p>
              2–5 Players · 15 min
            </p>

          </Link>


          <Link to="/games?board=UNO" className="home-game-card">

            <div className="home-game-icon">
              🎴
            </div>

            <h3>
              UNO
            </h3>

            <p>
              2–10 Players · 15–30 min
            </p>

          </Link>


          <Link to="/games?board=Carcassonne" className="home-game-card">

            <div className="home-game-icon">
              🏰
            </div>

            <h3>
              Carcassonne
            </h3>

            <p>
              2–5 Players · 45 min
            </p>

          </Link>

          <Link to="/games?board=Wingspan" className="home-game-card">
            <div className="home-game-icon">🪶</div>
            <h3>Wingspan</h3>
            <p>1–5 Players · 40–70 min</p>
          </Link>

          <Link to="/games?board=Ticket%20to%20Ride" className="home-game-card">
            <div className="home-game-icon">🚂</div>
            <h3>Ticket to Ride</h3>
            <p>2–5 Players · 30–60 min</p>
          </Link>

          <Link to="/games?board=Codenames" className="home-game-card">
            <div className="home-game-icon">🕵️</div>
            <h3>Codenames</h3>
            <p>4–8 Players · 15 min</p>
          </Link>

          <Link to="/games?board=Azul" className="home-game-card">
            <div className="home-game-icon">🎨</div>
            <h3>Azul</h3>
            <p>2–4 Players · 45 min</p>
          </Link>

          <Link to="/games?board=Chess" className="home-game-card">
            <div className="home-game-icon">♟️</div>
            <h3>Chess</h3>
            <p>2 Players · 30–60 min</p>
          </Link>

          <Link to="/games?board=Ludo" className="home-game-card">
            <div className="home-game-icon">🎲</div>
            <h3>Ludo</h3>
            <p>2–4 Players · 30–60 min</p>
          </Link>

        </div>

      </section>


      {/* CTA */}

      <section className="home-cta">

        <div>

          <p>
            READY FOR THE NEXT GAME?
          </p>

          <h2>
            Your next game night
            <br />
            is waiting.
          </h2>

        </div>

        <Link
          to="/signup"
          className="home-primary-button"
        >
          Create Free Account →
        </Link>

      </section>


      {/* FOOTER */}

      <footer className="home-footer">

        <div className="home-logo">
          🎲 Board<span>Night</span>
        </div>

        <p>
          Plan better. Play more. 🎲
        </p>

      </footer>

    </div>
  );
}

export default Home;