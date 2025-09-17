import { useState } from "react";
import Sidebar from "./Sidebar";
import logo from "../../logo.svg"; // or your product image

function Wishlist() {
  // Example wishlist data (later you can fetch this from backend API)
  const [wishlist, setWishlist] = useState([
    { id: 1, name: "Phone", price: 500, image: logo },
    { id: 2, name: "Speaker", price: 500, image: logo },
    { id: 3, name: "Earphones", price: 500, image: logo },
    { id: 4, name: "Trouser", price: 500, image: logo },
  ]);

  // Function to remove item
  const removeItem = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-3">
          <Sidebar />
        </aside>

        {/* Wishlist Table */}
        <section className="col-md-9">
          <h3 className="mb-3">My Wishlist</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.length > 0 ? (
                wishlist.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        width="40"
                        className="me-2"
                      />
                      {item.name}
                    </td>
                    <td>R {item.price}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No items in wishlist
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default Wishlist;
