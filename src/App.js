import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import VendorOrCustomer from "./pages/VendorOrCustomer";
import VendorForm from "./pages/VendorForm";
import CustomerForm from "./pages/CustomerForm";
import VendorInterface from "./pages/VendorInterface";
import VendorLogin from "./pages/VendorLogin";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerInterface from "./pages/CustomerInterface";
import SalesExpensePage from "./pages/SalesExpensePage";
import Chat from "./pages/Chat";

// New admin components
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
// Note: The AdminLogin.css and AdminDashboard.css files are added in your project but are not imported here.

import background from "./bg1.jpg";
import Accordion from "react-bootstrap/Accordion";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* Main Content */}
      <div
        style={{
          fontFamily: "Times New Roman",
          textAlign: "center",
          padding: "20px",
          color: "#fff",
        }}
      >
        <div
          style={{
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            width: "100%",
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              marginBottom: "10px",
              color: "crimson",
              fontSize: 80,
            }}
          >
            Welcome to <br />
            <strong>Vendor Connect</strong>
          </h1>
          <p
            style={{
              fontSize: "25px",
              color: "black",
              marginBottom: "20px",
              lineHeight: "1.5",
            }}
          >
            Connecting Vendors & Customers together.
          </p>
          <button
            style={{
              padding: "20px 30px",
              fontSize: "26px",
              color: "black",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#d3d3d3";
              e.target.style.color = "black";
              e.target.style.transform = "scale(1.1)";
              e.target.style.fontWeight = "bold";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#fff";
              e.target.style.transform = "scale(1)";
              e.target.style.fontWeight = "normal";
            }}
            onClick={() => navigate("/start-here")}
          >
            Let's start!
          </button>
        </div>

        {/* Accordion Section */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "rgba(248, 246, 246, 0.8)",
            borderRadius: "10px",
            transform: "none",
          }}
        >
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header
                style={{
                  fontFamily: "fantasy",
                  fontSize: "1.5rem",
                  color: "crimson",
                  transform: "scale(0.9)",
                }}
              >
                About Vendor Connect
              </Accordion.Header>
              <Accordion.Body
                style={{
                  fontSize: "1.2rem",
                  lineHeight: "1.8",
                  backgroundColor: "IndianRed",
                  color: "white",
                }}
              >
                In India, roadside vendors are a cornerstone of the economy...
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => (
  <nav
    style={{
      display: "flex",
      justifyContent: "space-around",
      padding: "20px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      border: "2px solid #DAA520",
      borderRadius: "20px",
    }}
  >
    <Link
      to="/"
      style={{
        textDecoration: "none",
        color: "black",
        fontWeight: "bold",
        fontSize: "18px",
        padding: "10px 20px",
        transition: "all 0.3s ease",
        border: "2px solid transparent",
        borderRadius: "50px",
      }}
      onMouseOver={(e) => {
        e.target.style.border = "2px solid crimson";
        e.target.style.borderRadius = "50px";
      }}
      onMouseOut={(e) => {
        e.target.style.border = "2px solid transparent";
      }}
    >
      Home
    </Link>
    <Link
      to="/about"
      style={{
        textDecoration: "none",
        color: "black",
        fontWeight: "bold",
        fontSize: "18px",
        padding: "10px 20px",
        transition: "all 0.3s ease",
        border: "2px solid transparent",
        borderRadius: "50px",
      }}
      onMouseOver={(e) => {
        e.target.style.border = "2px solid crimson";
        e.target.style.borderRadius = "50px";
      }}
      onMouseOut={(e) => {
        e.target.style.border = "2px solid transparent";
      }}
    >
      About Us
    </Link>
    <Link
      to="/contact"
      style={{
        textDecoration: "none",
        color: "black",
        fontWeight: "bold",
        fontSize: "18px",
        padding: "10px 20px",
        transition: "all 0.3s ease",
        border: "2px solid transparent",
        borderRadius: "50px",
      }}
      onMouseOver={(e) => {
        e.target.style.border = "2px solid crimson";
        e.target.style.borderRadius = "50px";
      }}
      onMouseOut={(e) => {
        e.target.style.border = "2px solid transparent";
      }}
    >
      Contact Us
    </Link>
    {/* New link for Admin Login */}
    <Link
      to="/admin-login"
      style={{
        textDecoration: "none",
        color: "black",
        fontWeight: "bold",
        fontSize: "18px",
        padding: "10px 20px",
        transition: "all 0.3s ease",
        border: "2px solid transparent",
        borderRadius: "50px",
      }}
      onMouseOver={(e) => {
        e.target.style.border = "2px solid crimson";
        e.target.style.borderRadius = "50px";
      }}
      onMouseOut={(e) => {
        e.target.style.border = "2px solid transparent";
      }}
    >
      Admin
    </Link>
  </nav>
);

const Footer = () => (
  <footer
    style={{
      padding: "20px",
      textAlign: "center",
      color: "#333",
      fontFamily: "'Arial', sans-serif",
      marginTop: "40px",
      fontSize: "20px",
    }}
  >
    <hr />
    © 2025 VendorConnect.
    <br />
    All rights reserved.
  </footer>
);

const App = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
    });

    return () => newSocket.disconnect();
  }, []);

  return (
    <Router>
      <div
        style={{
          backgroundImage: `url(${background})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/start-here" element={<VendorOrCustomer />} />

          {/* Vendor Routes */}
          <Route path="/vendor-register" element={<VendorForm />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/vendor-interface" element={<VendorInterface socket={socket} />} />

          {/* Customer Routes */}
          <Route path="/customer-register" element={<CustomerForm />} />
          <Route path="/customer-interface" element={<CustomerInterface socket={socket} />} />

          {/* Sales & Expense Page */}
          <Route path="/sales-expense" element={<SalesExpensePage />} />

          {/* Chat Route */}
          <Route path="/chat" element={<Chat socket={socket} />} />

          {/* New Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard socket={socket} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;