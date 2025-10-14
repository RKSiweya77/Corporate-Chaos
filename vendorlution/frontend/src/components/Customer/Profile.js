import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Profile() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/auth/me/").then((r) => setData(r.data)).catch(()=>setErr("Failed to load profile"));
  }, []);

  if (err) return <div className="container py-4 alert alert-danger">{err}</div>;
  if (!data) return <div className="container py-4">Loading…</div>;

  const u = data.user || {};
  return (
    <div className="container mt-4" style={{maxWidth: 680}}>
      <h3 className="mb-3">My Profile</h3>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="small text-muted">First name</div>
              <div className="fw-semibold">{u.first_name || "—"}</div>
            </div>
            <div className="col-sm-6">
              <div className="small text-muted">Last name</div>
              <div className="fw-semibold">{u.last_name || "—"}</div>
            </div>
            <div className="col-sm-6">
              <div className="small text-muted">Username</div>
              <div className="fw-semibold">{u.username}</div>
            </div>
            <div className="col-sm-6">
              <div className="small text-muted">Email</div>
              <div className="fw-semibold">{u.email}</div>
            </div>
          </div>
          <p className="text-muted small mt-3 mb-0">
            Editing profile fields can be added later on the backend.
          </p>
        </div>
      </div>
    </div>
  );
}
