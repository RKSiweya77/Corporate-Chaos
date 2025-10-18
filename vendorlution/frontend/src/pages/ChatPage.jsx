// src/pages/ChatPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { API_ENDPOINTS } from "../api/endpoints";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(id || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (id) {
      setSelectedId(id);
    }
  }, [id]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.messages.conversations);
      setConversations(response.data?.results || response.data || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (conversationId) => {
    setSelectedId(conversationId);
    navigate(`/chat/${conversationId}`);
  };

  if (loading) {
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
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-4 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="fas fa-comments me-2"></i>
                Messages
              </h5>
            </div>
            <ConversationList
              conversations={conversations}
              currentUserId={user?.id}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </div>
        <div className="col-md-8 col-lg-9">
          {selectedId ? (
            <ChatWindow conversationId={selectedId} />
          ) : (
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <i className="fas fa-comments fa-3x mb-3"></i>
                  <h5>Select a conversation to start chatting</h5>
                  <p>Choose a conversation from the list to view messages</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}