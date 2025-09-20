// components/Customer/Cart.js
import { Link } from "react-router-dom";
import logo from "../../logo.png";

function Cart() {
  const cartItems = [
    { id: 1, title: "Wireless Headphones", price: 1200, qty: 1, vendor: "TechWorld" },
    { id: 2, title: "Denim Jacket", price: 800, qty: 2, vendor: "Fashion Hub" },
  ];

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="container py-4">
      <h3 className="mb-4">My Cart</h3>

      {cartItems.length > 0 ? (
        <>
          <div className="table-responsive shadow-sm rounded">
            <table className="table align-middle">
              <thead className="table-dark text-white">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={logo}
                          alt={item.title}
                          width="60"
                          height="60"
                          className="me-3 rounded border"
                          style={{ objectFit: "cover" }}
                        />
                        <div>
                          <p className="mb-0 fw-semibold">{item.title}</p>
                          <small className="text-muted">Sold by {item.vendor}</small>
                        </div>
                      </div>
                    </td>
                    <td className="fw-semibold">R {item.price}</td>
                    <td>{item.qty}</td>
                    <td className="fw-semibold">R {item.price * item.qty}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Checkout summary card */}
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <h5 className="mb-3 mb-md-0">
                Total: <span className="fw-bold">R {total}</span>
              </h5>
              <Link to="/checkout" className="btn btn-dark btn-lg">
                Proceed to Checkout <i className="fa fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="fa fa-shopping-cart fa-3x mb-3"></i>
          <p className="fw-semibold">Your cart is empty</p>
        </div>
      )}
    </div>
  );
}

export default Cart;
