import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogBySlug, updateBlog } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiSave, FiX, FiEye, FiEdit3 } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

const CATEGORIES = ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Monitoring", "Security", "Other"];

const EditBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [blogId, setBlogId] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "", content: "", category: "", tags: [], coverImage: "", excerpt: "",
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await getBlogBySlug(slug);
        const blog = res.data.data;
        if (blog.author._id !== user?._id && user?.role !== "admin") {
          toast.error("Not authorized to edit this post");
          navigate("/");
          return;
        }
        setBlogId(blog._id);
        setForm({
          title: blog.title,
          content: blog.content,
          category: blog.category,
          tags: blog.tags || [],
          coverImage: blog.coverImage || "",
          excerpt: blog.excerpt || "",
        });
      } catch {
        toast.error("Blog not found");
        navigate("/");
      } finally {
        setFetching(false);
      }
    };
    fetchBlog();
  }, [slug, user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, "");
      if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
        setForm({ ...form, tags: [...form.tags, tag] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) =>
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.category) {
      return toast.error("Title, content, and category are required");
    }
    setLoading(true);
    try {
      await updateBlog(blogId, form);
      toast.success("Post updated successfully!");
      navigate(`/blog/${slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="page-wrapper"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container editor-page">
        <div className="editor-header">
          <div>
            <h1 className="editor-title">Edit Post</h1>
            <p className="text-secondary" style={{ fontSize: "13px" }}>
              Update your post content and settings
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate(`/blog/${slug}`)}
            >
              <FiX size={14} /> Cancel
            </button>
            <button
              className={`btn btn-outline btn-sm ${preview ? "active-preview" : ""}`}
              onClick={() => setPreview((p) => !p)}
            >
              {preview ? <><FiEdit3 size={14} /> Edit</> : <><FiEye size={14} /> Preview</>}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              <FiSave size={14} /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="editor-layout">
          <div className="editor-main">
            {!preview ? (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="title"
                    className="editor-title-input"
                    placeholder="Post title..."
                    value={form.title}
                    onChange={handleChange}
                    maxLength={120}
                  />
                </div>
                <div className="form-group">
                  <label>Excerpt</label>
                  <textarea
                    name="excerpt"
                    className="form-control"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Content (Markdown)</label>
                  <textarea
                    name="content"
                    className="form-control editor-textarea"
                    value={form.content}
                    onChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <div className="preview-pane">
                <h1 className="preview-title">{form.title || "Untitled"}</h1>
                <div className="blog-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {form.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          <div className="editor-sidebar">
            <div className="sidebar-section">
              <h4 className="sidebar-heading">Post Settings</h4>
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  className="form-control"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Press Enter to add..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
                {form.tags.length > 0 && (
                  <div className="tags-container">
                    {form.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        #{tag}
                        <button onClick={() => removeTag(tag)} type="button">
                          <FiX size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Cover Image URL</label>
                <input
                  type="url"
                  name="coverImage"
                  className="form-control"
                  value={form.coverImage}
                  onChange={handleChange}
                />
                {form.coverImage && (
                  <img
                    src={form.coverImage}
                    alt="cover"
                    className="cover-preview"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .editor-page { padding-bottom: 80px; }
        .editor-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .editor-title { font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
        .active-preview { border-color: var(--accent-green) !important; color: var(--accent-green) !important; }
        .editor-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: flex-start; }
        .editor-main { display: flex; flex-direction: column; gap: 4px; }
        .editor-title-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--border); padding: 12px 0; font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: var(--text-primary); outline: none; margin-bottom: 4px; transition: border-color 0.2s; }
        .editor-title-input:focus { border-color: var(--accent-green); }
        .editor-title-input::placeholder { color: var(--text-muted); }
        .editor-textarea { min-height: 500px; font-family: var(--font-mono); font-size: 13px; line-height: 1.8; resize: vertical; }
        .preview-pane { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 40px; min-height: 500px; }
        .preview-title { font-family: var(--font-display); font-size: 2rem; font-weight: 800; margin-bottom: 28px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
        .editor-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .sidebar-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; }
        .sidebar-heading { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin-bottom: 16px; }
        .tags-container { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .tag-pill { display: flex; align-items: center; gap: 5px; padding: 4px 10px; background: rgba(0,255,136,0.08); border: 1px solid rgba(0,255,136,0.2); border-radius: 100px; font-family: var(--font-mono); font-size: 11px; color: var(--accent-green); }
        .tag-pill button { background: none; border: none; cursor: pointer; color: var(--accent-green); display: flex; align-items: center; padding: 0; opacity: 0.6; }
        .tag-pill button:hover { opacity: 1; }
        .cover-preview { margin-top: 10px; height: 120px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); width: 100%; }
        @media (max-width: 900px) { .editor-layout { grid-template-columns: 1fr; } .editor-sidebar { order: -1; } }
      `}</style>
    </div>
  );
};

export default EditBlog;