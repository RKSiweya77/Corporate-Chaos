// src/components/chat/ConversationList.jsx
import PropTypes from "prop-types";

function relativeTime(iso) {
  if (!iso) return "";
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
}

export default function ConversationList({ conversations, currentUserId, selectedId, onSelect }) {
  const getOtherParty = (conversation) => {
    const isBuyer = conversation?.buyer?.id === currentUserId;
    return isBuyer ? conversation.vendor : conversation.buyer;
  };

  const getDisplayName = (conversation) => {
    const other = getOtherParty(conversation);
    return other?.shop_name || other?.username || `User #${other?.id}`;
  };

  const getPreview = (conversation) => {
    return conversation.last_message_text || "No messages yet";
  };

  return (
    <div 
      className="list-group list-group-flush" 
      style={{ maxHeight: "60vh", overflowY: "auto" }}
    >
      {conversations.map((conversation) => {
        const active = String(selectedId) === String(conversation.id);
        const hasUnread = conversation.unread_count > 0;
        
        return (
          <button
            key={conversation.id}
            className={`list-group-item list-group-item-action text-start border-0 ${
              active ? "bg-primary text-white" : ""
            } ${hasUnread ? "fw-bold" : ""}`}
            onClick={() => onSelect(conversation.id)}
            style={{ 
              borderBottom: "1px solid #eee !important",
              borderRadius: "0"
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1 me-2" style={{ minWidth: 0 }}>
                <div className={`text-truncate ${active ? "text-white" : "text-dark"}`}>
                  {getDisplayName(conversation)}
                </div>
                <div className={`small text-truncate ${
                  active ? "text-white-50" : "text-muted"
                }`}>
                  {getPreview(conversation)}
                </div>
                {conversation.product?.title && (
                  <small className={`text-truncate d-block ${
                    active ? "text-white-50" : "text-muted"
                  }`}>
                    <i className="fa fa-shopping-bag me-1" />
                    {conversation.product.title}
                  </small>
                )}
              </div>
              <div className="d-flex flex-column align-items-end">
                <small className={active ? "text-white-50" : "text-muted"}>
                  {relativeTime(conversation.last_message_at)}
                </small>
                {hasUnread && (
                  <span className={`badge rounded-pill ${
                    active ? "bg-light text-dark" : "bg-primary"
                  } mt-1`}>
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

ConversationList.propTypes = {
  conversations: PropTypes.array.isRequired,
  currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  selectedId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelect: PropTypes.func.isRequired,
};

ConversationList.defaultProps = {
  conversations: [],
};