import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Gamepad2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AmbientStarfield from "../components/AmbientStarfield";
import API_BASE_URL from "../config";

const stars = [
  { left: "8%", top: "13%", delay: 0, size: 4 },
  { left: "19%", top: "34%", delay: 1.1, size: 3 },
  { left: "28%", top: "8%", delay: 0.4, size: 5 },
  { left: "38%", top: "22%", delay: 1.8, size: 3 },
  { left: "62%", top: "12%", delay: 0.8, size: 4 },
  { left: "75%", top: "24%", delay: 1.5, size: 3 },
  { left: "88%", top: "15%", delay: 0.3, size: 5 },
  { left: "93%", top: "45%", delay: 1.3, size: 3 },
  { left: "12%", top: "71%", delay: 1.7, size: 4 },
  { left: "82%", top: "76%", delay: 0.6, size: 4 },
  { left: "64%", top: "88%", delay: 1, size: 3 },
  { left: "33%", top: "84%", delay: 0.2, size: 4 },
];

function Signup() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Those passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        setError(data.message || "We couldn't create your account.");
        return;
      }

      setSuccess("Your BoardNight account is ready. Taking you to sign in...");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (requestError) {
      console.error("Signup error:", requestError);
      setError("Unable to connect. Check that the BoardNight server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-signup-page">
      <AmbientStarfield local theme="signup" />
      <div className="space-nebula space-nebula-one" aria-hidden="true" />
      <div className="space-nebula space-nebula-two" aria-hidden="true" />
      <div className="space-starfield" aria-hidden="true">
        {stars.map((star, index) => (
          <motion.i
            key={`${star.left}-${star.top}`}
            className={`space-star${index % 4 === 0 ? " space-star-colored" : ""}`}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
            }}
            animate={shouldReduceMotion ? { opacity: 0.6 } : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.25, 0.8] }}
            transition={shouldReduceMotion ? undefined : { duration: 2.8 + index % 3, delay: star.delay, repeat: Infinity }}
          />
        ))}
      </div>

      <Link to="/" className="space-brand" aria-label="BoardNight home">
        <span className="space-brand-icon"><Gamepad2 size={18} /></span>
        <span className="space-brand-name">
          Board<span className="space-brand-accent">Night</span>
        </span>
      </Link>
      <p className="space-top-link">
        Already a member? <Link to="/login">Sign in</Link>
      </p>

      <motion.div
        className="space-astronaut-art"
        aria-hidden="true"
        animate={shouldReduceMotion ? undefined : { y: [0, -13, 0], rotate: [-4, 2, -4] }}
        transition={shouldReduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="space-planet space-planet-large" />
        <span className="space-planet space-planet-small" />
        <span className="space-orbit space-orbit-a" />
        <span className="space-orbit space-orbit-b" />
        <span className="space-astronaut-emoji">🧑‍🚀</span>
        <span className="space-art-caption">YOUR CREW IS OUT THERE</span>
      </motion.div>

      <motion.section
        className="space-signup-card"
        aria-labelledby="signup-title"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: "easeOut" }}
      >
        <header className="space-signup-heading">
          <span className="space-heading-kicker">A LITTLE SPACE FOR YOUR CREW</span>
          <h1 id="signup-title">Join the table</h1>
          <p>Build your game shelf and plan your next great night.</p>
        </header>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              className="auth-message error space-form-message"
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              className="space-success-message"
              role="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Check size={16} /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-signup-form" onSubmit={handleSubmit}>
          <label htmlFor="space-signup-name">Your name</label>
          <div className="space-glass-input">
            <UserRound size={17} aria-hidden="true" />
            <input
              id="space-signup-name"
              type="text"
              name="name"
              placeholder="How should we call you?"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <label htmlFor="space-signup-email">Email</label>
          <div className="space-glass-input">
            <Mail size={17} aria-hidden="true" />
            <input
              id="space-signup-email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="space-signup-password">Password</label>
          <div className="space-glass-input">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              id="space-signup-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 8 characters"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="space-visibility-button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <label htmlFor="space-signup-confirm">Confirm password</label>
          <div className="space-glass-input">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              id="space-signup-confirm"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Enter your password again"
              minLength={8}
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="space-visibility-button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <label className="space-terms">
            <input type="checkbox" required />
            <span className="space-terms-check"><Check size={11} /></span>
            <span>I agree to the terms and conditions</span>
          </label>

          <motion.button
            type="submit"
            className="space-signup-submit"
            disabled={loading}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          >
            {loading ? "Preparing your account..." : "Create my account"}
            {!loading && <span aria-hidden="true">↗</span>}
          </motion.button>
        </form>

        <p className="space-signup-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.section>

      <footer className="space-copyright">A universe of game nights awaits · BoardNight</footer>
    </main>
  );
}

export default Signup;
