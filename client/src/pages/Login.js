import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import { FiTerminal, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left__content">
            <div className="auth-left__icon">
              <FiTerminal size={32} />
            </div>
            <h2 className="auth-left__title">Welcome back,<br />engineer.</h2>
            <p className="auth-left__text">
              Log in to publish Docker tutorials, AWS guides, and CI/CD
              walkthroughs. Share what you've built with the community.
            </p>
            <div className="auth-left__terminal terminal-block">
              <code>
                <span style={{ color: "var(--text-muted)" }}>$ ssh devops@pulse.io</span>{"\n"}
                <span style={{ color: "var(--accent-green)" }}>Authenticating...</span>{"\n"}
                <span style={{ color: "var(--accent-blue)" }}>✓ Access granted</span>
              </code>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card animate-in">
            <h1 className="auth-card__title">Sign In</h1>
            <p className="auth-card__subtitle">Access your DevOpsPulse account</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label><FiMail size={11} /> Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label><FiLock size={11} /> Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                style={{ justifyContent: "center", padding: "14px" }}
              >
                {loading ? "Signing in..." : (
                  <><span>Sign In</span> <FiArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="auth-card__footer">
              Don't have an account?{" "}
              <Link to="/register" className="text-green">Create one →</Link>
            </p>
          </div>
        </div>
      </div>

      <AuthStyles />
    </div>
  );
};

export const AuthStyles = () => (
  <style>{`
    .auth-page {
      min-height: calc(100vh - 70px);
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .auth-left {
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute;
      top: -100px; left: -100px;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(0,255,136,0.06), transparent 70%);
      pointer-events: none;
    }
    .auth-left__content { position: relative; max-width: 420px; }
    .auth-left__icon {
      width: 60px; height: 60px;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.2);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      color: var(--accent-green);
      margin-bottom: 28px;
    }
    .auth-left__title {
      font-family: var(--font-display);
      font-size: 2.4rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    .auth-left__text {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .auth-left__terminal { font-size: 13px; line-height: 1.7; }
    .auth-left__terminal code { white-space: pre; }
    .auth-right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-card__title {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .auth-card__subtitle {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 36px;
    }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .auth-card__footer {
      text-align: center;
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 24px;
    }
    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 32px 24px; align-items: flex-start; }
    }
  `}</style>
);

export default Login;