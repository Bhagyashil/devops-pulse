import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiEye, FiClock, FiMessageCircle } from "react-icons/fi";

const categoryClass = {
  Docker: "badge-docker",
  Kubernetes: "badge-kubernetes",
  AWS: "badge-aws",
  "CI/CD": "badge-cicd",
  Linux: "badge-linux",
  Terraform: "badge-terraform",
  Monitoring: "badge-monitoring",
  Security: "badge-security",
  Other: "badge-other",
};

const coverColors = [
  "linear-gradient(135deg, #00ff88 0%, #4488ff 100%)",
  "linear-gradient(135deg, #aa66ff 0%, #4488ff 100%)",
  "linear-gradient(135deg, #ff6644 0%, #aa66ff 100%)",
  "linear-gradient(135deg, #00ddcc 0%, #00ff88 100%)",
  "linear-gradient(135deg, #ffaa00 0%, #ff6644 100%)",
  "linear-gradient(135deg, #4488ff 0%, #00ddcc 100%)",
];

const BlogCard = ({ blog, index = 0 }) => {
  const fallbackBg = coverColors[index % coverColors.length];
  const badgeClass = categoryClass[blog.category] || "badge-other";

  return (
    <article className="blog-card">
      {/* Cover */}
      <Link to={`/blog/${blog.slug}`} className="blog-card__cover">
        {blog.coverImage ? (
          <img src={blog.coverImage} alt={blog.title} loading="lazy" />
        ) : (
          <div className="blog-card__cover-fallback" style={{ background: fallbackBg }}>
            <span className="blog-card__cover-icon">{blog.category?.[0] || "D"}</span>
          </div>
        )}
        <span className={`badge ${badgeClass} blog-card__category`}>{blog.category}</span>
      </Link>

      {/* Body */}
      <div className="blog-card__body">
        <Link to={`/blog/${blog.slug}`}>
          <h3 className="blog-card__title">{blog.title}</h3>
        </Link>
        <p className="blog-card__excerpt">{blog.excerpt}</p>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="blog-card__tags">
            {blog.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="blog-card__tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="blog-card__footer">
          <div className="blog-card__author">
            <div className="blog-card__avatar">
              {blog.author?.avatar ? (
                <img src={blog.author.avatar} alt={blog.author.name} />
              ) : (
                <span>{blog.author?.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
            <div>
              <p className="blog-card__author-name">{blog.author?.name || "Anonymous"}</p>
              <p className="blog-card__date">
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="blog-card__stats">
            <span title="Read time"><FiClock size={12} /> {blog.readTime}m</span>
            <span title="Views"><FiEye size={12} /> {blog.views}</span>
            <span title="Likes"><FiHeart size={12} /> {blog.likes?.length || 0}</span>
            <span title="Comments"><FiMessageCircle size={12} /> {blog.comments?.length || 0}</span>
          </div>
        </div>
      </div>

      <style>{`
        .blog-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
        }
        .blog-card:hover {
          border-color: var(--border-glow);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }
        .blog-card__cover {
          position: relative;
          display: block;
          height: 180px;
          overflow: hidden;
        }
        .blog-card__cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .blog-card:hover .blog-card__cover img { transform: scale(1.04); }
        .blog-card__cover-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .blog-card__cover-icon {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 800;
          color: rgba(0,0,0,0.3);
        }
        .blog-card__category {
          position: absolute;
          top: 12px;
          left: 12px;
        }
        .blog-card__body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .blog-card__title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.3;
          color: var(--text-primary);
          transition: color 0.2s;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card__title:hover { color: var(--accent-green); }
        .blog-card__excerpt {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .blog-card__tag {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          transition: color 0.2s;
          cursor: pointer;
        }
        .blog-card__tag:hover { color: var(--accent-green); }
        .blog-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .blog-card__author { display: flex; align-items: center; gap: 10px; }
        .blog-card__avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 12px;
          color: #000;
          overflow: hidden;
          flex-shrink: 0;
        }
        .blog-card__avatar img { width: 100%; height: 100%; object-fit: cover; }
        .blog-card__author-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .blog-card__date {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }
        .blog-card__stats {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }
        .blog-card__stats span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </article>
  );
};

export default BlogCard;