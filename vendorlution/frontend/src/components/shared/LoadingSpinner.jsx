// src/components/shared/LoadingSpinner.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingSpinner({ 
  size = 'md', 
  fullPage = false, 
  text = 'Loading...',
  color = 'primary',
  centered = true 
}) {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }[size];

  const colorClass = `text-${color}`;

  const spinner = (
    <div className={`spinner-border ${sizeClass} ${colorClass}`} role="status">
      <span className="visually-hidden">{text}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          {spinner}
          {text && <div className="mt-2 text-muted small">{text}</div>}
        </div>
      </div>
    );
  }

  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center p-3">
        {spinner}
        {text && <span className="ms-2 text-muted small">{text}</span>}
      </div>
    );
  }

  return (
    <>
      {spinner}
      {text && <span className="ms-2 text-muted small">{text}</span>}
    </>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullPage: PropTypes.bool,
  text: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  centered: PropTypes.bool
};