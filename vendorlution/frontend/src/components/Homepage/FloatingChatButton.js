import { Link } from "react-router-dom";

function FloatingChatButton() {
  return (
    <Link
      to="/customer/inbox"
      className="floating-chat"
      title="Messages"
      aria-label="Open Messages"
    >
      <i className="fa fa-comments" />
      <span className="chat-notification">•</span>
    </Link>
  );
}
export default FloatingChatButton;
