// components/Vendor/VendorInbox.js
import React from "react";
import { Link } from "react-router-dom";

function VendorInbox() {
  const messages = [
    { id: 1, from: "Alice", lastMessage: "Is this still available?", unread: true },
    { id: 2, from: "Bob", lastMessage: "When will my order ship?", unread: false },
  ];

  return (
    <div className="container py-5">
      <h3 className="mb-4">Inbox</h3>
      <div className="list-group shadow-sm">
        {messages.map((m) => (
          <Link
            key={m.id}
            to={`/vendor/inbox/${m.id}`}
            className={`list-group-item list-group-item-action d-flex justify-content-between ${
              m.unread ? "fw-bold" : ""
            }`}
          >
            <div>
              <i className="fa fa-user me-2 text-muted"></i>
              {m.from}
              <div className="small text-muted">{m.lastMessage}</div>
            </div>
            {m.unread && (
              <span className="badge bg-danger rounded-pill">New</span>
            )}
          </Link>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted py-5">No messages yet.</div>
        )}
      </div>
    </div>
  );
}

export default VendorInbox;
