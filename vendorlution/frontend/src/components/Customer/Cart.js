// components/Customer/Cart.js
import React from "react";
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
          <div className="table-responsive shadow-sm">
            <table className="table align-middle">
              <thead className="table-light">
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
                          width="50"
                          height="50"
                          className="me-2 rounded border"
                        />
                        <div>
                          <p className="mb-0 fw-semibold">{item.title}</p>
                          <small className="text-muted">Sold by {item.vendor}</small>
                        </div>
                      </div>
                    </td>
                    <td>R {item.price}</td>
                    <td>{item.qty}</td>
                    <td>R {item.price * item.qty}</td>
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

          <div className="d-flex justify-content-between align-items-center mt-3">
            <h5>Total: R {total}</h5>
            <Link to="/checkout" className="btn btn-dark">
              Proceed to Checkout
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="fa fa-shopping-cart fa-2x mb-2"></i>
          <p>Your cart is empty</p>
        </div>
      )}
    </div>
  );
}

export default Cart;
