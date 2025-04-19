import React from "react";
import background from "./bg1.jpg";

const AboutUs = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "'Times New Roman', sans-serif",
        color: "black",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      {/* Main Heading */}
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "20px",
          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)",
        }}
      >
        About Us
      </h1>

      {/* Description Section */}
      <p
        style={{
          maxWidth: "800px",
          fontSize: "1.2rem",
          lineHeight: "1.8",
          marginBottom: "30px",
        }}
      >
        Welcome to <strong>Vendor Connect</strong>, India’s first platform that
        bridges the gap between vendors and customers. Our mission is to
        empower vendors by solving their daily challenges and providing them
        with tools to grow their businesses. Our platform leverages Artificial
        Intelligence-based recommendations to power businesses. Whether you're
        a vendor looking to expand or a customer seeking reliable services,
        'Vendor Connect' is your one-stop solution.
      </p>

      {/* Developers Section */}
      <h2
        style={{
          fontSize: "2.5rem",
          marginBottom: "20px",
          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)",
        }}
      >
        Developers 👨🏻‍💻
      </h2>

      {/* Grid Layout for Developer Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "50px",
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        {/* Developer 1 */}
        <div
          style={{
            backgroundColor: '#FAE5D3',
            padding: "20px",
            cursor: "pointer",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
          }}
        >
          <h3 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
            <strong>Mohammed Afnan Sabir</strong>
          </h3>
          <p style={{ fontSize: "1rem", lineHeight: "1.5" }}>
            Afnan is a seasoned developer with a no-nonsense attitude. He's
            worked on numerous projects and has a deep understanding of
            software development principles. He is often sought out by junior
            developers for guidance.
          </p>
          <p>
            <strong>Strengths:</strong> Technical expertise, problem-solving,
            mentoring.
          </p>
        </div>

        {/* Developer 2 */}
        <div
          style={{
            backgroundColor: '#FAE5D3',
            padding: "20px",
            cursor: "pointer",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
          }}
        >
          <h3 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
            <strong>Mohammed Matheen Baba</strong>
          </h3>
          <p style={{ fontSize: "1rem", lineHeight: "1.5" }}>
            Matheen is a creative and innovative developer who loves to
            experiment with new technologies. He is a genius and is always looking for ways to
            improve his skills and is not afraid to take risks.
          </p>
          <p>
            <strong>Strengths:</strong> Creativity, adaptability, enthusiasm.
          </p>
        </div>

        {/* Developer 3 */}
        <div
          style={{
            backgroundColor: '#FAE5D3',
            padding: "20px",
            cursor: "pointer",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
          }}
        >
          <h3 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
            <strong>Syed Suleman Uddin Farhad</strong>
          </h3>
          <p style={{ fontSize: "1rem", lineHeight: "1.5" }}>
            Suleman is a quiet and reserved developer who is deeply passionate
            about machine learning and data science. He's a master of his
            domain and is often sought out by colleagues for his expertise.
          </p>
          <p>
            <strong>Strengths:</strong> Technical expertise, attention to
            detail, analytical skills.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;