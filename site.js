/* ===========================================================================
   Shared behavior: navigation dropdowns, mobile menu, GSAP scroll reveals.
   All animation is progressive enhancement — content is fully visible
   without JavaScript, and disabled for prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------- Navigation dropdowns ---------------- */

  const drops = document.querySelectorAll(".nav-links li.has-drop");

  drops.forEach(li => {
    const btn = li.querySelector(".drop-btn");
    if (!btn) return;

    btn.addEventListener("click", e => {
      e.stopPropagation();
      const wasOpen = li.classList.contains("open");
      drops.forEach(d => { d.classList.remove("open"); d.querySelector(".drop-btn").setAttribute("aria-expanded", "false"); });
      if (!wasOpen) {
        li.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    // open on hover for pointer devices
    li.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) {
        li.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
    li.addEventListener("mouseleave", () => {
      if (window.matchMedia("(hover: hover)").matches) {
        li.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("click", () => {
    drops.forEach(d => { d.classList.remove("open"); const b = d.querySelector(".drop-btn"); if (b) b.setAttribute("aria-expanded", "false"); });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      drops.forEach(d => d.classList.remove("open"));
      document.body.classList.remove("menu-open");
    }
  });

  /* ---------------- Mobile menu ---------------- */

  const burger = document.querySelector(".nav-burger");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------------- GSAP scroll reveals ---------------- */

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    // Single elements rise into view
    document.querySelectorAll("[data-reveal]").forEach(el => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 28,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    // Groups stagger their children
    document.querySelectorAll("[data-reveal-group]").forEach(group => {
      gsap.from(group.children, {
        autoAlpha: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 86%", once: true }
      });
    });

    // Hero painting: a slow, quiet settle
    const heroImg = document.querySelector(".hero-figure img");
    if (heroImg) {
      gsap.from(heroImg, { scale: 1.04, duration: 1.6, ease: "power2.out" });
    }

    // Display headline: line-by-line rise
    document.querySelectorAll("[data-reveal-lines]").forEach(el => {
      gsap.from(el.children, {
        autoAlpha: 0,
        y: 44,
        duration: 1.0,
        stagger: 0.12,
        ease: "power3.out"
      });
    });
  }
})();
