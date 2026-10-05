/* Click a project screenshot to see it whole.
 *
 * Each trigger is a plain link to the full image, so with JavaScript off
 * clicking still shows the picture — this only intercepts that and puts it in
 * an overlay instead of navigating away.
 */
(function () {
  "use strict";

  var box = null, lastFocus = null;

  function close() {
    if (!box) return;
    box.classList.remove("is-open");
    document.body.classList.remove("lb-open");
    var dead = box;
    box = null;
    // Let the fade finish before the node goes, unless motion is reduced.
    var instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(function () { dead.remove(); }, instant ? 0 : 180);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function open(trigger) {
    close();
    lastFocus = trigger;

    var src = trigger.getAttribute("href");
    var name = trigger.getAttribute("data-title") || "";
    var caption = trigger.getAttribute("data-caption") || "";

    box = document.createElement("div");
    box.className = "lb";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", name ? name + ", full screenshot" : "Full screenshot");

    var fig = document.createElement("figure");
    fig.className = "lb__fig";

    var img = document.createElement("img");
    img.src = src;
    img.alt = trigger.querySelector("img") ? trigger.querySelector("img").alt : name;
    fig.appendChild(img);

    if (name || caption) {
      var cap = document.createElement("figcaption");
      cap.className = "lb__cap";
      if (name) {
        var b = document.createElement("b");
        b.textContent = name;
        cap.appendChild(b);
        if (caption) cap.appendChild(document.createTextNode(" — "));
      }
      if (caption) cap.appendChild(document.createTextNode(caption));
      fig.appendChild(cap);
    }

    var shut = document.createElement("button");
    shut.type = "button";
    shut.className = "lb__close";
    shut.innerHTML = "&times;";
    shut.setAttribute("aria-label", "Close");
    shut.addEventListener("click", close);

    box.appendChild(fig);
    box.appendChild(shut);

    // Clicking the backdrop closes; clicking the picture itself does not.
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target === fig) close();
    });

    document.body.appendChild(box);
    document.body.classList.add("lb-open");
    // Next frame, so the opening transition actually runs.
    window.requestAnimationFrame(function () {
      if (box) box.classList.add("is-open");
    });
    shut.focus();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;
    // Leave modified clicks alone so "open in new tab" still works.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open(trigger);
  });

  document.addEventListener("keydown", function (e) {
    if (!box) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    // The overlay holds one control, so keep Tab on it rather than letting
    // focus wander into the page behind.
    if (e.key === "Tab") { e.preventDefault(); box.querySelector(".lb__close").focus(); }
  });
})();
