const asyncHandler = require("express-async-handler");
const Blog = require("../models/Blog");
const User = require("../models/User");

// @desc    Get all blogs (with filters)
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  const query = { isPublished: true };

  if (req.query.category) query.category = req.query.category;
  if (req.query.tag) query.tags = { $in: [req.query.tag] };
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate("author", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: blogs,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    },
  });
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("author", "name avatar bio")
    .populate("comments.user", "name avatar");

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  res.json({ success: true, data: blog });
});

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, tags, coverImage, excerpt } = req.body;

  if (!title || !content || !category) {
    res.status(400);
    throw new Error("Title, content, and category are required");
  }

  const blog = await Blog.create({
    title,
    content,
    category,
    tags: tags || [],
    coverImage: coverImage || "",
    excerpt,
    author: req.user._id,
  });

  await blog.populate("author", "name avatar");

  res.status(201).json({ success: true, data: blog });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this blog");
  }

  const { title, content, category, tags, coverImage, excerpt, isPublished } =
    req.body;

  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.category = category || blog.category;
  blog.tags = tags || blog.tags;
  blog.coverImage = coverImage !== undefined ? coverImage : blog.coverImage;
  blog.excerpt = excerpt || blog.excerpt;
  blog.isPublished =
    isPublished !== undefined ? isPublished : blog.isPublished;

  const updatedBlog = await blog.save();
  await updatedBlog.populate("author", "name avatar");

  res.json({ success: true, data: updatedBlog });
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this blog");
  }

  await blog.deleteOne();
  res.json({ success: true, message: "Blog deleted successfully" });
});

// @desc    Like / Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const isLiked = blog.likes.includes(req.user._id);

  if (isLiked) {
    blog.likes = blog.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    blog.likes.push(req.user._id);
  }

  await blog.save();
  res.json({ success: true, likes: blog.likes.length, isLiked: !isLiked });
});

// @desc    Add comment
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.comments.push({ user: req.user._id, text });
  await blog.save();
  await blog.populate("comments.user", "name avatar");

  const newComment = blog.comments[blog.comments.length - 1];
  res.status(201).json({ success: true, data: newComment });
});

// @desc    Get blogs by current user
// @route   GET /api/blogs/my-blogs
// @access  Private
const getMyBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ author: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, data: blogs });
});

// @desc    Save / Unsave blog
// @route   POST /api/blogs/:id/save
// @access  Private
const toggleSave = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const blogId = req.params.id;

  const isSaved = user.savedBlogs.includes(blogId);

  if (isSaved) {
    user.savedBlogs = user.savedBlogs.filter(
      (id) => id.toString() !== blogId
    );
  } else {
    user.savedBlogs.push(blogId);
  }

  await user.save();
  res.json({ success: true, isSaved: !isSaved });
});

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  getMyBlogs,
  toggleSave,
};