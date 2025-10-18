import React, { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title = 'Modal',
  children,
  footer = null,
  size = 'md',
  closeButton = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : '';

  return (
    <div className="modal show d-flex" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={`modal-dialog ${sizeClass}`} style={{ maxWidth: size === 'lg' ? '600px' : size === 'sm' ? '400px' : '500px' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-600">{title}</h5>
            {closeButton && (
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            )}
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
    </div>
  );
}
