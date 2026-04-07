const mongoose = require("mongoose");

// Custom slug function
const createSlug = (title) => {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now();
};

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Docker",
        "Kubernetes",
        "AWS",
        "CI/CD",
        "Linux",
        "Terraform",
        "Monitoring",
        "Security",
        "Other",
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Using async pre-save - no next() needed
blogSchema.pre("save", async function () {
  // Generate slug
  if (this.isModified("title") && this.title) {
    this.slug = createSlug(this.title);
  }

  // Calculate read time
  if (this.isModified("content") && this.content) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200) || 1;
  }

  // Generate excerpt
  if (this.isModified("content") && !this.excerpt && this.content) {
    this.excerpt =
      this.content
        .replace(/[#*`]/g, "")
        .trim()
        .substring(0, 250) + "...";
  }
});

// Text index for search
blogSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Blog", blogSchema);