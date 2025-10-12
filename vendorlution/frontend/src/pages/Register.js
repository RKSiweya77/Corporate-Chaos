// frontend/src/pages/Register.js
import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      // 1) Create the account (buyer by default)
      await api.post("/auth/register/", {
        username: form.username,
        email: form.email || "",
        password: form.password,
        first_name: form.first_name || "",
        last_name: form.last_name || "",
      });

      // 2) OPTIONAL: auto-login immediately
      await login(form.username, form.password);

      // 3) Go home (or wherever)
      nav("/", { replace: true });
    } catch (e) {
      // Common cases: username taken, password < 6 chars, missing fields
      const msg =
        e?.response?.data
          ? JSON.stringify(e.response.data)
          : "Registration failed. Please check your details.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h3 className="mb-3">Create account</h3>
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">First name</label>
                <input className="form-control" name="first_name" value={form.first_name} onChange={onChange} />
              </div>
              <div className="mb-3 col-md-6">
                <label className="form-label">Last name</label>
                <input className="form-control" name="last_name" value={form.last_name} onChange={onChange} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Username *</label>
              <input className="form-control" name="username" value={form.username} onChange={onChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={onChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password *</label>
              <input type="password" className="form-control" name="password" value={form.password} onChange={onChange} required />
              <div className="form-text">Minimum 6 characters.</div>
            </div>
            <button className="btn btn-dark w-100" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
