/* v2: give every neon sign its own colour and its own flicker timing,
   so the page doesn't blink in unison. */
(function () {
  var cols = ['#ff2bd6', '#22e3ff', '#ffd23f', '#b16cff', '#3dffb5', '#ff4d6d'];
  document.querySelectorAll('.work > li, .links > li, .record > li, .role, .proj-shot').forEach(function (el, i) {
    el.style.setProperty('--neon', cols[i % cols.length]);
    el.style.setProperty('--flick', (2 + (i * 1.37) % 5).toFixed(2) + 's');
    el.style.setProperty('--flick-delay', ((i * .73) % 4).toFixed(2) + 's');
  });
})();
