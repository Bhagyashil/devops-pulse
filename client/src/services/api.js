import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/profile", data);

// Blogs
export const getBlogs = (params) => API.get("/blogs", { params });
export const getBlogBySlug = (slug) => API.get(`/blogs/${slug}`);
export const createBlog = (data) => API.post("/blogs", data);
export const updateBlog = (id, data) => API.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);
export const toggleLike = (id) => API.post(`/blogs/${id}/like`);
export const addComment = (id, data) => API.post(`/blogs/${id}/comments`, data);
export const getMyBlogs = () => API.get("/blogs/my-blogs");
export const toggleSave = (id) => API.post(`/blogs/${id}/save`);

export default API;