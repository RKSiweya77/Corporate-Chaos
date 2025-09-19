import React from "react";
import Sidebar from "./Sidebar";

function CustomerSupport() {
  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-12 mb-2">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-12 mb-2">
          <h3 className="mb-3">Help & Support</h3>

          {/* FAQ Section */}
          <div className="accordion mb-4" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="faq1">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse1"
                  aria-expanded="true"
                  aria-controls="collapse1"
                >
                  How do I place an order?
                </button>
              </h2>
              <div
                id="collapse1"
                className="accordion-collapse collapse show"
                aria-labelledby="faq1"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Browse products, add items to your cart, and checkout using your Vendorlution Wallet or saved payment method.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faq2">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse2"
                  aria-expanded="false"
                  aria-controls="collapse2"
                >
                  How does payment work?
                </button>
              </h2>
              <div
                id="collapse2"
                className="accordion-collapse collapse"
                aria-labelledby="faq2"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  All payments are processed through Vendorlution Wallet for safety. Your money is held in escrow until you confirm delivery.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faq3">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse3"
                  aria-expanded="false"
                  aria-controls="collapse3"
                >
                  What if my order doesn’t arrive?
                </button>
              </h2>
              <div
                id="collapse3"
                className="accordion-collapse collapse"
                aria-labelledby="faq3"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  If your order doesn’t arrive, you can open a case in the Resolution Center. Funds will only be released once you confirm delivery.
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="card">
            <div className="card-body">
              <h5>Contact Support</h5>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Support request submitted (mock).");
                }}
              >
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows="4" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fa fa-paper-plane me-2"></i> Send
                </button>
              </form>
            </div>
          </div>

          <p className="text-muted small mt-2">
            <i className="fa fa-info-circle me-1"></i>
            This is a mock support center. Later, we’ll connect it to the backend
            so messages go directly to our helpdesk.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;
