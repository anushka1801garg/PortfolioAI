import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on fine pointer devices (desktop/mouse)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    
    const updatePointerType = () => {
      setIsFinePointer(mediaQuery.matches);
    };

    updatePointerType();
    mediaQuery.addEventListener("change", updatePointerType);

    if (!mediaQuery.matches) {
      return () => {
        mediaQuery.removeEventListener("change", updatePointerType);
      };
    }

    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isHovering = false;
    let isText = false;
    let isMouseDown = false;
    let animationFrameId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }

      // Instant update for the precise aiming dot
      if (dotRef.current) {
        const dotScale = isMouseDown ? "scale(1.3)" : isHovering ? "scale(0.5)" : "scale(1)";
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) ${dotScale}`;
      }
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const interactive = target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], select, label, .cursor-pointer, [data-cursor="pointer"]'
      );

      const textElement = target.closest(
        'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"], [data-cursor="text"]'
      );

      isHovering = Boolean(interactive);
      isText = Boolean(textElement);

      if (ringRef.current) {
        if (isHovering) {
          ringRef.current.classList.add("cursor-hover");
          ringRef.current.classList.remove("cursor-text");
        } else if (isText) {
          ringRef.current.classList.add("cursor-text");
          ringRef.current.classList.remove("cursor-hover");
        } else {
          ringRef.current.classList.remove("cursor-hover", "cursor-text");
        }
      }

      if (dotRef.current) {
        if (isText) {
          dotRef.current.classList.add("cursor-text");
          dotRef.current.classList.remove("cursor-hover");
        } else if (isHovering) {
          dotRef.current.classList.add("cursor-hover");
          dotRef.current.classList.remove("cursor-text");
        } else {
          dotRef.current.classList.remove("cursor-hover", "cursor-text");
        }
      }
    };

    const onMouseDown = (e) => {
      isMouseDown = true;
      if (ringRef.current) ringRef.current.classList.add("cursor-active");
      if (dotRef.current) dotRef.current.classList.add("cursor-active");

      // Spawn a luminous ripple at click location
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    const onMouseUp = () => {
      isMouseDown = false;
      if (ringRef.current) ringRef.current.classList.remove("cursor-active");
      if (dotRef.current) dotRef.current.classList.remove("cursor-active");
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    // Smooth inertia loop for trailing ring
    const renderLoop = () => {
      if (isVisible && ringRef.current) {
        // Fluid lerp factor (0.16) gives sleek weight without lag
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;

        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave, { passive: true });
    document.documentElement.addEventListener("mouseenter", onMouseEnter, { passive: true });

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      mediaQuery.removeEventListener("change", updatePointerType);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Automatically clean up ripple elements
  const handleRippleEnd = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  if (!isFinePointer) {
    return null;
  }

  return (
    <div className="custom-cursor-container" aria-hidden="true">
      {/* Outer Smooth Trailing Ring */}
      <div ref={ringRef} className="custom-cursor-ring" />

      {/* Instant Aiming Dot */}
      <div ref={dotRef} className="custom-cursor-dot" />

      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="custom-cursor-ripple"
          style={{
            transform: `translate3d(${ripple.x}px, ${ripple.y}px, 0) translate(-50%, -50%)`,
          }}
          onAnimationEnd={() => handleRippleEnd(ripple.id)}
        />
      ))}
    </div>
  );
}
