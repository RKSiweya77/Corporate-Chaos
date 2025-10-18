import React from 'react';

export default function Button({
  children,
  variant = 'dark',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  className = '',
  fullWidth = false,
  ...props
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const widthClass = fullWidth ? 'w-100' : '';

  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {icon && !loading && <i className={`${icon} me-2`}></i>}
      {loading && (
        <>
          <span className="spinner-border spinner-border-sm me-2"></span>
          Loading...
        </>
      )}
      {!loading && children}
    </button>
  );
}

// ============================================================================
// src/components/shared/Card.jsx
// ============================================================================

import React from 'react';

export default function Card({
  children,
  className = '',
  header = null,
  footer = null,
  noPadding = false,
  hoverable = false,
}) {
  const hoverClass = hoverable ? 'cursor-pointer' : '';

  return (
    <div className={`card shadow-sm ${hoverClass} ${className}`}>
      {header && <div className="card-header">{header}</div>}
      <div className={noPadding ? '' : 'card-body'}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
