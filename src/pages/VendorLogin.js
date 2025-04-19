import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/vendor-login", {
        email: email.trim(),
        name: name.trim(),
      });

      if (response.data && response.data.vendor) {
        const vendorId = response.data.vendor._id;
        console.log("✅ Vendor ID stored:", vendorId);
        localStorage.setItem("vendorId", vendorId);
        navigate("/vendor-interface");
      } else {
        setError("❌ Login failed. Vendor not found.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      setError(error.response?.data?.error || "❌ Login failed. Try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Vendor Login</h2>

        {error && (
          <p
            style={{
              color: "#d9534f",
              backgroundColor: "#f8d7da",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="name"
            style={{ marginBottom: "5px", fontSize: "14px", color: "#555" }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
            }}
          />

          <label
            htmlFor="email"
            style={{ marginBottom: "5px", fontSize: "14px", color: "#555" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "10px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorLogin;