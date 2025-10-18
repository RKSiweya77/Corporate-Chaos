import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span className={`badge bg-${variant} ${className}`}>
      {children}
    </span>
  );
}