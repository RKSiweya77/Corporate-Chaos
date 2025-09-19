import { motion } from "framer-motion";

const steps = [
  { icon: "fa-money-bill", title: "Fund your Wallet", desc: "Instant EFT, card, EFT, or voucher." },
  { icon: "fa-shield", title: "Buy Safely (Escrow)", desc: "Funds held until you confirm delivery." },
  { icon: "fa-star", title: "Confirm & Review", desc: "Release funds & rate your experience." },
];

function HowItWorks() {
  return (
    <section className="mb-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="mb-3">How Vendorlution Works</h3>
          <div className="row g-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                className="col-md-4"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="p-3 bg-light rounded h-100">
                  <h6><i className={`fa ${s.icon} me-2`} />{s.title}</h6>
                  <p className="small mb-0">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default HowItWorks;
