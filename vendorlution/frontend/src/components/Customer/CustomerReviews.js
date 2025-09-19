import React, { useState } from "react";
import Sidebar from "./Sidebar";

function CustomerReviews() {
  // Mock reviews written by customer
  const [reviews] = useState([
    {
      id: 1,
      product: "Second-Hand Laptop",
      rating: 5,
      comment: "Great value for the price! Seller was responsive.",
      date: "2025-09-15",
    },
    {
      id: 2,
      product: "Designer Jacket",
      rating: 4,
      comment: "Nice quality but delivery was a bit slow.",
      date: "2025-09-12",
    },
    {
      id: 3,
      product: "Old iPhone",
      rating: 3,
      comment: "Phone works but battery drains quickly.",
      date: "2025-09-10",
    },
  ]);

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa fa-star${i <= rating ? " text-warning" : " text-muted"}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">My Reviews</h3>

          {reviews.length > 0 ? (
            <div className="list-group">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="list-group-item list-group-item-action mb-2 rounded"
                >
                  <div className="d-flex justify-content-between">
                    <strong>{review.product}</strong>
                    <small className="text-muted">{review.date}</small>
                  </div>
                  <div className="mb-1">{renderStars(review.rating)}</div>
                  <p className="mb-1">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">You haven’t written any reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerReviews;
