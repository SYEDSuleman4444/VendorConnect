import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Using full URL to your server endpoint:
      const response = await fetch("http://localhost:5000/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin-dashboard");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Error during admin login:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} style={{ display: "inline-block", width: "300px" }}>
        <input
          type="text"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "crimson",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

export default AdminLogin;