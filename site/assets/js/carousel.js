/* Screenshot carousels on the Software page.
 *
 * The markup is already a working scroll-snap strip without this file — you can
 * swipe or scroll it. This adds arrows, dots and a counter, and only reveals
 * them once it has run, so the controls are never dead buttons.
 */
(function () {
  "use strict";

  function build(root) {
    var track = root.querySelector(".shots__track");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".shots__slide"));
    if (!track || slides.length < 2) return;

    var label = root.getAttribute("aria-label") || "screenshots";

    var controls = document.createElement("div");
    controls.className = "shots__controls";

    function button(cls, text, aria) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.innerHTML = text;
      b.setAttribute("aria-label", aria);
      return b;
    }

    var prev = button("shots__btn", "&#8592;", "Previous screenshot of " + label);
    var next = button("shots__btn", "&#8594;", "Next screenshot of " + label);
    var count = document.createElement("span");
    count.className = "shots__count";
    var dots = document.createElement("div");
    dots.className = "shots__dots";

    slides.forEach(function (slide, i) {
      var d = button("shots__dot", "", "Screenshot " + (i + 1) + " of " + slides.length);
      d.addEventListener("click", function () { go(i); });
      dots.appendChild(d);
    });

    controls.appendChild(prev);
    controls.appendChild(next);
    controls.appendChild(count);
    controls.appendChild(dots);
    root.appendChild(controls);

    var current = 0;

    function go(i) {
      current = Math.max(0, Math.min(slides.length - 1, i));
      // scrollIntoView would also scroll the page vertically; move the strip only.
      track.scrollTo({ left: slides[current].offsetLeft - track.offsetLeft,
                       behavior: "smooth" });
      sync();
    }

    function sync() {
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      count.textContent = (current + 1) + " / " + slides.length;
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.setAttribute("aria-current", String(i === current));
      });
    }

    prev.addEventListener("click", function () { go(current - 1); });
    next.addEventListener("click", function () { go(current + 1); });

    // Dragging or swiping the strip is the primary interaction; keep the
    // controls in step with wherever it actually came to rest.
    var settle;
    track.addEventListener("scroll", function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var nearest = 0, best = Infinity;
        slides.forEach(function (s, i) {
          var c = s.offsetLeft - track.offsetLeft + s.offsetWidth / 2;
          if (Math.abs(c - mid) < best) { best = Math.abs(c - mid); nearest = i; }
        });
        current = nearest;
        sync();
      }, 90);
    }, { passive: true });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    });
    track.tabIndex = 0;

    sync();
    root.classList.add("is-ready");
  }

  function init() {
    document.querySelectorAll(".shots").forEach(build);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
