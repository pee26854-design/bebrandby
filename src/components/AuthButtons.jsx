import React from "react";
import { useNavigate } from "react-router-dom";

export default function AuthButtons() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4">
      <button
        onClick={() => navigate("/register")}
        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
      >
        Register
      </button>
      <button
        onClick={() => navigate("/login")}
        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
      >
        Login
      </button>
    </div>
  );
}