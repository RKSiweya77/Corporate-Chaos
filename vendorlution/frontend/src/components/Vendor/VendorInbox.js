import React, { useEffect, useState } from "react";
import api from "../../api/axios";


// This inbox reads all conversations for the *current* user (buyer or vendor)
// GET /api/me/conversations/  -> list convos
// GET /api/me/messages/?conversation_id=<id> -> list messages in a convo
// POST /api/me/messages/ { conversation: <id>, text: "..." } -> send

export default function VendorInbox() {
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [err, setErr] = useState("");

  const loadConvos = async () => {
    try {
      setLoadingConvos(true);
      setErr("");
      const res = await api.get("/me/conversations/");
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setConvos(data);
    } catch (e) {
      console.error(e);
      setErr("Failed to load conversations.");
    } finally {
      setLoadingConvos(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoadingMsgs(true);
      const res = await api.get(`/me/messages/?conversation_id=${conversationId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    loadConvos();
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.id);
  }, [active]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    try {
      await api.post("/me/messages/", { conversation: active.id, text });
      setText("");
      await loadMessages(active.id);
    } catch (e) {
      console.error(e);
      alert("Failed to send message");
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Vendor Messages</h3>

          {err && <div className="alert alert-danger">{err}</div>}

          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="list-group">
                {loadingConvos ? (
                  <div className="text-muted p-3">Loading…</div>
                ) : convos.length === 0 ? (
                  <div className="text-muted p-3">No conversations.</div>
                ) : (
                  convos.map((c) => (
                    <button
                      key={c.id}
                      className={`list-group-item list-group-item-action ${active?.id === c.id ? "active" : ""}`}
                      onClick={() => setActive(c)}
                    >
                      Conversation #{c.id}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="col-md-8">
              {!active ? (
                <div className="text-muted">Select a conversation</div>
              ) : (
                <div className="card border-0 shadow-sm">
                  <div className="card-body" style={{ height: 320, overflowY: "auto" }}>
                    {loadingMsgs ? (
                      <div className="text-muted">Loading messages…</div>
                    ) : messages.length === 0 ? (
                      <div className="text-muted">No messages.</div>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className="mb-2">
                          <div className="small text-muted">
                            {new Date(m.created_at).toLocaleString()}
                          </div>
                          <div>{m.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="card-footer bg-white">
                    <form onSubmit={send} className="d-flex gap-2">
                      <input
                        className="form-control"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                      />
                      <button className="btn btn-dark" type="submit">
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
