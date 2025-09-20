// components/Customer/CustomerReviews.js
import React from "react";

function CustomerReviews() {
  const reviews = [
    { id: 1, product: "Wireless Headphones", rating: 5, comment: "Excellent quality!" },
    { id: 2, product: "Denim Jacket", rating: 4, comment: "Fits perfectly" },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Reviews</h3>
      <div className="row g-3">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div className="col-md-6" key={r.id}>
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <h6 className="fw-bold">{r.product}</h6>
                  <p className="mb-1 text-warning">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </p>
                  <p className="text-muted small">{r.comment}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted">
            <i className="fa fa-star fa-2x mb-2"></i>
            <p>You haven’t reviewed any products yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerReviews;
