// components/Customer/Wishlist.js
import logo from "../../logo.png";

function Wishlist() {
  const wishlist = [
    {
      id: 1,
      title: "Smart Watch",
      price: 1500,
      vendor: "TechWorld Store",
    },
    {
      id: 2,
      title: "Sneakers",
      price: 950,
      vendor: "Fashion Hub",
    },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Wishlist</h3>

      {wishlist.length > 0 ? (
        <div className="row g-3">
          {wishlist.map((item) => (
            <div key={item.id} className="col-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                <img
                  src={logo}
                  alt={item.title}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h6 className="fw-bold mb-1">{item.title}</h6>
                  <p className="text-muted small mb-1">R {item.price}</p>
                  <small className="text-muted d-block mb-2">
                    {item.vendor}
                  </small>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-sm btn-dark">
                      <i className="fa fa-cart-plus me-1"></i> Add to Cart
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="fa fa-heart fa-2x mb-2"></i>
          <p>Your wishlist is empty.</p>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
