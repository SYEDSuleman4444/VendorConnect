import React, { useState, useEffect } from "react";

const Chat = ({ socket, senderId, receiverId }) => {
  const [message, setMessage] = useState(""); // Current message being typed
  const [messages, setMessages] = useState([]); // List of messages
  const [loadingHistory, setLoadingHistory] = useState(false); // Loading state for chat history

  useEffect(() => {
    if (socket) {

        // Register senderId with the server (optional for robustness)
      socket.emit("registerUser", senderId);


      // Listen for incoming messages from the server
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      // Optionally, load chat history when component mounts
      const fetchChatHistory = async () => {
        setLoadingHistory(true); // Start loading spinner
        try {
          const response = await fetch(
            `http://localhost:5000/api/chats?senderId=${senderId}&receiverId=${receiverId}`
          );
          const data = await response.json();
          setMessages(data); // Populate with chat history
        } catch (error) {
          console.error("Failed to fetch chat history:", error);
        } finally {
            setLoadingHistory(false); // Stop loading spinner
          }
      };

      fetchChatHistory();
    }

    // Cleanup listener when component unmounts
    return () => {
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [socket, senderId, receiverId]);

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      // Emit the message to the server
      const newMessage = {
        senderId,
        receiverId,
        message,
      };

      socket.emit("sendMessage", newMessage);

      // Append the message to the local UI
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage(""); // Clear the input field
    } else {
        console.error("Message is empty or socket is not available");
        alert("Please type a message before sending.");
      }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2>Chat</h2>

      {/* Chat History */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              textAlign: msg.senderId === senderId ? "right" : "left",
            }}
          >
            <p
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: msg.senderId === senderId ? "#d1ffd6" : "#f1f1f1",
                maxWidth: "70%",
              }}
            >
              {msg.message}
            </p>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;