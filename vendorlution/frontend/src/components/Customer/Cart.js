import Sidebar from "./Sidebar";
import logo from "../../logo.svg";
import { Link } from "react-router-dom";

function Cart() {
  const cartItems = [
    {
      id: 1,
      title: "Wireless Headphones",
      price: 1200,
      qty: 1,
      vendor: "TechWorld Store",
    },
    {
      id: 2,
      title: "Denim Jacket",
      price: 800,
      qty: 2,
      vendor: "Fashion Hub",
    },
  ];

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Cart Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">My Cart</h3>

          {cartItems.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
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
                              className="me-2 rounded"
                            />
                            <div>
                              <p className="mb-0 fw-bold">{item.title}</p>
                              <small className="text-muted">
                                Sold by {item.vendor}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>R {item.price}</td>
                        <td>{item.qty}</td>
                        <td>R {item.price * item.qty}</td>
                        <td>
                          <button className="btn btn-sm btn-danger">
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <h5>Total: R {total}</h5>
                <Link to="/checkout" className="btn btn-dark">
                  Proceed to Checkout
                </Link>
              </div>
            </>
          ) : (
            <p className="text-muted">Your cart is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
