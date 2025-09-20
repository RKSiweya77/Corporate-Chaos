// components/Vendor/VendorReviews.js
import React from "react";

function VendorReviews() {
  const reviews = [
    { id: 1, customer: "Alice", rating: 5, comment: "Great quality!" },
    { id: 2, customer: "Bob", rating: 4, comment: "Fast delivery." },
  ];

  return (
    <div className="container py-5">
      <h3 className="mb-4">Customer Reviews</h3>
      <div className="list-group shadow-sm">
        {reviews.map((r) => (
          <div key={r.id} className="list-group-item">
            <div className="d-flex justify-content-between">
              <strong>{r.customer}</strong>
              <span className="text-warning">
                {"⭐".repeat(r.rating)}
              </span>
            </div>
            <p className="mb-0 small text-muted">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center text-muted py-5">
            No reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorReviews;
