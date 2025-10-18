// src/components/shared/Sidebar.jsx
import { NavLink } from "react-router-dom";
import PropTypes from 'prop-types';

export default function Sidebar({ 
  sections = [], 
  width = 240,
  sticky = false,
  className = '' 
}) {
  return (
    <aside 
      className={`border-end bg-white ${sticky ? 'sticky-top' : ''} ${className}`}
      style={{ 
        minWidth: width,
        top: sticky ? '76px' : 'auto',
        height: sticky ? 'calc(100vh - 76px)' : 'auto',
        overflowY: sticky ? 'auto' : 'visible'
      }}
    >
      <div className="p-3">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            {section.title && (
              <div className="fw-bold small text-muted text-uppercase mb-2 px-2">
                {section.title}
              </div>
            )}
            <div className="list-group list-group-flush">
              {section.links?.map((link, k) => (
                <NavLink 
                  key={k}
                  to={link.to} 
                  className={({ isActive }) => 
                    `list-group-item list-group-item-action border-0 rounded mb-1 px-3 py-2 ${
                      isActive ? 'bg-primary text-white' : 'text-dark'
                    }`
                  }
                >
                  {link.icon && (
                    <i className={`fa ${link.icon} me-3 ${link.badge ? 'me-2' : 'me-3'}`} />
                  )}
                  {link.label}
                  {link.badge && (
                    <span className={`badge ${link.badge.variant || 'bg-light text-dark'} ms-auto`}>
                      {link.badge.text}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      links: PropTypes.arrayOf(
        PropTypes.shape({
          to: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          icon: PropTypes.string,
          badge: PropTypes.shape({
            text: PropTypes.string.isRequired,
            variant: PropTypes.string
          })
        })
      )
    })
  ),
  width: PropTypes.number,
  sticky: PropTypes.bool,
  className: PropTypes.string
};