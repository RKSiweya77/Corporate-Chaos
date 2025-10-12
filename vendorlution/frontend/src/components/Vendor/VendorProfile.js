import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function VendorProfile() {
  const { getVendorId } = useAuth();
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const id = getVendorId();
    if (!id) return;
    api.get(`/vendors/${id}/`).then((res) => setVendor(res.data));
  }, [getVendorId]);

  if (!vendor) return <div className="container py-5">Loading...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <h3 className="fw-bold mb-3">{vendor.shop_name}</h3>
      <p>{vendor.description}</p>
      <p className="text-muted">Address: {vendor.address || "Not set"}</p>
      <p className="text-muted">Rating: {vendor.rating_avg} ★</p>
    </div>
  );
}
