// src/components/chat/ChatWindow.jsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";                 // <-- fixed
import { useNotifications } from "../../context/NotificationsContext"; // <-- fixed
import api from "../../api/axios";                                     // <-- fixed
import { API_ENDPOINTS } from "../../api/endpoints";                   // <-- fixed

export default function ChatWindow({ conversationId: propConversationId }) {
  const routeParams = useParams();
  const conversationId = propConversationId ?? routeParams.id ?? null;

  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  const listRef = useRef(null);

  const canSend = useMemo(
    () => isAuthenticated && conversationId && text.trim().length > 0 && !sending,
    [isAuthenticated, conversationId, text, sending]
  );

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Load messages for current conversation
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!conversationId) return;
      try {
        setError("");
        const res = await api.get(API_ENDPOINTS.messages.thread(conversationId));
        const arr = Array.isArray(res.data) ? res.data : res.data?.results || [];
        if (alive) setMessages(arr);
        setTimeout(scrollToBottom, 0);
      } catch (e) {
        if (alive) setError("Failed to load conversation.");
      }
    }
    load();
    return () => { alive = false; };
  }, [conversationId, scrollToBottom]);

  // (Optional) simple polling so you at least receive new messages
  useEffect(() => {
    if (!conversationId) return;
    const t = setInterval(async () => {
      try {
        const res = await api.get(API_ENDPOINTS.messages.thread(conversationId));
        const arr = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setMessages(arr);
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [conversationId]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    if (!canSend) return;

    try {
      setSending(true);
      setError("");

      const payload = { text: text.trim() };
      const res = await api.post(API_ENDPOINTS.messages.send(conversationId), payload);

      // Optimistically append
      const newMsg = res?.data || {
        id: `temp-${Date.now()}`,
        text: text.trim(),
        sender_id: user?.id,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, newMsg]);
      setText("");
      setTimeout(scrollToBottom, 0);
    } catch (e) {
      setError("Failed to send message.");
      addNotification?.("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card h-100">
      <style>{`
        .chat-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:.75rem 1rem; border-bottom:1px solid var(--border-0);
          background: var(--surface-1);
          color: var(--text-0);
        }
        .chat-list {
          height: calc(70vh - 56px);
          overflow: auto;
          background: var(--surface-0);
        }
        .chat-row { padding: .5rem .75rem; }
        .msg {
          display:inline-block; max-width: 78%; padding:.5rem .65rem; border-radius:12px;
          border:1px solid var(--border-0); background: var(--surface-1); color: var(--text-0);
          white-space: pre-wrap;
        }
        .me { background: color-mix(in oklab, var(--primary-500) 18%, var(--surface-1)); }
        .chat-input {
          border-top:1px solid var(--border-0); background: var(--surface-1);
          padding:.5rem;
        }
        .send-btn { min-width:44px; }
      `}</style>

      <div className="chat-header">
        <div className="fw-bold">Conversation</div>
        <small className="text-muted">{messages?.length || 0} message{messages.length === 1 ? "" : "s"}</small>
      </div>

      {error && (
        <div className="alert alert-danger rounded-0 m-0">{error}</div>
      )}

      <div className="chat-list" ref={listRef}>
        {messages.length === 0 ? (
          <div className="d-flex h-100 align-items-center justify-content-center text-muted">
            <div className="text-center">
              <i className="fa fa-message-slash fa-2x mb-2" />
              <div>No messages yet. Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const mine = String(m.sender_id ?? m.sender?.id) === String(user?.id);
            return (
              <div key={m.id} className={`chat-row ${mine ? "text-end" : "text-start"}`}>
                <div className={`msg ${mine ? "me" : ""}`}>{m.text}</div>
              </div>
            );
          })
        )}
      </div>

      <form className="chat-input d-flex align-items-center gap-2" onSubmit={handleSend}>
        <input
          className="form-control"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button
          type="submit"
          className="btn btn-primary send-btn"
          disabled={!canSend}
          title={isAuthenticated ? "Send" : "Sign in to send"}
        >
          {sending ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-paper-plane" />}
        </button>
      </form>
    </div>
  );
}