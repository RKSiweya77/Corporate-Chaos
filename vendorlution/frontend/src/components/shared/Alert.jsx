import React, { useState } from 'react';

export default function Alert({ type = 'info', message, onClose = null, dismissible = true }) {
  const [visible, setVisible] = useState(true);

  if (!message || !visible) return null;

  const typeClass = `alert-${type}`;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className={`alert ${typeClass} ${dismissible ? 'alert-dismissible fade show' : ''}`} role="alert">
      <div className="d-flex align-items-start gap-2">
        <div className="flex-grow-1">{message}</div>
        {dismissible && (
          <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
        )}
      </div>
    </div>
  );
}