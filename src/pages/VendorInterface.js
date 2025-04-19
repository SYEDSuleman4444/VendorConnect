// VendorInterface.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VendorInterface.css";
import Chat from "./Chat";



const VendorInterface = ({ socket }) => {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: null });
  const [errorMessage, setErrorMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [localVendorId, setLocalVendorId] = useState(null);

  // Advanced Chat States for individual customer chats
  const [openChats, setOpenChats] = useState({});
  const [chatHistories, setChatHistories] = useState({});

  // Gemini AI Chatbot States
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotUserInput, setChatbotUserInput] = useState("");

  const navigate = useNavigate();

  // Fetch vendor details, products, and customer list when component mounts
  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      navigate("/vendor-register");
      return;
    }
    setLocalVendorId(vendorId);
    if (socket) {
      socket.emit("registerUser", vendorId);
      console.log(`🔗 Registered vendor socket for ID: ${vendorId}`);
    }
    axios
      .get(`http://localhost:5000/api/vendor/${vendorId}`)
      .then((res) => setVendor(res.data))
      .catch((err) => console.error("Error fetching vendor:", err));
    axios
      .get(`http://localhost:5000/api/products/${vendorId}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
    axios
      .get(`http://localhost:5000/api/customers-by-messages/${vendorId}`)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Error fetching customers:", err));
  }, [socket, navigate]);

  // Update vendor location periodically
  useEffect(() => {
    if (vendor) {
      const updateLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              axios
                .put(`http://localhost:5000/api/vendor-location/${vendor._id}`, {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                })
                .then((res) => console.log("Location updated:", res.data))
                .catch((err) => console.error("Error updating location:", err));
            },
            (error) => console.error("Error getting current position:", error)
          );
        }
      };
      updateLocation();
      const interval = setInterval(updateLocation, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [vendor]);

  // Handle file input and preview
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewProduct({ ...newProduct, image: e.target.files[0] });
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Add a new product
  const addProduct = async () => {
    setErrorMessage("");
    const vendorId = localStorage.getItem("vendorId");
    const priceNumber = parseFloat(newProduct.price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      setErrorMessage("Error: Price must not be less than zero.");
      return;
    }
    const duplicate = products.find(
      (p) => p.name.trim().toLowerCase() === newProduct.name.trim().toLowerCase()
    );
    if (duplicate) {
      setErrorMessage("Error: A product with this name already exists.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("vendorId", vendorId);
      formData.append("name", newProduct.name);
      formData.append("price", priceNumber);
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }
      const response = await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) => [...prev, response.data.product]);
      setNewProduct({ name: "", price: "", image: null });
      setPreviewImage(null);
    } catch (err) {
      console.error("Error adding product:", err);
      setErrorMessage("Error adding product. Please try again.");
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // ----- Advanced Chat Functions -----

  const fetchChatHistory = async (customerId) => {
    const vendorId = localStorage.getItem("vendorId");
    try {
      const response = await fetch(
        `http://localhost:5000/api/chats?senderId=${vendorId}&receiverId=${customerId}`
      );
      const data = await response.json();
      setChatHistories((prev) => ({ ...prev, [customerId]: data }));
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  const handleOpenChat = (customerId) => {
    setOpenChats((prev) => ({ ...prev, [customerId]: true }));
    if (!chatHistories[customerId]) {
      fetchChatHistory(customerId);
    }
  };

  const handleCloseChat = (customerId) => {
    setOpenChats((prev) => {
      const newState = { ...prev };
      delete newState[customerId];
      return newState;
    });
  };

  const handleSendMessage = (customerId, newMsgContent) => {
    const vendorId = localStorage.getItem("vendorId");
    const newMessage = {
      senderId: vendorId,
      receiverId: customerId,
      message: newMsgContent,
    };
    setChatHistories((prev) => ({
      ...prev,
      [customerId]: [...(prev[customerId] || []), newMessage],
    }));
    if (socket) {
      socket.emit("sendMessage", newMessage);
    }
  };

  const handleReceiveMessage = (newMessage) => {
    const vendorId = localStorage.getItem("vendorId");
    if (newMessage.receiverId === vendorId && newMessage.senderId) {
      setChatHistories((prev) => ({
        ...prev,
        [newMessage.senderId]: [...(prev[newMessage.senderId] || []), newMessage],
      }));
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", handleReceiveMessage);
      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket]);

  // ----- Gemini AI Chatbot Functions -----
  const handleChatbotInputChange = (e) => {
    setChatbotUserInput(e.target.value);
  };

  const handleChatbotSubmit = async (e) => {
    e.preventDefault();
    if (!chatbotUserInput.trim()) return;
    setChatbotMessages((prev) => [...prev, { text: chatbotUserInput, sender: "user" }]);
    const query = chatbotUserInput;
    setChatbotUserInput("");
    try {
      const vendorData = (await axios.get("http://localhost:5000/api/vendors")).data;
      const prompt = `You are a vendor assistant. Respond to vendor queries based on: ${JSON.stringify(
        vendorData
      )}. Query: ${query}`;
      const res = await axios.post("http://localhost:5000/api/gemini", { prompt });
      setChatbotMessages((prev) => [...prev, { text: res.data.response, sender: "bot" }]);
    } catch (err) {
      console.error("Gemini error:", err);
      setChatbotMessages((prev) => [...prev, { text: "Error getting AI response", sender: "bot" }]);
    }
  };

  return (
    <div className="vendor-container">
      <h1>Welcome, {vendor?.name || "Vendor"}!</h1>

      {/* Product Management Section */}
      <h2>Manage Your Products</h2>
      <div className="product-form">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {previewImage && (
          <img src={previewImage} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />
        )}
        <button onClick={addProduct}>Add Product</button>
      </div>
      {errorMessage && <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>}

      <div className="table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{ width: "80px" }} />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteProduct(product._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Chat Section */}
      <h2>Chat with Customers</h2>
      <ul className="customer-list">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <li key={customer._id} className="customer-item">
              <span>
                {customer.name} ({customer.email})
              </span>
              <button onClick={() => handleOpenChat(customer._id)}>Chat</button>
            </li>
          ))
        ) : (
          <li>No customers available.</li>
        )}
      </ul>
      <div className="chat-modals-container">
        {Object.keys(openChats).map((customerId) => (
          <div key={customerId} className="chat-modal">
            <Chat
              socket={socket}
              senderId={localVendorId}
              receiverId={customerId}
              messages={chatHistories[customerId] || []}
              onSendMessage={(msg) => handleSendMessage(customerId, msg)}
            />
            <button onClick={() => handleCloseChat(customerId)}>Close Chat</button>
          </div>
        ))}
      </div>

     
      {/* Gemini AI Chatbot Section */}
<h2 className="chatbot-header">🤖 AI Chatbot</h2>


<div className="chatbot-messages" id="chatbot-messages">
  {chatbotMessages.map((m, i) => (
    <div
      key={i}
      className={`message ${m.sender === "user" ? "vendor-message" : "bot-message"}`}
      id={`message-${i}`}
    >
      {m.text}
    </div>
  ))}
</div>
<form onSubmit={handleChatbotSubmit} className="chatbot-form">
  <input
    value={chatbotUserInput}
    onChange={handleChatbotInputChange}
    placeholder="Ask business insights..."
    className="chatbot-input"
    id="chatbot-input"
  />
  <button type="submit" className="chatbot-send-button" id="chatbot-send-btn">
    Send
  </button>
</form>

<button
  onClick={() => navigate("/sales-expense")}
  className="view-sales-button"
  id="view-sales-btn"
  style={{
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "crimson",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  View Sales & Expenses
</button>


    </div>
  );
};

export default VendorInterface;