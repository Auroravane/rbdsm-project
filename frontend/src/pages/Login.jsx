import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Gamepad2,
  Globe,
  LockKeyhole,
  Mail,
  UsersRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AmbientStarfield from "../components/AmbientStarfield";

const BACKGROUND_VIDEO =
  "https://cdn.21st.dev/assets/mirror/38/38f6c913209f4092ea0643267302c0b4873f6aeb56deeb59ead88c794340e84d.mp4";

function GamingVideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPlayback = () => {
      if (reduceMotion.matches) {
        video.pause();
      } else {
        video.play().catch(() => {
          video.dataset.playbackBlocked = "true";
        });
      }
    };

    syncPlayback();
    reduceMotion.addEventListener("change", syncPlayback);
    return () => reduceMotion.removeEventListener("change", syncPlayback);
  }, []);

  return (
    <div className="gaming-backdrop" aria-hidden="true">
      <div className="gaming-backdrop-fallback" />
      <video
        ref={videoRef}
        className="gaming-backdrop-video"
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={BACKGROUND_VIDEO} type="video/mp4" />
      </video>
      <div className="gaming-backdrop-shade" />
      <div className="gaming-scanlines" />
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "That email and password did not match.");
        return;
      }

      const user = data.user || data.account || data.data?.user || null;
      if (!user) {
        setError("The server did not return your account details.");
        return;
      }

      localStorage.setItem(
        "boardnightUser",
        JSON.stringify({
          id: user.id,
          name: user.name || "",
          email: user.email || email,
          phone: user.phone || "",
          location: user.location || "",
        })
      );

      if (data.token) localStorage.setItem("boardnightToken", data.token);
      localStorage.setItem("boardnightRememberMe", String(rememberMe));
      navigate("/dashboard");
    } catch (requestError) {
      console.error("Login error:", requestError);
      setError("Unable to connect. Check that the BoardNight server is running.");
    } finally {
      setLoading(false);
    }
  };

  const announceUnavailableProvider = () => {
    setNotice("Social sign-in is not connected yet. Sign in with your email instead.");
  };

  return (
    <main className="gaming-login-page">
      <GamingVideoBackground />
      <AmbientStarfield local theme="login" />

      <Link to="/" className="gaming-brand" aria-label="BoardNight home">
        <span className="gaming-brand-icon"><Gamepad2 size={19} /></span>
        Board<span>Night</span>
      </Link>

      <motion.div
        className="gaming-login-wrap"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: "easeOut" }}
      >
        <section className="gaming-login-card" aria-labelledby="login-title">
          <header className="gaming-login-heading">
            <div className="gaming-emblem" aria-hidden="true">
              <Gamepad2 size={24} />
            </div>
            <p className="gaming-eyebrow">YOUR GAME NIGHT STARTS HERE</p>
            <h1 id="login-title">Welcome back</h1>
            <p>Sign in to get your crew and collection together.</p>
          </header>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                className="auth-message error gaming-message"
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {error}
              </motion.div>
            )}
            {!error && notice && (
              <motion.div
                key="notice"
                className="gaming-notice"
                role="status"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {notice}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="gaming-login-form" onSubmit={handleSubmit}>
            <label className="gaming-field-label" htmlFor="gaming-login-email">
              Email address
            </label>
            <div className="gaming-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                id="gaming-login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="gaming-password-label">
              <label className="gaming-field-label" htmlFor="gaming-login-password">
                Password
              </label>
              <button
                type="button"
                className="gaming-text-button"
                onClick={() => setNotice("Password reset is not connected yet.")}
              >
                Forgot password?
              </button>
            </div>
            <div className="gaming-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                id="gaming-login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="gaming-visibility-button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label className="gaming-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span className="gaming-check-ui"><Check size={12} /></span>
              <span>Remember me</span>
            </label>

            <motion.button
              type="submit"
              className="gaming-submit"
              disabled={loading}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              {loading ? "Loading into your table..." : "Enter BoardNight"}
              {!loading && <span aria-hidden="true">→</span>}
            </motion.button>
          </form>

          <div className="gaming-divider">
            <span>quick access via</span>
          </div>
          <div className="gaming-socials" aria-label="Alternative sign-in options">
            <button type="button" onClick={announceUnavailableProvider} aria-label="Web sign-in unavailable">
              <Globe size={18} />
            </button>
            <button type="button" onClick={announceUnavailableProvider} aria-label="Community sign-in unavailable">
              <UsersRound size={17} />
            </button>
            <button type="button" onClick={announceUnavailableProvider} aria-label="Gaming sign-in unavailable">
              <Gamepad2 size={18} />
            </button>
          </div>

          <p className="gaming-login-footer">
            Don’t have an account? <Link to="/signup">Create Account</Link>
          </p>
        </section>
      </motion.div>

      <footer className="gaming-copyright">
        © {new Date().getFullYear()} BoardNight · Make room for one more.
      </footer>
    </main>
  );
}

export default Login;
