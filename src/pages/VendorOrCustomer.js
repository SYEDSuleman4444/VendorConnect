import React from "react";
import { useNavigate } from "react-router-dom";
import background from "./bg1.jpg";

const VendorOrCustomer = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "cursive",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1>Are you a Vendor or a Customer?</h1>
      <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
        
        {/* Vendor Button */}
        <button
          style={{
            fontFamily: "cursive",
            padding: "10px 20px",
            fontSize: "26px",
            color: "#fff",
            backgroundColor: "#28a745",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#218838";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#28a745";
            e.target.style.transform = "scale(1)";
          }}
          onClick={() => navigate("/vendor-register")} // ✅ Fixed Route
        >
          I am a Vendor 👨🏼‍🔧🛒
        </button>

        {/* Customer Button */}
        <button
          style={{
            fontFamily: "cursive",
            padding: "10px 20px",
            fontSize: "26px",
            color: "#fff",
            backgroundColor: "#17a2b8",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#117a8b";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#17a2b8";
            e.target.style.transform = "scale(1)";
          }}
          onClick={() => navigate("/customer-register")} // ✅ Fixed Route
        >
          I am a Customer 🏷️🛍️
        </button>
      </div>
    </div>
  );
};

export default VendorOrCustomer;
