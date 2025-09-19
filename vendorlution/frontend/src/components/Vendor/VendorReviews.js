import React, { useState } from "react";
import VendorSidebar from "./VendorSidebar";

function VendorReviews() {
  // Mock reviews (replace with API later)
  const [reviews] = useState([
    {
      id: 1,
      customer: "Jane Smith",
      rating: 5,
      comment: "Great laptop, works perfectly. Seller was very responsive!",
      date: "2025-09-15",
    },
    {
      id: 2,
      customer: "Mike Johnson",
      rating: 4,
      comment: "Jacket is stylish and fits well. Delivery took a bit longer.",
      date: "2025-09-14",
    },
    {
      id: 3,
      customer: "Anele N.",
      rating: 3,
      comment: "Phone works but battery drains fast. Seller did mention it.",
      date: "2025-09-12",
    },
  ]);

  // Helper to render stars
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
          <VendorSidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Customer Reviews</h3>

          {reviews.length > 0 ? (
            <div className="list-group">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="list-group-item list-group-item-action mb-2 rounded"
                >
                  <div className="d-flex justify-content-between">
                    <strong>{review.customer}</strong>
                    <small className="text-muted">{review.date}</small>
                  </div>
                  <div className="mb-1">{renderStars(review.rating)}</div>
                  <p className="mb-1">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorReviews;
