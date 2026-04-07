const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  getMyBlogs,
  toggleSave,
} = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getBlogs);
router.get("/my-blogs", protect, getMyBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.post("/:id/save", protect, toggleSave);

module.exports = router;