import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/api";
import { FiUser, FiMail, FiLock, FiArrowRight, FiTerminal } from "react-icons/fi";
import toast from "react-hot-toast";
import { AuthStyles } from "./Login";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("Please fill all fields");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await registerUser(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success(`Welcome to DevOpsPulse, ${userData.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
            <h2 className="auth-left__title">Join the<br />community.</h2>
            <p className="auth-left__text">
              Share your Docker expertise, write Kubernetes guides, document
              your AWS architecture. Help thousands of engineers level up.
            </p>
            <div className="auth-left__terminal terminal-block">
              <code>
                <span style={{ color: "var(--text-muted)" }}>$ kubectl apply -f engineer.yaml</span>{"\n"}
                <span style={{ color: "var(--accent-green)" }}>deployment.apps/you created</span>{"\n"}
                <span style={{ color: "var(--accent-blue)" }}>✓ Ready to share knowledge</span>
              </code>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card animate-in">
            <h1 className="auth-card__title">Create Account</h1>
            <p className="auth-card__subtitle">Start your DevOpsPulse journey</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label><FiUser size={11} /> Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

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
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                style={{ justifyContent: "center", padding: "14px" }}
              >
                {loading ? "Creating account..." : (
                  <><span>Create Account</span> <FiArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="auth-card__footer">
              Already have an account?{" "}
              <Link to="/login" className="text-green">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
      <AuthStyles />
    </div>
  );
};

export default Register;