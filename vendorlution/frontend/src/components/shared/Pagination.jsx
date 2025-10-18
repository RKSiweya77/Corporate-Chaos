// src/components/shared/Pagination.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function Pagination({ 
  page, 
  totalPages, 
  onPageChange, 
  maxVisible = 5,
  size = 'md',
  showInfo = false 
}) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const getPageNumbers = () => {
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageNumbers();
  const sizeClass = `pagination-${size}`;

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
      {showInfo && (
        <div className="small text-muted">
          Page {page} of {totalPages}
        </div>
      )}
      
      <nav aria-label="Page navigation">
        <ul className={`pagination mb-0 ${sizeClass}`}>
          {/* Previous Button */}
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handlePrevious} 
              disabled={page === 1}
              aria-label="Previous page"
            >
              <i className="fa fa-chevron-left me-1"></i>
              Previous
            </button>
          </li>

          {/* First Page + Ellipsis */}
          {pages[0] > 1 && (
            <>
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(1)}
                  aria-label={`Go to page 1`}
                >
                  1
                </button>
              </li>
              {pages[0] > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}

          {/* Page Numbers */}
          {pages.map(p => (
            <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => onPageChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={page === p ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          ))}

          {/* Last Page + Ellipsis */}
          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(totalPages)}
                  aria-label={`Go to page ${totalPages}`}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          {/* Next Button */}
          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handleNext} 
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next
              <i className="fa fa-chevron-right ms-1"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showInfo: PropTypes.bool
};