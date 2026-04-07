import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../services/api";
import { FiSave, FiEye, FiEdit3, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

const CATEGORIES = ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Monitoring", "Security", "Other"];

const CreateBlog = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: [],
    coverImage: "",
    excerpt: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ FIXED addTag function
  const addTag = (e) => {
    try {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        e.stopPropagation();
        const tag = tagInput.trim().replace(/^#/, "");
        if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
          setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
        }
        setTagInput("");
      }
    } catch (err) {
      console.error("Tag error:", err);
    }
  };

  const removeTag = (tag) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

  // ✅ FIXED handleSubmit - doesn't depend on form event
  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.content.trim()) return toast.error("Content is required");
    if (!form.category) return toast.error("Category is required");
    setLoading(true);
    try {
      const res = await createBlog(form);
      toast.success("Post published successfully!");
      navigate(`/blog/${res.data.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container editor-page">
        {/* Header */}
        <div className="editor-header">
          <div>
            <h1 className="editor-title">Write a Post</h1>
            <p className="text-secondary" style={{ fontSize: "13px" }}>
              Share your DevOps knowledge with the community
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className={`btn btn-outline btn-sm ${preview ? "active-preview" : ""}`}
              onClick={() => setPreview((p) => !p)}
            >
              {preview ? <><FiEdit3 size={14} /> Edit</> : <><FiEye size={14} /> Preview</>}
            </button>
            {/* ✅ FIXED - onClick directly calls handleSubmit */}
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              <FiSave size={14} /> {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        <div className="editor-layout">
          {/* Main Editor */}
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
                  <span className="char-count">{form.title.length}/120</span>
                </div>

                <div className="form-group">
                  <label>
                    Excerpt{" "}
                    <span className="text-muted">(optional — auto-generated if empty)</span>
                  </label>
                  <textarea
                    name="excerpt"
                    className="form-control"
                    placeholder="Brief description shown on the blog card..."
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={2}
                    maxLength={300}
                  />
                </div>

                <div className="form-group">
                  <div className="editor-toolbar">
                    <label>Content <span className="text-muted">(Markdown supported)</span></label>
                    <div className="toolbar-hints">
                      {["# H1", "## H2", "**bold**", "`code`", "```block```", "> quote"].map((hint) => (
                        <button
                          key={hint}
                          type="button"
                          className="toolbar-hint"
                          onClick={() =>
                            setForm((f) => ({ ...f, content: f.content + "\n" + hint + " " }))
                          }
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    name="content"
                    className="form-control editor-textarea"
                    placeholder={`Write in Markdown...\n\n# Getting Started with Docker\n\nDocker is a platform for containerizing applications...\n\n\`\`\`bash\ndocker run -d -p 80:80 nginx\n\`\`\``}
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
                    {form.content || "*Nothing to preview yet...*"}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
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
                <label>Tags <span className="text-muted">(up to 5)</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type tag then press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
                {form.tags.length > 0 && (
                  <div className="tags-container">
                    {form.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          type="button"
                        >
                          <FiX size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Cover Image URL <span className="text-muted">(optional)</span></label>
                <input
                  type="url"
                  name="coverImage"
                  className="form-control"
                  placeholder="https://..."
                  value={form.coverImage}
                  onChange={handleChange}
                />
                {form.coverImage && (
                  <img
                    src={form.coverImage}
                    alt="cover preview"
                    className="cover-preview"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-heading">Markdown Guide</h4>
              <div className="markdown-guide">
                {[
                  ["# Heading 1", "H1"],
                  ["## Heading 2", "H2"],
                  ["**bold**", "Bold"],
                  ["*italic*", "Italic"],
                  ["`inline code`", "Code"],
                  ["```\ncode block\n```", "Block"],
                  ["> quote", "Quote"],
                  ["- item", "List"],
                  ["[text](url)", "Link"],
                ].map(([syntax, label]) => (
                  <div key={label} className="guide-row">
                    <code className="guide-code">{syntax}</code>
                    <span className="guide-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .editor-page { padding-bottom: 80px; }
        .editor-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .editor-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .active-preview {
          border-color: var(--accent-green) !important;
          color: var(--accent-green) !important;
        }
        .editor-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          align-items: flex-start;
        }
        .editor-main { display: flex; flex-direction: column; gap: 4px; }
        .editor-title-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          padding: 12px 0;
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          outline: none;
          margin-bottom: 4px;
          transition: border-color 0.2s;
        }
        .editor-title-input:focus { border-color: var(--accent-green); }
        .editor-title-input::placeholder { color: var(--text-muted); }
        .char-count {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          display: block;
          text-align: right;
          margin-top: 4px;
        }
        .editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .toolbar-hints { display: flex; flex-wrap: wrap; gap: 6px; }
        .toolbar-hint {
          padding: 3px 8px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }
        .toolbar-hint:hover { border-color: var(--accent-green); color: var(--accent-green); }
        .editor-textarea {
          min-height: 500px;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.8;
          resize: vertical;
        }
        .preview-pane {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 40px;
          min-height: 500px;
        }
        .preview-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 28px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }
        .editor-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .sidebar-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .sidebar-heading {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .tags-container { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .tag-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: rgba(0,255,136,0.08);
          border: 1px solid rgba(0,255,136,0.2);
          border-radius: 100px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-green);
        }
        .tag-pill button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--accent-green);
          display: flex;
          align-items: center;
          padding: 0;
          opacity: 0.6;
        }
        .tag-pill button:hover { opacity: 1; }
        .cover-preview {
          margin-top: 10px;
          height: 120px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          width: 100%;
        }
        .markdown-guide { display: flex; flex-direction: column; gap: 6px; }
        .guide-row { display: flex; align-items: center; justify-content: space-between; }
        .guide-code {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-green);
          background: rgba(0,255,136,0.07);
          padding: 2px 6px;
          border-radius: 3px;
        }
        .guide-label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        @media (max-width: 900px) {
          .editor-layout { grid-template-columns: 1fr; }
          .editor-sidebar { order: -1; }
        }
      `}</style>
    </div>
  );
};

export default CreateBlog;