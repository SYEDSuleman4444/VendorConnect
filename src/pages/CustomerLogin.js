import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/customer-login", {
        email: email.trim(),
        name: name.trim(),
      });

      if (response.data && response.data.customer) {
        const customerId = response.data.customer._id;
        console.log("✅ Customer ID stored:", customerId);
        localStorage.setItem("customerId", customerId);
        navigate("/customer-interface");
      } else {
        setError("❌ Login failed. Customer not found.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      setError(error.response?.data?.error || "❌ Login failed. Try again.");
    }
  };

  // Inline styles
  const containerStyle = {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  };

  const formStyle = {
    display: "inline-block",
    textAlign: "left",
    backgroundColor: "#f9f9f9",
    padding: "20px",
    width: "500px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const errorStyle = {
    color: "red",
    marginTop: "10px",
  };

  return (
    <div style={containerStyle}>
      <h1>Customer Login</h1>
      <form onSubmit={handleLogin} style={formStyle}>
        <label style={labelStyle}>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <label style={labelStyle}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Login
        </button>
      </form>
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
};

export default CustomerLogin;
