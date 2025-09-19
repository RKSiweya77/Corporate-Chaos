import React, { useEffect, useMemo, useRef, useState } from "react";
import VendorSidebar from "./VendorSidebar";

function VendorInbox() {
  // --- Mock conversations (replace with API later) ---
  const [conversations, setConversations] = useState([
    {
      id: 1,
      customer: "Jane Smith",
      updatedAt: "2025-09-18T13:45:00Z",
      unread: 2,
      messages: [
        {
          id: "m1",
          from: "customer",
          text: "Hi, is the Second-Hand Laptop still available?",
          time: "2025-09-18T12:30:00Z",
        },
        {
          id: "m2",
          from: "vendor",
          text: "Yes, it’s available 🙌",
          time: "2025-09-18T12:35:00Z",
        },
        {
          id: "m3",
          from: "customer",
          text: "Great, can I collect tomorrow afternoon?",
          time: "2025-09-18T13:45:00Z",
        },
      ],
    },
    {
      id: 2,
      customer: "Mike Johnson",
      updatedAt: "2025-09-17T09:10:00Z",
      unread: 0,
      messages: [
        {
          id: "m1",
          from: "customer",
          text: "Is the Designer Jacket true to size (M)?",
          time: "2025-09-17T08:55:00Z",
        },
        {
          id: "m2",
          from: "vendor",
          text: "Yes, fits like a standard Medium.",
          time: "2025-09-17T09:10:00Z",
        },
      ],
    },
    {
      id: 3,
      customer: "Anele N.",
      updatedAt: "2025-09-16T16:20:00Z",
      unread: 0,
      messages: [
        {
          id: "m1",
          from: "customer",
          text: "Any scratches on the Old iPhone?",
          time: "2025-09-16T16:10:00Z",
        },
        {
          id: "m2",
          from: "vendor",
          text: "Minor scuffs, but everything works.",
          time: "2025-09-16T16:20:00Z",
        },
      ],
    },
  ]);

  // Selected conversation
  const [selectedId, setSelectedId] = useState(conversations[0]?.id || null);
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  // UI state
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  // Refs for auto-scroll
  const messagesEndRef = useRef(null);

  // Helpers
  const formatWhen = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(); // simple for now
    } catch {
      return iso;
    }
  };

  const lastMessageText = (c) =>
    c?.messages?.length ? c.messages[c.messages.length - 1].text : "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.customer.toLowerCase().includes(q) ||
        lastMessageText(c).toLowerCase().includes(q)
    );
  }, [conversations, query]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (!selectedConversation) return;
    if (selectedConversation.unread === 0) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id ? { ...c, unread: 0 } : c
      )
    );
  }, [selectedConversation]);

  // Auto-scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selectedConversation?.messages]);

  // Actions
  const openConversation = (id) => setSelectedId(id);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !selectedConversation) return;

    const now = new Date().toISOString();

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: `m${c.messages.length + 1}`, from: "vendor", text, time: now },
              ],
              updatedAt: now,
            }
          : c
      )
    );

    setDraft("");
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <VendorSidebar />
        </div>

        {/* Main content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Messages</h3>

          <div className="row">
            {/* Conversation list */}
            <div className="col-lg-4 col-12 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="fa fa-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or message…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <div className="list-group" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    {filtered.length ? (
                      filtered
                        .sort(
                          (a, b) =>
                            new Date(b.updatedAt).getTime() -
                            new Date(a.updatedAt).getTime()
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            className={
                              "list-group-item list-group-item-action text-start " +
                              (c.id === selectedId ? "active" : "")
                            }
                            onClick={() => openConversation(c.id)}
                          >
                            <div className="d-flex w-100 justify-content-between">
                              <h6 className="mb-1">{c.customer}</h6>
                              <small>
                                {formatWhen(c.updatedAt)}
                              </small>
                            </div>
                            <p className="mb-1 text-truncate">
                              {lastMessageText(c)}
                            </p>
                            {c.unread > 0 && (
                              <span className="badge bg-danger rounded-pill">
                                {c.unread}
                              </span>
                            )}
                          </button>
                        ))
                    ) : (
                      <div className="text-muted text-center py-5">
                        No conversations found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat window */}
            <div className="col-lg-8 col-12 mb-3">
              <div className="card h-100">
                {selectedConversation ? (
                  <>
                    <div className="card-header">
                      <strong>Chat with {selectedConversation.customer}</strong>
                    </div>
                    <div
                      className="card-body"
                      style={{ height: "50vh", overflowY: "auto" }}
                    >
                      {selectedConversation.messages.map((m) => {
                        const mine = m.from === "vendor";
                        return (
                          <div
                            key={m.id}
                            className={
                              "d-flex mb-2 " +
                              (mine ? "justify-content-end" : "justify-content-start")
                            }
                          >
                            <div
                              className={
                                "p-2 rounded-3 " +
                                (mine ? "bg-primary text-white" : "bg-light")
                              }
                              style={{ maxWidth: "75%" }}
                            >
                              <div className="small">{m.text}</div>
                              <div className={"text-end small mt-1 " + (mine ? "opacity-75" : "text-muted")}>
                                {formatWhen(m.time)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="card-footer">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type a message…"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage();
                          }}
                        />
                        <button className="btn btn-primary" onClick={sendMessage}>
                          <i className="fa fa-paper-plane me-1" /> Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="card-body text-center text-muted">
                    Select a conversation to start messaging.
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-muted small mt-2">
            <i className="fa fa-info-circle me-1" />
            This is a mock inbox. Later, we’ll connect it to your backend to load
            conversations, mark as read, and send messages in real time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VendorInbox;
