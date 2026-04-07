import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlogBySlug, toggleLike, addComment, deleteBlog, toggleSave } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FiHeart, FiEye, FiClock, FiEdit3, FiTrash2, FiBookmark,
  FiMessageCircle, FiArrowLeft, FiShare2, FiSend,
} from "react-icons/fi";
import toast from "react-hot-toast";

const categoryClass = {
  Docker: "badge-docker", Kubernetes: "badge-kubernetes", AWS: "badge-aws",
  "CI/CD": "badge-cicd", Linux: "badge-linux", Terraform: "badge-terraform",
  Monitoring: "badge-monitoring", Security: "badge-security", Other: "badge-other",
};

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getBlogBySlug(slug);
        const b = res.data.data;
        setBlog(b);
        setLikeCount(b.likes?.length || 0);
        if (user) {
          setLiked(b.likes?.includes(user._id));
          setSaved(user.savedBlogs?.some((s) => s === b._id || s._id === b._id));
        }
      } catch {
        toast.error("Post not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug, user, navigate]);

  const handleLike = async () => {
    if (!user) return toast.error("Sign in to like posts");
    try {
      const res = await toggleLike(blog._id);
      setLiked(res.data.isLiked);
      setLikeCount(res.data.likes);
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleSave = async () => {
    if (!user) return toast.error("Sign in to save posts");
    try {
      const res = await toggleSave(blog._id);
      setSaved(res.data.isSaved);
      toast.success(res.data.isSaved ? "Post saved!" : "Post unsaved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBlog(blog._id);
      toast.success("Post deleted");
      navigate("/");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in to comment");
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await addComment(blog._id, { text: comment });
      setBlog((b) => ({ ...b, comments: [...b.comments, res.data.data] }));
      setComment("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <div className="page-wrapper"><div className="spinner" /></div>;
  if (!blog) return null;

  const isAuthor = user?._id === blog.author?._id || user?.role === "admin";
  const badgeClass = categoryClass[blog.category] || "badge-other";

  return (
    <div className="page-wrapper">
      <div className="container blog-detail">
        {/* Back */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={15} /> Back
        </button>

        {/* Cover */}
        {blog.coverImage && (
          <div className="blog-detail__cover">
            <img src={blog.coverImage} alt={blog.title} />
          </div>
        )}

        <div className="blog-detail__layout">
          {/* Article */}
          <article className="blog-detail__main animate-in">
            {/* Meta */}
            <div className="blog-meta">
              <span className={`badge ${badgeClass}`}>{blog.category}</span>
              <span className="blog-meta__sep">·</span>
              <span className="blog-meta__item"><FiClock size={12} /> {blog.readTime} min read</span>
              <span className="blog-meta__sep">·</span>
              <span className="blog-meta__item"><FiEye size={12} /> {blog.views} views</span>
              <span className="blog-meta__sep">·</span>
              <span className="blog-meta__item">
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="blog-detail__title">{blog.title}</h1>

            {/* Author */}
            <div className="blog-author">
              <div className="blog-author__avatar">
                {blog.author?.avatar ? (
                  <img src={blog.author.avatar} alt={blog.author.name} />
                ) : (
                  <span>{blog.author?.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="blog-author__name">{blog.author?.name}</p>
                {blog.author?.bio && (
                  <p className="blog-author__bio">{blog.author.bio}</p>
                )}
              </div>
              {isAuthor && (
                <div className="blog-author__actions">
                  <Link to={`/edit/${blog.slug}`} className="btn btn-outline btn-sm">
                    <FiEdit3 size={13} /> Edit
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                    <FiTrash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Content */}
            <div className="blog-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="blog-tags">
                {blog.tags.map((tag) => (
                  <Link key={tag} to={`/?tag=${tag}`} className="blog-tag">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="blog-actions">
              <button
                className={`action-btn ${liked ? "active-like" : ""}`}
                onClick={handleLike}
              >
                <FiHeart size={18} />
                <span>{likeCount}</span>
              </button>
              <button
                className="action-btn"
                onClick={() =>
                  document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <FiMessageCircle size={18} />
                <span>{blog.comments?.length || 0}</span>
              </button>
              <button
                className={`action-btn ${saved ? "active-save" : ""}`}
                onClick={handleSave}
              >
                <FiBookmark size={18} />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>
              <button className="action-btn" onClick={handleShare}>
                <FiShare2 size={18} />
                <span>Share</span>
              </button>
            </div>

            {/* Comments */}
            <section id="comments" className="comments-section">
              <h3 className="comments-title">
                <FiMessageCircle size={18} />
                {blog.comments?.length || 0} Comments
              </h3>

              {user ? (
                <form onSubmit={handleComment} className="comment-form">
                  <div className="comment-form__avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="comment-form__input-wrap">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={submittingComment || !comment.trim()}
                    >
                      <FiSend size={13} /> Post
                    </button>
                  </div>
                </form>
              ) : (
                <div className="comment-signin">
                  <Link to="/login" className="btn btn-outline btn-sm">
                    Sign in to comment
                  </Link>
                </div>
              )}

              <div className="comments-list">
                {blog.comments?.length === 0 && (
                  <p className="text-muted" style={{ textAlign: "center", padding: "32px 0", fontSize: "14px" }}>
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
                {[...blog.comments].reverse().map((c) => (
                  <div key={c._id} className="comment-item">
                    <div className="comment-avatar">
                      {c.user?.avatar ? (
                        <img src={c.user.avatar} alt={c.user.name} />
                      ) : (
                        <span>{c.user?.name?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-name">{c.user?.name || "Anonymous"}</span>
                        <span className="comment-date">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="comment-text">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="blog-detail__sidebar">
            <div className="sidebar-card">
              <p className="sidebar-card__label">Written by</p>
              <div className="sidebar-author">
                <div className="sidebar-author__avatar">
                  {blog.author?.avatar ? (
                    <img src={blog.author.avatar} alt={blog.author.name} />
                  ) : (
                    <span>{blog.author?.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="sidebar-author__name">{blog.author?.name}</p>
                  {blog.author?.bio && (
                    <p className="sidebar-author__bio">{blog.author.bio}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <p className="sidebar-card__label">Post Stats</p>
              <div className="stats-grid">
                {[
                  [blog.views, "Views", <FiEye size={14} />],
                  [likeCount, "Likes", <FiHeart size={14} />],
                  [blog.comments?.length || 0, "Comments", <FiMessageCircle size={14} />],
                  [blog.readTime + " min", "Read Time", <FiClock size={14} />],
                ].map(([val, label, icon]) => (
                  <div key={label} className="stat-item">
                    <span className="stat-icon">{icon}</span>
                    <span className="stat-val">{val}</span>
                    <span className="stat-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {blog.tags?.length > 0 && (
              <div className="sidebar-card">
                <p className="sidebar-card__label">Tags</p>
                <div className="blog-tags">
                  {blog.tags.map((tag) => (
                    <Link key={tag} to={`/?tag=${tag}`} className="blog-tag">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .blog-detail { padding-bottom: 80px; }
        .back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-family: var(--font-mono); font-size: 12px; padding: 8px 0; margin-bottom: 24px; transition: color 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
        .back-btn:hover { color: var(--accent-green); }
        .blog-detail__cover { height: 400px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 40px; border: 1px solid var(--border); }
        .blog-detail__cover img { width: 100%; height: 100%; object-fit: cover; }
        .blog-detail__layout { display: grid; grid-template-columns: 1fr 280px; gap: 40px; align-items: flex-start; }
        .blog-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .blog-meta__sep { color: var(--text-muted); }
        .blog-meta__item { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
        .blog-detail__title { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 28px; }
        .blog-author { display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap; }
        .blog-author__avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-green), var(--accent-blue)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 16px; color: #000; overflow: hidden; flex-shrink: 0; border: 2px solid var(--border-glow); }
        .blog-author__avatar img { width: 100%; height: 100%; object-fit: cover; }
        .blog-author__name { font-weight: 600; font-size: 14px; }
        .blog-author__bio { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .blog-author__actions { display: flex; gap: 8px; margin-left: auto; }
        .blog-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; }
        .blog-tag { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border); padding: 4px 10px; border-radius: 4px; transition: var(--transition); }
        .blog-tag:hover { color: var(--accent-green); border-color: var(--accent-green); }
        .blog-actions { display: flex; align-items: center; gap: 8px; margin-top: 40px; padding: 20px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .action-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; cursor: pointer; transition: var(--transition); }
        .action-btn:hover { border-color: var(--border-glow); color: var(--text-primary); }
        .active-like { color: #ff6680 !important; border-color: #ff6680 !important; background: rgba(255, 80, 100, 0.08) !important; }
        .active-save { color: var(--accent-blue) !important; border-color: var(--accent-blue) !important; background: rgba(68, 136, 255, 0.08) !important; }
        .comments-section { margin-top: 48px; }
        .comments-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .comment-form { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 32px; }
        .comment-form__avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-green), var(--accent-blue)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 13px; color: #000; overflow: hidden; flex-shrink: 0; }
        .comment-form__avatar img { width: 100%; height: 100%; object-fit: cover; }
        .comment-form__input-wrap { flex: 1; display: flex; gap: 10px; align-items: center; }
        .comment-form__input-wrap .form-control { flex: 1; }
        .comment-signin { margin-bottom: 24px; }
        .comments-list { display: flex; flex-direction: column; gap: 20px; }
        .comment-item { display: flex; gap: 12px; }
        .comment-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 12px; overflow: hidden; flex-shrink: 0; }
        .comment-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .comment-body { flex: 1; }
        .comment-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .comment-name { font-weight: 600; font-size: 13px; }
        .comment-date { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
        .comment-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .blog-detail__sidebar { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 16px; }
        .sidebar-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
        .sidebar-card__label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin-bottom: 14px; }
        .sidebar-author { display: flex; align-items: flex-start; gap: 12px; }
        .sidebar-author__avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-green), var(--accent-blue)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 15px; color: #000; overflow: hidden; flex-shrink: 0; }
        .sidebar-author__avatar img { width: 100%; height: 100%; object-fit: cover; }
        .sidebar-author__name { font-weight: 600; font-size: 13px; }
        .sidebar-author__bio { font-size: 12px; color: var(--text-muted); margin-top: 3px; line-height: 1.5; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 8px; }
        .stat-icon { color: var(--accent-green); }
        .stat-val { font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; }
        .stat-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--text-muted); }
        @media (max-width: 900px) { .blog-detail__layout { grid-template-columns: 1fr; } .blog-detail__sidebar { position: static; } .blog-detail__cover { height: 220px; } }
      `}</style>
    </div>
  );
};

export default BlogDetails;