// src/components/Homepage/SplitText.js
import { useEffect, useRef } from "react";
import gsap from "gsap";

function SplitText({
  text,
  className = "",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  duration = 0.6,
  delay = 100,
  ease = "power3.out",
  splitType = "chars", // currently supports "chars", "words"
  textAlign = "left",
  onLetterAnimationComplete,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const targets = ref.current.querySelectorAll("span");

      gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          stagger: delay / 1000, // turn ms into seconds
          ease,
          onComplete: () => {
            if (onLetterAnimationComplete) {
              onLetterAnimationComplete();
            }
          },
        }
      );
    }
  }, [text, from, to, duration, delay, ease, onLetterAnimationComplete]);

  // Split text into spans
  const splitContent =
    splitType === "words"
      ? text.split(" ").map((word, i) => (
          <span
            key={i}
            style={{ display: "inline-block", marginRight: "0.25em" }}
          >
            {word}
          </span>
        ))
      : text.split("").map((char, i) => (
          <span key={i} style={{ display: "inline-block" }}>
            {char === " " ? "\u00A0" : char}
          </span>
        ));

  return (
    <div ref={ref} className={className} style={{ textAlign }}>
      {splitContent}
    </div>
  );
}

export default SplitText;
