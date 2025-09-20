// components/Customer/CustomerInbox.js
import React, { useState } from "react";
import { Link } from "react-router-dom";

function CustomerInbox() {
  const [conversations] = useState([
    { id: 1, vendor: "TechWorld", lastMessage: "Your order has shipped", unread: true },
    { id: 2, vendor: "Fashion Hub", lastMessage: "New arrivals in store!", unread: false },
  ]);

  return (
    <div className="container py-4">
      <h3 className="mb-4">Messages</h3>
      <div className="list-group shadow-sm">
        {conversations.map((c) => (
          <Link
            key={c.id}
            to={`/customer/inbox/${c.id}`}
            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
              c.unread ? "fw-bold" : ""
            }`}
          >
            <div>
              <i className="fa fa-store me-2 text-muted"></i>
              {c.vendor}
              <div className="small text-muted">{c.lastMessage}</div>
            </div>
            {c.unread && <span className="badge bg-danger rounded-pill">New</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CustomerInbox;
