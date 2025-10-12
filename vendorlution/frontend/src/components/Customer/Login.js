import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { search } = useLocation();
  const { login } = useAuth();

  const [id, setId] = useState("");     // email or username
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const next = new URLSearchParams(search).get("next") || "/";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(id.trim(), pw);
      nav(next, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail
        || (typeof err.response?.data === "object" ? JSON.stringify(err.response.data) : "Login failed");
      setError(msg);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h3 className="mb-3">Sign in</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={submit} className="card p-3 shadow-sm border-0">
        <label className="form-label">Email or Username</label>
        <input className="form-control mb-3" value={id} onChange={e=>setId(e.target.value)} required />

        <label className="form-label">Password</label>
        <input type="password" className="form-control mb-4" value={pw} onChange={e=>setPw(e.target.value)} required />

        <button className="btn btn-dark" type="submit">Sign in</button>
        <div className="mt-3">New here? <Link to="/customer/register">Create an account</Link></div>
      </form>
    </div>
  );
}