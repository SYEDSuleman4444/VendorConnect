import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import background from "./bg1.jpg";

const VendorForm = () => {
  const [vendor, setVendor] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    latitude: "",
    longitude: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setVendor({
            ...vendor,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setMessage("\u274C Location error: " + error.message);
        }
      );
    } else {
      setMessage("\u274C Geolocation is not supported.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!vendor.name || !vendor.email || !vendor.phone || !vendor.businessName || !vendor.latitude || !vendor.longitude) {
      setMessage("\u274C Please fill all fields and get location.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/vendors", {
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        businessName: vendor.businessName,
        location: {
          latitude: parseFloat(vendor.latitude),
          longitude: parseFloat(vendor.longitude),
        },
      });

      if (response.data.vendorId) {
        setMessage("\u2705 Vendor registered successfully!");
        setVendor({ name: "", email: "", phone: "", businessName: "", latitude: "", longitude: "" });
        setTimeout(() => navigate("/vendor-login"), 1500);
      } else {
        setMessage("\u274C Error: Vendor ID missing in response.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error); // Display backend error message
      } else {
        setMessage("\u274C Failed to register vendor.");
      }
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundImage: `url(${background})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    }}>
      <div style={{
        width: "800px",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Vendor Registration</h2>
        {message && (
          <p
            style={{
              textAlign: "center",
              color: message.startsWith("\u2705") ? "green" : "red",
              marginBottom: "15px",
            }}>
            {message}
          </p>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={vendor.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={vendor.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={vendor.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={vendor.businessName}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Latitude"
            value={vendor.latitude}
            readOnly
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Longitude"
            value={vendor.longitude}
            readOnly
            style={inputStyle}
          />
          <button
            type="button"
            onClick={fetchLocation}
            style={{ ...buttonStyle, backgroundColor: "#007bff", color: "#fff" }}>
            Get Location
          </button>
          <button
            type="submit"
            style={{ ...buttonStyle, backgroundColor: "#28a745", color: "#fff" }}>
            Register Vendor
          </button>
        </form>

        <button
          onClick={() => navigate("/vendor-login")}
          style={{
            ...buttonStyle,
            backgroundColor: "crimson",
            color: "#fff",
            marginTop: "10px",
          }}>
          Already a Vendor? Login Here
        </button>
      </div>
    </div>
  );
};

const inputStyle = {
  marginBottom: "10px",
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  marginBottom: "10px",
};

export default VendorForm;