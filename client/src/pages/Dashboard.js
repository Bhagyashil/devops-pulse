import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyBlogs, deleteBlog } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FiEdit3, FiTrash2, FiEye, FiHeart, FiMessageCircle,
  FiPlus, FiUser, FiClock, FiBookmark,
} from "react-icons/fi";
import toast from "react-hot-toast";

const categoryClass = {
  Docker: "badge-docker", Kubernetes: "badge-kubernetes", AWS: "badge-aws",
  "CI/CD": "badge-cicd", Linux: "badge-linux", Terraform: "badge-terraform",
  Monitoring: "badge-monitoring", Security: "badge-security", Other: "badge-other",
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getMyBlogs()
      .then((res) => setBlogs(res.data.data))
      .catch(() => toast.error("Failed to load your posts"))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await deleteBlog(id);
      setBlogs((b) => b.filter((blog) => blog._id !== id));
      toast.success("Post deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalLikes = blogs.reduce((acc, b) => acc + (b.likes?.length || 0), 0);
  const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);
  const totalComments = blogs.reduce((acc, b) => acc + (b.comments?.length || 0), 0);

  return (
    <div className="page-wrapper">
      <div className="container dashboard">
        {/* Profile Header */}
        <div className="dash-header animate-in">
          <div className="dash-profile">
            <div className="dash-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="dash-name">{user?.name}</h1>
              <p className="dash-email text-mono text-muted">{user?.email}</p>
              {user?.bio && <p className="dash-bio">{user.bio}</p>}
            </div>
            <Link to="/profile" className="btn btn-outline btn-sm dash-edit-btn">
              <FiUser size={13} /> Edit Profile
            </Link>
          </div>

          {/* Stats */}
          <div className="dash-stats">
            {[
              [blogs.length, "Posts", <FiEdit3 size={16} />],
              [totalViews, "Total Views", <FiEye size={16} />],
              [totalLikes, "Total Likes", <FiHeart size={16} />],
              [totalComments, "Comments", <FiMessageCircle size={16} />],
            ].map(([val, label, icon]) => (
              <div key={label} className="dash-stat">
                <span className="dash-stat__icon">{icon}</span>
                <span className="dash-stat__val">{val}</span>
                <span className="dash-stat__label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {[["posts", FiEdit3, "My Posts"], ["saved", FiBookmark, "Saved"]].map(
            ([tab, Icon, label]) => (
              <button
                key={tab}
                className={`dash-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <Icon size={14} /> {label}
              </button>
            )
          )}
          <Link to="/create" className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }}>
            <FiPlus size={14} /> New Post
          </Link>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="dash-content">
            {loading ? (
              <div className="spinner" />
            ) : blogs.length === 0 ? (
              <div className="dash-empty">
                <div className="terminal-block" style={{ maxWidth: 400 }}>
                  <code style={{ display: "block", paddingTop: 20 }}>
                    <span style={{ color: "var(--text-muted)" }}>$ ls ./posts/</span>{"\n"}
                    <span style={{ color: "var(--accent-orange)" }}>No posts found</span>{"\n"}
                    <Link to="/create" style={{ color: "var(--accent-green)" }}>
                      $ touch new-post.md →
                    </Link>
                  </code>
                </div>
              </div>
            ) : (
              <div className="posts-table">
                <div className="posts-table__header">
                  <span>Post</span>
                  <span>Stats</span>
                  <span>Date</span>
                  <span>Actions</span>
                </div>
                {blogs.map((blog) => (
                  <div key={blog._id} className="posts-table__row">
                    <div className="posts-table__post">
                      <span className={`badge ${categoryClass[blog.category] || "badge-other"}`}>
                        {blog.category}
                      </span>
                      <Link to={`/blog/${blog.slug}`} className="posts-table__title">
                        {blog.title}
                      </Link>
                    </div>
                    <div className="posts-table__stats">
                      <span><FiEye size={11} /> {blog.views}</span>
                      <span><FiHeart size={11} /> {blog.likes?.length || 0}</span>
                      <span><FiMessageCircle size={11} /> {blog.comments?.length || 0}</span>
                      <span><FiClock size={11} /> {blog.readTime}m</span>
                    </div>
                    <div className="posts-table__date text-mono text-muted">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </div>
                    <div className="posts-table__actions">
                      <Link to={`/edit/${blog.slug}`} className="tbl-btn tbl-btn--edit">
                        <FiEdit3 size={14} />
                      </Link>
                      <button
                        className="tbl-btn tbl-btn--delete"
                        onClick={() => handleDelete(blog._id)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <div className="dash-content">
            <div className="dash-empty">
              <p className="text-muted" style={{ fontSize: "14px" }}>
                No saved posts yet. Browse and save posts you like!
              </p>
              <Link to="/" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>
                Browse Posts
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dashboard { padding-bottom: 80px; }
        .dash-header { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; margin-bottom: 24px; }
        .dash-profile { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 28px; flex-wrap: wrap; }
        .dash-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-green), var(--accent-blue)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 28px; color: #000; overflow: hidden; flex-shrink: 0; border: 3px solid var(--border-glow); }
        .dash-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .dash-name { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
        .dash-email { font-size: 13px; margin-bottom: 6px; }
        .dash-bio { font-size: 13px; color: var(--text-secondary); }
        .dash-edit-btn { margin-left: auto; }
        .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; border-top: 1px solid var(--border); padding-top: 24px; }
        .dash-stat { display: flex; flex-direction: column; align-items: center; gap: 6px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; }
        .dash-stat__icon { color: var(--accent-green); }
        .dash-stat__val { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; }
        .dash-stat__label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        .dash-tabs { display: flex; align-items: center; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
        .dash-tab { display: flex; align-items: center; gap: 8px; padding: 12px 20px; font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: var(--transition); margin-bottom: -1px; }
        .dash-tab:hover { color: var(--text-primary); }
        .dash-tab.active { color: var(--accent-green); border-bottom-color: var(--accent-green); }
        .dash-content { min-height: 200px; }
        .dash-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; }
        .posts-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
        .posts-table__header { display: grid; grid-template-columns: 1fr auto auto auto; gap: 16px; padding: 12px 20px; background: var(--bg-secondary); border-bottom: 1px solid var(--border); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        .posts-table__row { display: grid; grid-template-columns: 1fr auto auto auto; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--border); align-items: center; transition: background 0.2s; }
        .posts-table__row:last-child { border-bottom: none; }
        .posts-table__row:hover { background: var(--bg-secondary); }
        .posts-table__post { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .posts-table__title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s; }
        .posts-table__title:hover { color: var(--accent-green); }
        .posts-table__stats { display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
        .posts-table__stats span { display: flex; align-items: center; gap: 4px; }
        .posts-table__date { font-size: 12px; white-space: nowrap; }
        .posts-table__actions { display: flex; gap: 6px; }
        .tbl-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); border: 1px solid var(--border); background: none; cursor: pointer; transition: var(--transition); color: var(--text-muted); }
        .tbl-btn--edit:hover { color: var(--accent-blue); border-color: var(--accent-blue); background: rgba(68,136,255,0.08); }
        .tbl-btn--delete:hover { color: var(--accent-orange); border-color: var(--accent-orange); background: rgba(255,100,68,0.08); }
        @media (max-width: 768px) { .dash-stats { grid-template-columns: repeat(2, 1fr); } .posts-table__header { grid-template-columns: 1fr auto; } .posts-table__row { grid-template-columns: 1fr auto; } .posts-table__stats, .posts-table__date { display: none; } }
      `}</style>
    </div>
  );
};

export default Dashboard;