// src/components/chat/MessageBubble.jsx
import PropTypes from "prop-types";

export default function MessageBubble({ isOwn, text, timestamp, senderName }) {
  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className={`d-flex mb-3 ${isOwn ? "justify-content-end" : "justify-content-start"}`}>
      <div className="d-flex flex-column" style={{ maxWidth: "70%" }}>
        {!isOwn && senderName && (
          <small className="text-muted mb-1 ms-2">{senderName}</small>
        )}
        <div className="d-flex align-items-end">
          {!isOwn && (
            <div className="me-2">
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: 32, height: 32 }}>
                <i className="fa fa-user text-white-50 small" />
              </div>
            </div>
          )}
          <div
            className={`p-3 rounded-3 ${
              isOwn 
                ? "bg-primary text-white" 
                : "bg-light border"
            }`}
            style={{ 
              maxWidth: "100%", 
              wordWrap: "break-word",
              borderBottomLeftRadius: isOwn ? "1rem" : "0.25rem",
              borderBottomRightRadius: isOwn ? "0.25rem" : "1rem"
            }}
          >
            <div className="mb-1" style={{ lineHeight: 1.4 }}>{text}</div>
            <div className={`small ${isOwn ? "text-white-50" : "text-muted"} text-end`}>
              {formatTime(timestamp)}
            </div>
          </div>
          {isOwn && (
            <div className="ms-2">
              <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: 32, height: 32 }}>
                <i className="fa fa-user text-white-50 small" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

MessageBubble.propTypes = {
  isOwn: PropTypes.bool,
  text: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  senderName: PropTypes.string,
};

MessageBubble.defaultProps = {
  isOwn: false,
  senderName: "",
};