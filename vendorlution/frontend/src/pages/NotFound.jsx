// src/pages/NotFound.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * FuzzyText
 * Animated scanline-style text rendered to a canvas.
 * Safe for SSR (all DOM work happens in useEffect).
 */
function FuzzyText({
  children,
  fontSize = "clamp(4rem, 16vw, 14rem)",
  fontWeight = 900,
  fontFamily = "inherit",
  color = "#0d6efd", // default to theme-ish primary
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      // Wait for fonts if the browser supports it
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        /* ignore */
      }
      if (isCancelled) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const computedFontFamily =
        fontFamily === "inherit"
          ? window.getComputedStyle(canvas).fontFamily || "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          : fontFamily;

      // Resolve font size to px
      const fontSizeStr = typeof fontSize === "number" ? `${fontSize}px` : fontSize;
      let numericFontSize;
      if (typeof fontSize === "number") {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement("span");
        temp.style.fontSize = fontSizeStr;
        document.body.appendChild(temp);
        const computedSize = window.getComputedStyle(temp).fontSize;
        numericFontSize = parseFloat(computedSize);
        temp.remove();
      }

      const text = React.Children.toArray(children).join("");

      // Offscreen render for clean slicing
      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = "alphabetic";
      const metrics = offCtx.measureText(text);

      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);

      const extraWidthBuffer = 10;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      const xOffset = extraWidthBuffer / 2;
      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = "alphabetic";
      offCtx.fillStyle = color;
      offCtx.fillText(text, xOffset - actualLeft, actualAscent);

      // Size visible canvas with some breathing room
      const horizontalMargin = 40;
      const verticalMargin = 0;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight + verticalMargin * 2;
      ctx.setTransform(1, 0, 0, 1, horizontalMargin, verticalMargin);

      // Pointer interaction region
      const interactiveLeft = horizontalMargin + xOffset;
      const interactiveTop = verticalMargin;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      let isHovering = false;
      const fuzzRange = 30;

      const run = () => {
        if (isCancelled) return;
        ctx.clearRect(-fuzzRange, -fuzzRange, offscreenWidth + 2 * fuzzRange, tightHeight + 2 * fuzzRange);
        const intensity = isHovering ? hoverIntensity : baseIntensity;
        for (let j = 0; j < tightHeight; j++) {
          const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
          ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
        }
        animationFrameId = window.requestAnimationFrame(run);
      };

      run();

      const isInsideTextArea = (x, y) =>
        x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;

      const handleMouseMove = (e) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };
      const handleMouseLeave = () => {
        isHovering = false;
      };
      const handleTouchMove = (e) => {
        if (!enableHover) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };
      const handleTouchEnd = () => {
        isHovering = false;
      };

      if (enableHover) {
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
        canvas.addEventListener("touchend", handleTouchEnd);
      }

      const cleanup = () => {
        window.cancelAnimationFrame(animationFrameId);
        if (enableHover) {
          canvas.removeEventListener("mousemove", handleMouseMove);
          canvas.removeEventListener("mouseleave", handleMouseLeave);
          canvas.removeEventListener("touchmove", handleTouchMove);
          canvas.removeEventListener("touchend", handleTouchEnd);
        }
      };

      // Expose cleanup on the node (used in effect cleanup)
      canvas.cleanupFuzzyText = cleanup;
    };

    init();

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      if (canvas && canvas.cleanupFuzzyText) canvas.cleanupFuzzyText();
    };
  }, [children, fontSize, fontWeight, fontFamily, color, enableHover, baseIntensity, hoverIntensity]);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "auto" }} />;
}

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found - Vendorlution";
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {/* Hero */}
          <div className="text-center mb-4">
            <div className="mx-auto" style={{ maxWidth: 900 }}>
              <FuzzyText
                fontSize="clamp(3.5rem, 18vw, 12rem)"
                fontWeight={900}
                color="#212529" // dark for light background (Bootstrap body color)
                baseIntensity={0.15}
                hoverIntensity={0.45}
              >
                404
              </FuzzyText>
            </div>
            <h1 className="h2 fw-bold mt-3">Page Not Found</h1>
            <p className="text-muted lead mb-4">
              The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
            </p>
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 justify-content-center flex-wrap mb-5">
            <Link to="/" className="btn btn-dark btn-lg px-4">
              <i className="fa fa-home me-2" />
              Go Home
            </Link>
            <Link to="/products" className="btn btn-outline-dark btn-lg px-4">
              <i className="fa fa-store me-2" />
              Browse Products
            </Link>
            <Link to="/vendors" className="btn btn-outline-secondary btn-lg px-4">
              <i className="fa fa-storefront me-2" />
              Explore Vendors
            </Link>
          </div>

          {/* Help links */}
          <div className="text-center pt-4 border-top">
            <p className="text-muted small mb-2">Still need help?</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/contact" className="text-decoration-none small">
                <i className="fa fa-envelope me-1" /> Contact Support
              </Link>
              <span className="text-muted">•</span>
              <Link to="/help" className="text-decoration-none small">
                <i className="fa fa-question-circle me-1" /> Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}