import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import background from "./bg1.jpg";

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/customers", formData);
      setMessage("✅ Customer registered successfully!");
      setFormData({ name: "", email: "", phone: "" });
      setTimeout(() => navigate("/customer-login"), 1500);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage("❌ " + error.response.data.error);
      } else {
        setMessage("❌ Failed to register customer.");
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "20px",
          borderRadius: "8px",
          width: "900px", // Adjust the width as needed
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          position: "relative",
          top: "-90px", // Moves form upwards
          

        }}
      >
        <h2 style={{ textAlign: "center" }}>Customer Registration</h2>

        {message && (
          <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>
            {message}
          </p>
        )}

        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "8px 0",
            boxSizing: "border-box",
          }}
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "8px 0",
            boxSizing: "border-box",
          }}
        />

        <label htmlFor="phone">Phone:</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "8px 0",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "crimson",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Register
        </button>

        <button
          type="button"
          onClick={() => navigate("/customer-login")}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Already a Customer? Login Here
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
