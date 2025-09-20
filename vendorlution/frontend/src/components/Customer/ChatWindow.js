// components/Customer/ChatWindow.js
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import logo from "../../logo.png";

function ChatWindow() {
  const { id } = useParams(); // get conversation id from URL
  const [messages, setMessages] = useState([
    { id: 1, sender: "vendor", text: "Hello! Your order is confirmed ✅", time: "10:40 AM" },
    { id: 2, sender: "buyer", text: "Thanks! When will it ship?", time: "10:42 AM" },
    { id: 3, sender: "vendor", text: "It has already shipped 🚚", time: "10:45 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    const msg = {
      id: messages.length + 1,
      sender: "buyer",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-3 border-bottom pb-2">
        <Link to="/customer/inbox" className="btn btn-sm btn-outline-dark me-3">
          <i className="fa fa-arrow-left"></i>
        </Link>
        <img
          src={logo}
          alt="Vendor"
          width="40"
          height="40"
          className="rounded-circle me-2 border"
        />
        <h6 className="mb-0">Chat with Vendor #{id}</h6>
      </div>

      {/* Messages */}
      <div className="card shadow-sm border-0 mb-3" style={{ height: "400px", overflowY: "auto" }}>
        <div className="card-body d-flex flex-column gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex ${msg.sender === "buyer" ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`p-2 rounded-3 ${msg.sender === "buyer" ? "bg-dark text-white" : "bg-light border"}`}
                style={{ maxWidth: "75%" }}
              >
                <p className="mb-1 small">{msg.text}</p>
                <small className="text-muted">{msg.time}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn btn-dark" onClick={handleSend}>
          <i className="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
