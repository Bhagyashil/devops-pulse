import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlogDetails from "./pages/BlogDetails";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import Dashboard from "./pages/Dashboard";

import "./styles.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ minHeight: "100vh" }} />;
  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/create" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
        <Route path="/edit/:slug" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#13131f",
            color: "#e8e8f0",
            border: "1px solid #1e1e35",
            fontFamily: "'Space Mono', monospace",
            fontSize: "13px",
          },
          success: { iconTheme: { primary: "#00ff88", secondary: "#000" } },
          error: { iconTheme: { primary: "#ff6644", secondary: "#000" } },
        }}
      />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;