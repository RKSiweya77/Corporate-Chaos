// src/components/chat/ChatWindow.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ENDPOINTS from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import ConversationList from "./ConversationList";
import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const { isAuthenticated, user } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const scrollerRef = useRef(null);
  const pollRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const el = scrollerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }, []);

  // Load conversations
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadConversations() {
      setError("");
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.messages.conversations);
        const list = Array.isArray(res.data?.results) ? res.data.results : (res.data || []);
        setConversations(list);

        // Select conversation: route param > first conversation
        const targetId = routeId ? String(routeId) : (list[0]?.id ? String(list[0].id) : null);
        setSelectedId(targetId);
      } catch (e) {
        setError("Failed to load conversations.");
        console.error("Conversation load error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [isAuthenticated, routeId]);

  // Load messages for selected conversation with polling
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    async function loadMessages() {
      if (!mounted) return;
      
      try {
        const endpoint = API_ENDPOINTS.messages.conversationMessages.replace("{id}", selectedId);
        const res = await api.get(endpoint);
        const list = Array.isArray(res.data?.results) ? res.data.results : (res.data || []);
        
        if (mounted) {
          setMessages(list);
          scrollToBottom();
        }
      } catch (e) {
        console.error("Message load error:", e);
      }
    }

    // Initial load
    loadMessages();

    // Start polling every 2.5 seconds
    pollRef.current = setInterval(loadMessages, 2500);

    return () => {
      mounted = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [selectedId, scrollToBottom]);

  const selectedConversation = useMemo(() => 
    conversations.find((c) => String(c.id) === String(selectedId)) || null,
    [conversations, selectedId]
  );

  const handleSelectConversation = useCallback((id) => {
    const newId = String(id);
    setSelectedId(newId);
    navigate(`/chat/${newId}`, { replace: true });
  }, [navigate]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || !selectedConversation || sending) return;

    setSending(true);
    setError("");

    try {
      await api.post(API_ENDPOINTS.messages.send, {
        conversation: selectedConversation.id,
        text: trimmedText,
      });
      
      setText("");
      
      // Immediate refresh after sending
      const endpoint = API_ENDPOINTS.messages.conversationMessages.replace("{id}", selectedConversation.id);
      const res = await api.get(endpoint);
      const list = Array.isArray(res.data?.results) ? res.data.results : (res.data || []);
      setMessages(list);
      scrollToBottom();
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to send message.");
      console.error("Send message error:", e);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <i className="fa fa-info-circle me-2" />
          Please sign in to access your messages.
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container-fluid py-4">
      {error && (
        <div className="container mb-3">
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button className="btn-close" onClick={() => setError("")} />
          </div>
        </div>
      )}

      <div className="row g-3" style={{ minHeight: "70vh", maxHeight: "80vh" }}>
        {/* Conversations Sidebar */}
        <div className="col-lg-3 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-white fw-bold d-flex align-items-center">
              <i className="fa fa-comments me-2 text-muted" />
              Conversations
              <span className="badge bg-dark ms-2">{conversations.length}</span>
            </div>
            <div className="card-body p-0">
              {conversations.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon="fa-comments"
                    title="No conversations"
                    subtitle="Start a chat from a product or order page."
                  />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  currentUserId={user?.id}
                  selectedId={selectedId}
                  onSelect={handleSelectConversation}
                />
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-lg-9 col-md-8">
          <div className="card h-100 d-flex flex-column border-0 shadow-sm">
            {/* Chat Header */}
            <div className="card-header bg-white">
              {selectedConversation ? (
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-bold">
                      {(() => {
                        const isBuyer = selectedConversation.buyer?.id === user?.id;
                        const other = isBuyer ? selectedConversation.vendor : selectedConversation.buyer;
                        return other?.shop_name || other?.username || `User #${other?.id}`;
                      })()}
                    </div>
                    {selectedConversation.product?.title && (
                      <div className="small text-muted">
                        <i className="fa fa-shopping-bag me-1" />
                        About: {selectedConversation.product.title}
                      </div>
                    )}
                  </div>
                  <div className="small text-muted">
                    {conversations.find(c => String(c.id) === String(selectedId))?.last_message_at && 
                      new Date(conversations.find(c => String(c.id) === String(selectedId)).last_message_at).toLocaleDateString()
                    }
                  </div>
                </div>
              ) : (
                <span className="text-muted">
                  <i className="fa fa-arrow-left me-2" />
                  Select a conversation
                </span>
              )}
            </div>

            {/* Messages Area */}
            <div
              ref={scrollerRef}
              className="card-body flex-grow-1"
              style={{ overflowY: "auto", minHeight: 300, maxHeight: "50vh" }}
            >
              {!selectedConversation ? (
                <EmptyState 
                  icon="fa-comment"
                  title="No conversation selected"
                  subtitle="Choose a conversation from the sidebar to start chatting."
                />
              ) : messages.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fa fa-comment-slash fa-2x mb-3" />
                  <div>No messages yet. Start the conversation!</div>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    isOwn={msg.sender?.id === user?.id}
                    text={msg.text}
                    timestamp={new Date(msg.created_at).toLocaleString()}
                    senderName={msg.sender?.username}
                  />
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="card-footer bg-light">
              <form onSubmit={sendMessage} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your message…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!selectedConversation || sending}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="btn btn-dark px-3"
                  disabled={!selectedConversation || sending || !text.trim()}
                  title="Send message"
                >
                  {sending ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="fa fa-paper-plane" />
                  )}
                </button>
              </form>
              <div className="small text-muted mt-1 text-end">
                {text.length}/500 characters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}