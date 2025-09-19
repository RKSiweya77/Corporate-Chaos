import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import logo from "../../logo.png";

// Mock conversations (replace with API later)
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    vendorName: "TechWorld Store",
    vendorSlug: "techworld",
    lastMessage: "Your order has been shipped!",
    time: "2h ago",
  },
  {
    id: 2,
    vendorName: "Fashion Hub",
    vendorSlug: "fashion-hub",
    lastMessage: "Yes, we still have size M available.",
    time: "1d ago",
  },
];

function CustomerInbox() {
  const { vendor_id } = useParams();
  const [activeChat, setActiveChat] = useState(
    vendor_id ? Number(vendor_id) : null
  );

  const handleSelectChat = (id) => {
    setActiveChat(id);
  };

  const activeVendor = MOCK_CONVERSATIONS.find((c) => c.id === activeChat);

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar: list of conversations */}
        <div className="col-md-4 border-end">
          <h5 className="mb-3">Conversations</h5>
          <ul className="list-group">
            {MOCK_CONVERSATIONS.map((c) => (
              <li
                key={c.id}
                className={`list-group-item d-flex justify-content-between align-items-start ${
                  activeChat === c.id ? "active" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleSelectChat(c.id)}
              >
                <div className="me-auto">
                  <div className="fw-bold">{c.vendorName}</div>
                  <small className="text-muted">{c.lastMessage}</small>
                </div>
                <span className="badge bg-light text-dark">{c.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Main chat window */}
        <div className="col-md-8">
          {activeVendor ? (
            <div className="d-flex flex-column h-100">
              {/* Chat header */}
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <div className="d-flex align-items-center">
                  <img
                    src={logo}
                    alt={activeVendor.vendorName}
                    className="rounded-circle me-2"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <h6 className="mb-0">{activeVendor.vendorName}</h6>
                </div>
                <Link
                  to={`/vendor/store/${activeVendor.vendorSlug}/${activeVendor.id}`}
                  className="btn btn-sm btn-outline-dark"
                >
                  View Store
                </Link>
              </div>

              {/* Messages */}
              <div
                className="flex-grow-1 mb-2 p-2 border rounded bg-light"
                style={{ minHeight: "250px" }}
              >
                <p>
                  <strong>{activeVendor.vendorName}</strong>: Hello, how can I
                  help you?
                </p>
                <p>
                  <strong>You:</strong> I wanted to ask about my order.
                </p>
              </div>

              {/* Input */}
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                />
                <button className="btn btn-dark" type="button">
                  Send
                </button>
              </div>
            </div>
          ) : (
            <p className="text-muted">
              Select a conversation to start chatting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerInbox;
