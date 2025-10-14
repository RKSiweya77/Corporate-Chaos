import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import api from "../../api/axios";

export default function ChatWindow() {
  const { id } = useParams();              // conversation id
  const { search } = useLocation();
  const productParam = new URLSearchParams(search).get("product");

  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [convs, msgs] = await Promise.all([
        api.get("/conversations/"),
        api.get(`/messages/?conversation_id=${id}`),
      ]);
      const convList = Array.isArray(convs.data) ? convs.data : convs.data?.results || [];
      setConv(convList.find((c) => String(c.id) === String(id)) || null);

      const msgList = Array.isArray(msgs.data) ? msgs.data : msgs.data?.results || [];
      setMessages(msgList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post("/messages/", {
      conversation: Number(id),
      text,
      // sender inferred (request.user) in backend
    });
    setText("");
    load();
  };

  if (loading) return <div className="container py-4">Loading…</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-3 border-bottom pb-2">
        <Link to="/customer/inbox" className="btn btn-sm btn-outline-dark me-3">
          <i className="fa fa-arrow-left"></i>
        </Link>
        <h6 className="mb-0">
          Chat • {conv?.vendor?.shop_name || `Vendor #${conv?.vendor?.id || "-"}`}
          {productParam ? <span className="text-muted"> &middot; about product #{productParam}</span> : null}
        </h6>
      </div>

      <div className="card shadow-sm border-0 mb-3" style={{ height: 420, overflowY: "auto" }}>
        <div className="card-body d-flex flex-column gap-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`d-flex ${m.sender === conv?.buyer?.user?.id ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`p-2 rounded-3 ${
                  m.sender === conv?.buyer?.user?.id ? "bg-dark text-white" : "bg-light border"
                }`}
                style={{ maxWidth: "75%" }}
              >
                <p className="mb-1 small">{m.text}</p>
                <small className="text-muted">
                  {new Date(m.created_at).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-muted">No messages yet.</div>}
        </div>
      </div>

      <form className="d-flex" onSubmit={send}>
        <input
          className="form-control me-2"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-dark" type="submit">
          <i className="fa fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}
