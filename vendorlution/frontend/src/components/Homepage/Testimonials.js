// components/Homepage/Testimonials.js
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("productrating/")
      .then((res) => setReviews(res.data.results || res.data))
      .catch((err) => console.error("Error fetching testimonials:", err));
  }, []);

  if (!reviews.length) return null;

  return (
    <div id="testimonialCarousel" className="carousel slide my-5">
      <div className="carousel-inner">
        {reviews.map((r, i) => (
          <div
            key={r.id}
            className={`carousel-item ${i === 0 ? "active" : ""}`}
          >
            <figure className="text-center">
              <blockquote className="blockquote">
                <p>"{r.reviews}"</p>
              </blockquote>
              <figcaption className="blockquote-footer">
                {r.customer?.user?.username} on {r.product?.title}
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Testimonials;
