// components/Homepage/Hero.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function Hero() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("products/?limit=3") // backend paginated endpoint
      .then((res) => setFeatured(res.data.results || res.data))
      .catch((err) => console.error("Error fetching hero products:", err));
  }, []);

  if (!featured.length) {
    return null; // don’t render if no products yet
  }

  return (
    <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {featured.map((p, i) => (
          <div
            key={p.id}
            className={`carousel-item ${i === 0 ? "active" : ""}`}
          >
            <div
              className="d-flex flex-column justify-content-center align-items-center text-center bg-dark text-white"
              style={{ height: "300px" }}
            >
              <h2 className="fw-bold">{p.title}</h2>
              <p className="mb-2">{p.detail}</p>
              <Link
                to={`/product/${p.title.toLowerCase().replace(/\s+/g, "-")}/${p.id}`}
                className="btn btn-light"
              >
                View Deal
              </Link>
            </div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default Hero;
