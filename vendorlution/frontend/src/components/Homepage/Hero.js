import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../logo.png"; // placeholder image
import "./Hero.css";
import SplitText from "./SplitText"; // ✅ Import SplitText

function Hero() {
  const [slides] = useState([
    {
      id: 1,
      image: logo,
      title: "Mega Electronics Sale",
      text: "Up to 40% off on selected gadgets.",
      link: "/category/electronics/1",
      btnText: "Shop Now",
    },
    {
      id: 2,
      image: logo,
      title: "Fashion Clearance",
      text: "Trendy styles at affordable prices.",
      link: "/category/fashion/2",
      btnText: "Explore",
    },
    {
      id: 3,
      image: logo,
      title: "Home & Living",
      text: "Upgrade your space with modern furniture.",
      link: "/vendor/store/home-comforts/4",
      btnText: "Visit Store",
    },
  ]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const carousel = document.getElementById("heroCarousel");

    const handleSlide = (e) => {
      setActiveIndex(e.to);
    };

    if (carousel) {
      carousel.addEventListener("slid.bs.carousel", handleSlide);
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener("slid.bs.carousel", handleSlide);
      }
    };
  }, []);

  const handleAnimationComplete = () => {
    console.log("Slide text animation complete!");
  };

  return (
    <div
      id="heroCarousel"
      className="carousel slide mb-4"
      data-bs-ride="carousel"
      data-bs-interval="5000" // ✅ Auto-slide every 5 sec
    >
      {/* Indicators */}
      <div className="carousel-indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={i}
            className={i === 0 ? "active" : ""}
            aria-current={i === activeIndex}
          ></button>
        ))}
      </div>

      {/* Slides */}
      <div className="carousel-inner rounded shadow-sm">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`carousel-item ${i === 0 ? "active" : ""}`}
          >
            <img
              src={s.image}
              className="d-block w-100"
              alt={s.title}
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
            <div className="carousel-caption d-none d-md-block text-start">
              {i === activeIndex && (
                <SplitText
                  key={s.title + activeIndex}
                  text={s.title}
                  className="hero-title"
                  delay={100}
                  duration={0.6}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="left"
                  onLetterAnimationComplete={handleAnimationComplete}
                />
              )}
              <p className="hero-text">{s.text}</p>
              <Link to={s.link} className="btn btn-primary btn-sm">
                {s.btnText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon"></span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  );
}

export default Hero;
