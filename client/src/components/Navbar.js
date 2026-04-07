import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiTerminal, FiEdit3, FiLogOut, FiUser, FiMenu, FiX, FiSearch,
} from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <FiTerminal className="navbar__logo-icon" />
            <span className="navbar__logo-text">DevOps<span className="text-green">Pulse</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar__links">
            <NavLink to="/" className={({ isActive }) => `navbar__link ${isActive ? "active" : ""}`} end>
              Home
            </NavLink>
            {["Docker", "Kubernetes", "AWS", "CI/CD"].map((cat) => (
              <NavLink
                key={cat}
                to={`/?category=${cat}`}
                className="navbar__link"
              >
                {cat}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="navbar__actions">
            <button className="navbar__icon-btn" onClick={() => setSearchOpen((s) => !s)} aria-label="Search">
              <FiSearch size={18} />
            </button>

            {user ? (
              <>
                <Link to="/create" className="btn btn-primary btn-sm">
                  <FiEdit3 size={14} /> Write
                </Link>
                <div className="navbar__avatar-menu">
                  <Link to="/dashboard" className="navbar__avatar" title={user.name}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.[0]?.toUpperCase()}</span>
                    )}
                  </Link>
                </div>
                <button className="navbar__icon-btn" onClick={handleLogout} title="Logout">
                  <FiLogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <button className="navbar__hamburger" onClick={() => setMenuOpen((m) => !m)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="navbar__search-bar">
            <form onSubmit={handleSearch} className="container">
              <div className="navbar__search-inner">
                <FiSearch size={16} className="text-muted" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search posts, topics, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="navbar__search-hint text-mono text-muted">↵ Enter to search</span>
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu__inner">
            {["Home", "Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/?category=${item}`}
                className="mobile-menu__link"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="mobile-menu__divider" />
            {user ? (
              <>
                <Link to="/dashboard" className="mobile-menu__link" onClick={() => setMenuOpen(false)}>
                  <FiUser size={15} /> Dashboard
                </Link>
                <Link to="/create" className="mobile-menu__link text-green" onClick={() => setMenuOpen(false)}>
                  <FiEdit3 size={15} /> Write Post
                </Link>
                <button className="mobile-menu__link text-muted" onClick={handleLogout}>
                  <FiLogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-menu__link" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="mobile-menu__link text-green" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          height: 70px;
          transition: all 0.3s ease;
        }
        .navbar--scrolled {
          background: rgba(10, 10, 15, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .navbar__inner {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .navbar__logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .navbar__logo-icon {
          color: var(--accent-green);
          width: 22px;
          height: 22px;
        }
        .navbar__links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }
        .navbar__link {
          padding: 6px 12px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          transition: var(--transition);
        }
        .navbar__link:hover, .navbar__link.active {
          color: var(--accent-green);
          background: rgba(0, 255, 136, 0.06);
        }
        .navbar__actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .navbar__icon-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: var(--transition);
        }
        .navbar__icon-btn:hover { color: var(--text-primary); background: var(--bg-secondary); }
        .navbar__avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 14px;
          color: #000;
          overflow: hidden;
          border: 2px solid var(--border-glow);
          transition: var(--transition);
        }
        .navbar__avatar:hover { border-color: var(--accent-green); box-shadow: 0 0 12px rgba(0,255,136,0.3); }
        .navbar__avatar img { width: 100%; height: 100%; object-fit: cover; }
        .navbar__search-bar {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 12px 0;
          animation: fadeIn 0.2s ease;
        }
        .navbar__search-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 10px 16px;
        }
        .navbar__search-inner input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
          font-family: var(--font-body);
        }
        .navbar__search-hint { font-size: 11px; }
        .navbar__hamburger {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 6px;
        }
        .mobile-menu {
          position: fixed;
          top: 70px; left: 0; right: 0; bottom: 0;
          background: var(--bg-primary);
          z-index: 999;
          border-top: 1px solid var(--border);
          animation: fadeIn 0.2s ease;
          overflow-y: auto;
        }
        .mobile-menu__inner {
          display: flex;
          flex-direction: column;
          padding: 16px;
          gap: 4px;
        }
        .mobile-menu__link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          background: none;
          border: none;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          width: 100%;
        }
        .mobile-menu__link:hover { color: var(--text-primary); background: var(--bg-card); }
        .mobile-menu__divider { height: 1px; background: var(--border); margin: 8px 0; }
        @media (max-width: 900px) {
          .navbar__links { display: none; }
          .navbar__hamburger { display: flex; }
          .navbar__actions .btn { display: none; }
          .navbar__actions .navbar__icon-btn:not(:first-child) { display: none; }
          .navbar__avatar-menu { display: none; }
        }
      `}</style>
    </>
  );
};

export default Navbar;