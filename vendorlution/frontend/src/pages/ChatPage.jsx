// src/pages/ChatPage.jsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import api from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints";

export default function ChatPage() {
  const { id, vendorId } = useParams(); // supports /chat, /chat/:id, /chat/vendor/:vendorId
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(id || null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Track last seen unread counts to notify on new messages
  const unreadByConvRef = useRef({});

  // ----------- THEME (Dock tokens) -----------
  const themeCss = useMemo(
    () => `
      .chat-theme {
        --bg: #0b0614;
        --panel: #0b0614;
        --panel-soft: #100a1f;
        --panel-border: #1f1932;
        --text: #e7e6ea;
        --text-muted: #bfb9cf;
        --control-bg: #0f0a1d;
        --control-border: #2b2444;
        --control-focus: #3b315e;
        --shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
        --primary: #0d6efd;
        --outline: rgba(0,0,0,.9);
        background: var(--bg);
        color: var(--text);
      }
      :where([data-theme="light"], html.light, body.light, .light) .chat-theme {
        --bg: #f5f7fb;
        --panel: #ffffff;
        --panel-soft: #ffffff;
        --panel-border: #e6e8f1;
        --text: #16161a;
        --text-muted: #6b6f7d;
        --control-bg: #ffffff;
        --control-border: #dfe3ef;
        --control-focus: #cfd8f6;
        --shadow: 0 10px 24px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6);
        --outline: rgba(0,0,0,1);
      }

      .chat-theme .text-muted { color: var(--text-muted) !important; }

      .v-panel {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 14px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }
      .v-panel-header {
        background: var(--panel);
        border-bottom: 1px solid var(--panel-border);
        color: var(--text);
      }

      .v-panel-subtle {
        background: var(--panel-soft);
        border: 1px solid var(--panel-border);
        border-radius: 14px;
        box-shadow: var(--shadow);
      }

      /* Left conversation list styles */
      .conv-head {
        display:flex; align-items:center; gap:.5rem;
        padding:.75rem 1rem;
      }
      .conv-title { margin:0; font-weight:800; color: var(--text); }
      .conv-body { padding: .5rem; background: var(--panel); }
      .conv-search {
        margin: .5rem;
      }
      .conv-search .form-control {
        background: var(--control-bg);
        color: var(--text);
        border: 1px solid var(--control-border);
      }
      .conv-search .form-control:focus {
        border-color: var(--control-focus); outline: 2px solid var(--outline); outline-offset: 0;
        box-shadow:none;
      }

      /* Right chat placeholder card */
      .placeholder-card {
        min-height: 60vh;
        display:flex; align-items:center; justify-content:center;
        color: var(--text-muted);
      }
    `,
    []
  );

  // ----------- Load conversations -----------
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.messages.conversations);
      const list = res.data?.results || res.data || [];
      setConversations(list);

      // Show toast if any conversation gained new unread messages
      list.forEach((c) => {
        const prev = unreadByConvRef.current[c.id] ?? 0;
        const next = Number(c.unread_count || c.unread || 0);
        if (next > prev) {
          addNotification?.("New message received.", "info");
        }
      });
      // update tracking
      const nextMap = {};
      list.forEach((c) => (nextMap[c.id] = Number(c.unread_count || c.unread || 0)));
      unreadByConvRef.current = nextMap;

      // If we came with /chat (no id) select first conv
      if (!selectedId && list.length > 0) {
        setSelectedId(String(list[0].id));
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [addNotification, selectedId]);

  // initial load
  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
    // Poll lightly every 8s (simple realtime)
    const t = setInterval(loadConversations, 8000);
    return () => clearInterval(t);
  }, [isAuthenticated, loadConversations]);

  // keep URL in sync
  useEffect(() => {
    if (id) setSelectedId(id);
  }, [id]);

  // ----------- Create/open conversation with vendor -----------
  useEffect(() => {
    if (!vendorId || !isAuthenticated) return;
    let cancelled = false;
    const ensureConversationWithVendor = async () => {
      setCreating(true);
      try {
        // Try common “start chat with vendor” endpoints in order
        const tryEndpoints = [
          API_ENDPOINTS?.messages?.startWithVendor,
          API_ENDPOINTS?.messages?.start_with_vendor,
          API_ENDPOINTS?.messages?.start,
          API_ENDPOINTS?.messages?.conversations, // some backends accept POST here
        ].filter(Boolean);

        let created = null;

        for (const ep of tryEndpoints) {
          try {
            const r = await api.post(ep, { vendor_id: vendorId });
            created = r.data;
            break;
          } catch {
            /* try next */
          }
        }

        // Fallback: look up an existing conversation by vendor
        if (!created) {
          try {
            const r = await api.get(API_ENDPOINTS.messages.conversations, {
              params: { vendor: vendorId, page_size: 1 },
            });
            const arr = Array.isArray(r.data) ? r.data : r.data?.results || [];
            created = arr[0];
          } catch {
            /* noop */
          }
        }

        if (!cancelled && created?.id) {
          setSelectedId(String(created.id));
          navigate(`/chat/${created.id}`, { replace: true });
          // refresh the list to include the new/opened conversation
          await loadConversations();
        }
      } finally {
        if (!cancelled) setCreating(false);
      }
    };
    ensureConversationWithVendor();
    return () => { cancelled = true; };
  }, [vendorId, isAuthenticated, navigate, loadConversations]);

  // ----------- Select and mark as read -----------
  const handleSelect = async (conversationId) => {
    setSelectedId(conversationId);
    navigate(`/chat/${conversationId}`);
    // Best-effort mark read
    try {
      const tryMark = [
        API_ENDPOINTS?.messages?.markRead,
        API_ENDPOINTS?.messages?.mark_read,
        API_ENDPOINTS?.messages?.read,
      ].filter(Boolean);
      for (const ep of tryMark) {
        try {
          await api.post(ep, { conversation_id: conversationId });
          break;
        } catch { /* try next */ }
      }
      // update local unread map & list
      unreadByConvRef.current = {
        ...unreadByConvRef.current,
        [conversationId]: 0,
      };
      await loadConversations();
    } catch {
      /* non-fatal */
    }
  };

  // Child hooks: when ChatWindow sends a new message, refresh list
  const handleMessageSent = async () => {
    await loadConversations();
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Please sign in to access messages.</div>
      </div>
    );
  }

  if (loading && !conversations.length && !creating) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-theme">
      <style>{themeCss}</style>

      <div className="container-fluid py-4">
        <div className="row g-3">
          {/* Conversation list */}
          <div className="col-md-4 col-lg-3">
            <div className="v-panel h-100">
              <div className="v-panel-header">
                <div className="conv-head">
                  <i className="fas fa-comments" />
                  <h5 className="conv-title">Messages</h5>
                </div>
              </div>

              {/* Optional quick search (client-side filter) */}
              <div className="conv-search">
                <input
                  className="form-control"
                  placeholder="Search conversations…"
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    // Filter on the fly; you may move this into ConversationList if preferred
                    const source = conversations;
                    const filtered = source.filter((c) => {
                      const name =
                        c.title ||
                        c.other_party_name ||
                        c.vendor?.shop_name ||
                        c.vendor?.name ||
                        c.vendor_name ||
                        "";
                      return name.toLowerCase().includes(q);
                    });
                    setConversations(q ? filtered : source);
                  }}
                />
              </div>

              <div className="conv-body">
                <ConversationList
                  conversations={conversations}
                  currentUserId={user?.id}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              </div>
            </div>
          </div>

          {/* Chat window */}
          <div className="col-md-8 col-lg-9">
            <div className="v-panel h-100">
              {creating ? (
                <div className="placeholder-card">
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <div className="mt-3">Starting chat…</div>
                  </div>
                </div>
              ) : selectedId ? (
                <ChatWindow
                  conversationId={selectedId}
                  onMessageSent={handleMessageSent}
                  onMessagesRead={() => handleSelect(selectedId)} // mark read when viewing
                />
              ) : (
                <div className="placeholder-card">
                  <div className="text-center">
                    <i className="fas fa-comments fa-3x mb-3" />
                    <h5 style={{ color: "var(--text)" }}>Select a conversation to start chatting</h5>
                    <p className="text-muted mb-0">Choose a conversation from the list to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* bottom spacing so the dock never overlaps */}
        <div style={{ height: 96 }} />
      </div>
    </div>
  );
}