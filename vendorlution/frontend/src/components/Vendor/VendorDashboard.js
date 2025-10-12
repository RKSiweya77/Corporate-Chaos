import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function VendorDashboard() {
  const { getVendorId } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState({ products: 0, orders: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = getVendorId();
        const [v, p, o] = await Promise.all([
          api.get(`/vendors/${id}/`),
          api.get(`/products/?vendor_id=${id}`),
          api.get(`/me/vendor/orders/`),
        ]);
        setVendor(v.data);
        setStats({ products: p.data.results?.length || 0, orders: o.data.results?.length || 0 });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [getVendorId]);

  if (!vendor) return <div className="container py-5 text-center">Loading shop data...</div>;

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">{vendor.shop_name}</h3>
      <p className="text-muted">{vendor.description}</p>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card p-3 shadow-sm text-center">
            <h4>{stats.products}</h4>
            <p>Products</p>
            <Link to="/vendor/add-product" className="btn btn-sm btn-outline-dark">
              Add Product
            </Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow-sm text-center">
            <h4>{stats.orders}</h4>
            <p>Orders</p>
            <Link to="/vendor/orders" className="btn btn-sm btn-outline-dark">
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
