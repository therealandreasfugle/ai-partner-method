/* Terramar Estates - motion layer: Lenis smooth scroll + staggered reveals */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lenis = null;

  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // anchor links scroll through lenis so the easing matches
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) { lenis.scrollTo(target, { offset: 0, duration: 1.4 }); }
      else { target.scrollIntoView({ behavior: "smooth" }); }
    });
  });

  // staggered in-view reveals
  var rv = Array.prototype.slice.call(document.querySelectorAll("[data-rv]"));
  if ("IntersectionObserver" in window && !reduced) {
    var seen = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger siblings that arrive in the same frame
        el.style.setProperty("--d", (seen % 4) * 90 + "ms");
        seen++;
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  // demo form: acknowledge without a backend
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button");
      btn.querySelector("span").textContent = "Received. We reply within a day.";
      btn.disabled = true;
      btn.style.opacity = "0.85";
    });
  }
})();
