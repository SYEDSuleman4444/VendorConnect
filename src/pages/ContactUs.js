import React from "react";
import background from "./bg1.jpg";
const ContactUs = () => {
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
        fontSize: "30px",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1>Contact Us</h1>
      <p style={{ maxWidth: "600px", lineHeight: "1.6" }}>
        Have questions or need support? We'd love to hear from you!
      </p>
      <p style={{ marginTop: "20px" }}>
        <strong>Email:</strong> support@vendorconnect.com
        <br />
        <strong>Phone:</strong> +91 12345 67890
        <br />
        <strong>Address:</strong> Vendor Connect Head Quarters, Road No. 03, Banjara Hills, Hyderabad
      </p>
    </div>
  );
};

export default ContactUs;