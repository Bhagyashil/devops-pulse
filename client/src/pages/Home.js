import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import BlogCard from "../components/BlogCard";
import { getBlogs } from "../services/api";
import { FiTerminal, FiArrowRight, FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Monitoring", "Security", "Other"];

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("search") || "";

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (activeCategory !== "All") params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;
      const res = await getBlogs(params);
      if (page === 1) setBlogs(res.data.data);
      else setBlogs((prev) => [...prev, ...res.data.data]);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchQuery]);

  useEffect(() => {
    setPage(1);
    setBlogs([]);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleCategoryChange = (cat) => {
    if (cat === "All") navigate("/");
    else navigate(`/?category=${cat}`);
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      {!searchQuery && activeCategory === "All" && (
        <section className="hero">
          <div className="hero__bg-grid" />
          <div className="container hero__content animate-in">
            <div className="hero__badge">
              <FiTerminal size={12} />
              <span>Community-driven DevOps knowledge</span>
            </div>
            <h1 className="hero__title">
              Where DevOps Engineers<br />
              <span className="hero__title-accent">Share & Learn</span>
            </h1>
            <p className="hero__subtitle">
              Deep-dive articles on Docker, Kubernetes, AWS, CI/CD pipelines,
              Terraform, and more. Written by engineers, for engineers.
            </p>
            <div className="hero__actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Writing <FiArrowRight size={16} />
              </Link>
              <a href="#posts" className="btn btn-outline btn-lg">
                Browse Posts
              </a>
            </div>

            {/* Terminal snippet */}
            <div className="hero__terminal terminal-block">
              <code>
                <span style={{ color: "var(--text-muted)" }}># Deploy your knowledge</span>{"\n"}
                <span style={{ color: "var(--accent-blue)" }}>$ </span>
                <span style={{ color: "var(--accent-green)" }}>
                  docker run -d --name devops-blog -p 3000:3000 devopspulse:latest
                </span>
              </code>
            </div>

            {/* Stats */}
            <div className="hero__stats">
              {[
                ["500+", "Articles"],
                ["12", "Topics"],
                ["200+", "Engineers"],
                ["50k+", "Readers"],
              ].map(([num, label]) => (
                <div key={label} className="hero__stat">
                  <span className="hero__stat-num">{num}</span>
                  <span className="hero__stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts Section */}
      <section id="posts" className="posts-section">
        <div className="container">
          {/* Header */}
          <div className="posts-header">
            <div>
              {searchQuery ? (
                <h2 className="posts-title">
                  Results for "<span className="text-green">{searchQuery}</span>"
                </h2>
              ) : (
                <h2 className="posts-title">
                  {activeCategory === "All" ? "Latest Posts" : activeCategory}
                </h2>
              )}
              {pagination.total > 0 && (
                <p className="text-muted" style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>
                  {pagination.total} articles found
                </p>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            <FiFilter size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          {loading && page === 1 ? (
            <div className="spinner" />
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <div className="terminal-block" style={{ maxWidth: 400, textAlign: "left" }}>
                <code>
                  <span style={{ color: "var(--text-muted)" }}>
                    $ search --query "{searchQuery || activeCategory}"
                  </span>{"\n"}
                  <span style={{ color: "var(--accent-orange)" }}>Error: No posts found</span>{"\n"}
                  <span style={{ color: "var(--text-muted)" }}>Try a different category or </span>
                  <Link to="/create" style={{ color: "var(--accent-green)" }}>
                    write the first one →
                  </Link>
                </code>
              </div>
            </div>
          ) : (
            <>
              <div className="blog-grid">
                {blogs.map((blog, i) => (
                  <BlogCard key={blog._id} blog={blog} index={i} />
                ))}
              </div>

              {pagination.hasMore && (
                <div className="load-more">
                  <button
                    className="btn btn-outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More Posts"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style>{`
        .hero {
          position: relative;
          padding: 80px 0 60px;
          overflow: hidden;
        }
        .hero__bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .hero__content { position: relative; max-width: 760px; }
        .hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0, 255, 136, 0.08);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 100px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-green);
          margin-bottom: 24px;
          letter-spacing: 0.04em;
        }
        .hero__title {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .hero__title-accent {
          background: var(--gradient-1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero__subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 560px;
          margin-bottom: 32px;
        }
        .hero__actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .hero__terminal {
          max-width: 560px;
          margin-bottom: 48px;
          font-size: 13px;
          line-height: 1.7;
        }
        .hero__terminal code { white-space: pre; }
        .hero__stats { display: flex; gap: 40px; flex-wrap: wrap; }
        .hero__stat { display: flex; flex-direction: column; gap: 2px; }
        .hero__stat-num {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--accent-green);
        }
        .hero__stat-label {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
        .posts-section { padding: 60px 0; }
        .posts-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .posts-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .category-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
        }
        .category-filters::-webkit-scrollbar { display: none; }
        .category-btn {
          padding: 7px 16px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 100px;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .category-btn:hover { color: var(--text-primary); border-color: var(--border-glow); }
        .category-btn.active {
          color: var(--accent-green);
          border-color: var(--accent-green);
          background: rgba(0, 255, 136, 0.07);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 0;
        }
        .load-more {
          display: flex;
          justify-content: center;
          margin-top: 48px;
        }
      `}</style>
    </div>
  );
};

export default Home;