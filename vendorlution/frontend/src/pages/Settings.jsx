// src/pages/Settings.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, setTheme, reducedMotion, setReducedMotion } = useTheme();
  const [compactCards, setCompactCards] = useState(() => localStorage.getItem("compactCards") === "true");
  const [alwaysShowDockLabels, setAlwaysShowDockLabels] = useState(
    () => localStorage.getItem("alwaysShowDockLabels") === "true"
  );

  useEffect(() => {
    localStorage.setItem("compactCards", String(compactCards));
    window.dispatchEvent(new CustomEvent("vendorlution:settings:compactCards", { detail: { compactCards } }));
  }, [compactCards]);

  useEffect(() => {
    localStorage.setItem("alwaysShowDockLabels", String(alwaysShowDockLabels));
    window.dispatchEvent(new CustomEvent("vendorlution:settings:dockLabels", { detail: { alwaysShowDockLabels } }));
  }, [alwaysShowDockLabels]);

  const themeDesc = useMemo(
    () => (theme === "dark" ? "Best for low-light viewing and matches the dock." : "Bright, high-contrast UI."),
    [theme]
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1"><i className="fa fa-gear me-2" /> App Settings</h4>
          <div className="vl-muted small">Personalize Vendorlution to match your style.</div>
        </div>
        <Link to="/profile" className="btn vl-btn-ghost">
          <i className="fa fa-user me-2" />
          Back to Profile
        </Link>
      </div>

      <div className="row g-3">
        {/* Appearance */}
        <div className="col-lg-6">
          <div className="card vl-card">
            <div className="card-header vl-card-header fw-600">
              <i className="fa fa-palette me-2" />
              Appearance
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div>
                  <div className="fw-600">Theme</div>
                  <div className="vl-muted small">{themeDesc}</div>
                </div>
                <div className="btn-group">
                  <button
                    className={`btn ${theme === "dark" ? "btn-primary" : "vl-btn-ghost"}`}
                    onClick={() => setTheme("dark")}
                  >
                    <i className="fa fa-moon me-1" /> Dark
                  </button>
                  <button
                    className={`btn ${theme === "light" ? "btn-primary" : "vl-btn-ghost"}`}
                    onClick={() => setTheme("light")}
                  >
                    <i className="fa fa-sun me-1" /> Light
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div>
                  <div className="fw-600">Compact Cards</div>
                  <div className="vl-muted small">Reduce padding for product/vendor cards.</div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="compactCards"
                    checked={compactCards}
                    onChange={(e) => setCompactCards(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility & Behavior */}
        <div className="col-lg-6">
          <div className="card vl-card">
            <div className="card-header vl-card-header fw-600">
              <i className="fa fa-universal-access me-2" />
              Accessibility & Behavior
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div>
                  <div className="fw-600">Reduced Motion</div>
                  <div className="vl-muted small">Tone down hover/magnify animations.</div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="reducedMotion"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div>
                  <div className="fw-600">Always Show Dock Labels</div>
                  <div className="vl-muted small">Keep item labels visible in the dock.</div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="dockLabels"
                    checked={alwaysShowDockLabels}
                    onChange={(e) => setAlwaysShowDockLabels(e.target.checked)}
                  />
                </div>
              </div>

              <div className="mt-3 vl-muted small">
                These preferences are saved to your browser. A future update will sync across devices.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bottom spacing for dock */}
      <div style={{ height: 96 }} />
    </div>
  );
}