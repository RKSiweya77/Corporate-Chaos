import React, { useState } from "react";
import api from "../../api/axios";

export default function CreateDiscount(){
  const vendorId = localStorage.getItem("vendor_id") || "1";
  const [form, setForm] = useState({ name: "", percent: "", valid_from: "", valid_to: "" });
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const onChange = (e)=> setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = (e)=>{ e.preventDefault(); setErr(""); setOk("");
    api.post("/discounts/", { vendor: vendorId, name: form.name, percent: form.percent, valid_from: form.valid_from, valid_to: form.valid_to })
      .then(()=>{ setOk("Discount created"); setForm({ name:"", percent:"", valid_from:"", valid_to:"" }); })
      .catch(()=> setErr("Failed to create discount"));
  };
  return (
    <div className="container py-5" style={{maxWidth:560}}>
      <div className="card shadow-sm border-0"><div className="card-body">
        <h3 className="mb-4">Create Discount</h3>
        {err && <div className="alert alert-danger">{err}</div>}
        {ok && <div className="alert alert-success">{ok}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3"><label className="form-label">Name</label><input className="form-control" name="name" value={form.name} onChange={onChange} /></div>
          <div className="mb-3"><label className="form-label">Percent (%)</label><input type="number" className="form-control" name="percent" value={form.percent} onChange={onChange} /></div>
          <div className="mb-3"><label className="form-label">Valid From</label><input type="datetime-local" className="form-control" name="valid_from" value={form.valid_from} onChange={onChange} /></div>
          <div className="mb-3"><label className="form-label">Valid To</label><input type="datetime-local" className="form-control" name="valid_to" value={form.valid_to} onChange={onChange} /></div>
          <button className="btn btn-dark w-100" type="submit"><i className="fa fa-plus me-2"></i>Create Discount</button>
        </form>
      </div></div>
    </div>
  );
}
