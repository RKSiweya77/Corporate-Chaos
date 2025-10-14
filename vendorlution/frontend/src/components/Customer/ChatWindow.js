// components/Customer/ChatWindow.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function ChatWindow() {
  const { id } = useParams(); // conversation id
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [conv, setConv] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const bottomRef = useRef(null);

  const myUserId = useMemo(() => me?.user?.id, [me]);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadAll = async () => {
    setLoading(true);
    setErr("");
    try {
      // me
      const rMe = await api.get("/auth/me/");
      setMe(rMe.data);

      // conversations (to get vendor id for header)
      const rConvos = await api.get("/me/conversations/");
      const convos = Array.isArray(rConvos.data) ? rConvos.data : (rConvos.data?.results || []);
      const c = convos.find((x) => String(x.id) === String(id));
      if (!c) {
        setErr("Conversation not found.");
        setLoading(false);
        return;
      }
      setConv(c);

      // vendor header
      if (c.vendor) {
        try {
          const rV = await api.get(`/vendors/${c.vendor}/`);
          setVendor(rV.data);
        } catch {
          setVendor(null);
        }
      }

      // messages
      const rMsgs = await api.get(`/me/messages/?conversation_id=${id}`);
      const data = Array.isArray(rMsgs.data) ? rMsgs.data : (rMsgs.data?.results || []);
      setMessages(data);
      setTimeout(scrollToBottom, 50);
    } catch {
      setErr("Failed to load chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [id]);

  // optional light polling to see new messages (15s)
  useEffect(() => {
    if (!id) return;
    const t = setInterval(async () => {
      try {
        const r = await api.get(`/me/messages/?conversation_id=${id}`);
        const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
        setMessages(data);
      } catch {}
    }, 15000);
    return () => clearInterval(t);
  }, [id]);

  const send = async () => {
    const body = (text || "").trim();
    if (!body) return;
    try {
      await api.post("/me/messages/", { conversation: Number(id), text: body });
      setText("");
      // refresh messages
      const r = await api.get(`/me/messages/?conversation_id=${id}`);
      const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
      setMessages(data);
      setTimeout(scrollToBottom, 30);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : "Failed to send.");
      alert(msg);
    }
  };

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <div>{err}</div>
          <Link className="btn btn-sm btn-outline-light" to="/customer/inbox">Back to Inbox</Link>
        </div>
      </div>
    );
  }

  const headerName = vendor?.shop_name || (conv?.vendor ? `Vendor #${conv.vendor}` : "Chat");
  const logo = vendor?.logo;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-3 border-bottom pb-2">
        <button className="btn btn-sm btn-outline-dark me-3" onClick={() => nav(-1)}>
          <i className="fa fa-arrow-left"></i>
        </button>
        {logo ? (
          <img src={logo} alt={headerName} width="40" height="40" className="rounded-circle me-2 border" />
        ) : (
          <div className="rounded-circle me-2 bg-light border" style={{ width: 40, height: 40 }} />
        )}
        <h6 className="mb-0">{headerName}</h6>
      </div>

      {/* Messages */}
      <div className="card shadow-sm border-0 mb-3" style={{ height: 420, overflowY: "auto" }}>
        <div className="card-body d-flex flex-column gap-2">
          {messages.map((m) => {
            const mine = Number(m.sender) === Number(myUserId);
            return (
              <div key={m.id} className={`d-flex ${mine ? "justify-content-end" : "justify-content-start"}`}>
                <div
                  className={`p-2 rounded-3 ${mine ? "bg-dark text-white" : "bg-light border"}`}
                  style={{ maxWidth: "75%" }}
                >
                  {m.text && <p className="mb-1 small">{m.text}</p>}
                  <small className="text-muted">{new Date(m.created_at).toLocaleString()}</small>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn btn-dark" onClick={send}>
          <i className="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}
