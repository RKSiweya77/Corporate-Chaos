function Testimonials() {
  return (
    <section className="mb-5">
      <div
        id="homeTestimonials"
        className="carousel slide my-4 border bg-dark text-white p-4"
        data-bs-ride="true"
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#homeTestimonials"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          />
          <button
            type="button"
            data-bs-target="#homeTestimonials"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          />
          <button
            type="button"
            data-bs-target="#homeTestimonials"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          />
        </div>
        <div className="carousel-inner">
          {[
            { quote: "Great escrow experience, super safe.", who: "Thandi" },
            { quote: "Messaging sellers is seamless.", who: "Lebo" },
            { quote: "Deposits & refunds are simple.", who: "Sizwe" },
          ].map((t, i) => (
            <div
              key={t.who}
              className={`carousel-item ${i === 0 ? "active" : ""}`}
            >
              <figure>
                <blockquote className="blockquote text-center">
                  <p>{t.quote}</p>
                </blockquote>
                <figcaption className="blockquote-footer text-center text-white-50">
                  {t.who}
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#homeTestimonials"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#homeTestimonials"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </section>
  );
}
export default Testimonials;
