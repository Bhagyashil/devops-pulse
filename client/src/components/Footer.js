import React from "react";
import { Link } from "react-router-dom";
import { FiTerminal, FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <div className="footer__brand">
        <Link to="/" className="footer__logo">
          <FiTerminal size={18} style={{ color: "var(--accent-green)" }} />
          <span>DevOps<span className="text-green">Pulse</span></span>
        </Link>
        <p className="footer__tagline">
          Knowledge for the infrastructure engineers of tomorrow.
        </p>
        <div className="footer__socials">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="footer__social">
            <FiGithub size={17} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer__social">
            <FiTwitter size={17} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer__social">
            <FiLinkedin size={17} />
          </a>
        </div>
      </div>

      <div className="footer__links-grid">
        <div>
          <h5 className="footer__heading">Topics</h5>
          {["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform"].map((t) => (
            <Link key={t} to={`/?category=${t}`} className="footer__link">{t}</Link>
          ))}
        </div>
        <div>
          <h5 className="footer__heading">Platform</h5>
          {[
            ["Home", "/"],
            ["Write Post", "/create"],
            ["Dashboard", "/dashboard"],
            ["Login", "/login"],
            ["Register", "/register"],
          ].map(([label, path]) => (
            <Link key={label} to={path} className="footer__link">{label}</Link>
          ))}
        </div>
      </div>
    </div>

    <div className="footer__bottom">
      <div className="container">
        <span className="text-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} DevOpsPulse. Built with MERN Stack.
        </span>
        <span className="text-mono" style={{ fontSize: "11px", color: "var(--accent-green)" }}>
          $ docker run --name devops-pulse -p 3000:3000 blog:latest
        </span>
      </div>
    </div>

    <style>{`
      .footer {
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        margin-top: 80px;
      }
      .footer__inner {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 60px;
        padding: 60px 0 40px;
      }
      .footer__logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: var(--font-display);
        font-size: 1.2rem;
        font-weight: 800;
        margin-bottom: 12px;
      }
      .footer__tagline {
        font-size: 13px;
        color: var(--text-muted);
        line-height: 1.6;
        max-width: 300px;
        margin-bottom: 20px;
      }
      .footer__socials { display: flex; gap: 10px; }
      .footer__social {
        width: 34px;
        height: 34px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        transition: var(--transition);
      }
      .footer__social:hover {
        border-color: var(--accent-green);
        color: var(--accent-green);
        background: rgba(0, 255, 136, 0.05);
      }
      .footer__links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
      .footer__heading {
        font-family: var(--font-mono);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--text-muted);
        margin-bottom: 16px;
      }
      .footer__link {
        display: block;
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 10px;
        transition: color 0.2s;
      }
      .footer__link:hover { color: var(--accent-green); }
      .footer__bottom {
        border-top: 1px solid var(--border);
        padding: 16px 0;
      }
      .footer__bottom .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      @media (max-width: 768px) {
        .footer__inner { grid-template-columns: 1fr; gap: 40px; }
        .footer__bottom .container { flex-direction: column; gap: 6px; text-align: center; }
      }
    `}</style>
  </footer>
);

export default Footer;