// src/components/shared/EmptyState.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  icon = 'fa-inbox', 
  title = 'No items', 
  subtitle = '', 
  action = null,
  actionLabel = '',
  actionTo = '',
  actionOnClick = null,
  size = 'default' // 'sm', 'default', 'lg'
}) {
  const sizeStyles = {
    sm: { iconSize: '2rem', padding: 'py-3' },
    default: { iconSize: '3rem', padding: 'py-5' },
    lg: { iconSize: '4rem', padding: 'py-6' }
  };

  const { iconSize, padding } = sizeStyles[size];

  const renderAction = () => {
    if (!action && !actionLabel) return null;
    
    if (action) return <div className="mt-3">{action}</div>;
    
    if (actionTo) {
      return (
        <Link to={actionTo} className="btn btn-primary mt-3">
          {actionLabel}
        </Link>
      );
    }
    
    if (actionOnClick) {
      return (
        <button onClick={actionOnClick} className="btn btn-primary mt-3">
          {actionLabel}
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className={`text-center ${padding}`}>
      <div className="mb-3" style={{ fontSize: iconSize, color: '#9ca3af' }}>
        <i className={`fa ${icon}`}></i>
      </div>
      <h5 className="fw-bold mb-2 text-dark">{title}</h5>
      {subtitle && <p className="text-muted mb-4">{subtitle}</p>}
      {renderAction()}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  actionLabel: PropTypes.string,
  actionTo: PropTypes.string,
  actionOnClick: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'default', 'lg'])
};