import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Vendorlution made buying second-hand so safe and easy!",
    who: "Lerato",
    rating: 5,
  },
  {
    quote: "Funds only release after I confirm delivery. Safe!",
    who: "Sipho",
    rating: 4,
  },
  {
    quote: "Checkout was smooth and support quick.",
    who: "Thandi",
    rating: 5,
  },
  {
    quote: "I trust buying here more than on Facebook Marketplace.",
    who: "Nomvula",
    rating: 5,
  },
  {
    quote: "The escrow system gives me peace of mind.",
    who: "Kabelo",
    rating: 4,
  },
];

function Testimonials() {
  const [index, setIndex] = useState(0);

  // Rotate reviews every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 3) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Pick 3 reviews at a time
  const visible = TESTIMONIALS.slice(index, index + 3);

  return (
    <section className="py-5">
      <div className="container">
        <h3 className="text-center mb-4">What Our Users Say</h3>

        <div className="row g-4 justify-content-center">
          <AnimatePresence>
            {visible.map((t, i) => (
              <motion.div
                key={t.who}
                className="col-12 col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className="card h-100 shadow-sm border-0"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="card-body text-center">
                    <p className="fst-italic mb-3">“{t.quote}”</p>
                    <div className="mb-2">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <i key={idx} className="fa fa-star text-warning"></i>
                      ))}
                    </div>
                    <h6 className="fw-bold">{t.who}</h6>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
