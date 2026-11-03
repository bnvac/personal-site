/* v2 background: a procedurally drawn cyberpunk city.
   Four layers of towers with lit windows and neon, rain, and haze. Layers
   move at different speeds as you scroll, and the scene dims as content
   rises over it. Everything is drawn here; there are no image files. */
(function () {
  var cv = document.getElementById('city');
  if (!cv) return;
  var cx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, layers = [], drops = [], seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var NEON = ['#ff2bd6', '#22e3ff', '#ffb02e', '#7c5cff', '#ff4d6d'];

  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    seed = 7; layers = [];
    var spec = [
      { base: .62, hMin: .08, hMax: .26, wMin: 30, wMax: 70, col: [30, 18, 66], lit: .08, speed: .05 },
      { base: .72, hMin: .10, hMax: .32, wMin: 40, wMax: 90, col: [20, 12, 46], lit: .11, speed: .11 },
      { base: .84, hMin: .12, hMax: .40, wMin: 55, wMax: 120, col: [12, 8, 30], lit: .13, speed: .2 },
      { base: 1.0, hMin: .14, hMax: .44, wMin: 80, wMax: 170, col: [5, 4, 14], lit: .09, speed: .34 }
    ];
    spec.forEach(function (s, li) {
      var c = document.createElement('canvas');
      c.width = W * dpr; c.height = H * 1.6 * dpr;
      var g = c.getContext('2d'); g.scale(dpr, dpr);
      var x = -20, ground = H * 1.6 - (1 - s.base) * H;
      while (x < W + 20) {
        var w = s.wMin + rnd() * (s.wMax - s.wMin), h = H * (s.hMin + rnd() * (s.hMax - s.hMin)), top = ground - h;
        g.fillStyle = 'rgb(' + s.col.join(',') + ')';
        g.fillRect(x, top, w, H * 1.6 - top);
        if (rnd() < .35) { g.fillRect(x + w * .45, top - 18 - rnd() * 40, 2, 60); }      // antenna
        if (rnd() < .25) { g.fillRect(x + w * .15, top - 10, w * .5, 10); }             // rooftop box
        // windows
        var ww = 2 + li * .6, wh = 3 + li * .8, gx = 5 + li * 1.5, gy = 7 + li * 1.8;
        for (var yy = top + 8; yy < H * 1.6; yy += gy) for (var xx = x + 5; xx < x + w - 5; xx += gx) {
          if (rnd() < s.lit) {
            var warm = rnd() < .3;
            g.fillStyle = warm ? 'rgba(255,190,110,' + (.35 + rnd() * .5) + ')' : 'rgba(120,230,255,' + (.25 + rnd() * .5) + ')';
            g.fillRect(xx, yy, ww, wh);
          }
        }
        // neon sign
        if (li >= 1 && rnd() < .28) {
          var col = NEON[(rnd() * NEON.length) | 0], vy = top + 20 + rnd() * h * .3, vertical = rnd() < .6;
          g.save(); g.shadowColor = col; g.shadowBlur = 18 + li * 6; g.fillStyle = col;
          if (vertical) g.fillRect(x + w - 10 - li, vy, 4 + li, 40 + rnd() * 80);
          else g.fillRect(x + 8, vy, w * .6, 4 + li);
          g.restore();
        }
        x += w + rnd() * 6;
      }
      layers.push({ c: c, speed: s.speed });
    });
    drops = [];
    for (var i = 0; i < (reduce ? 0 : Math.round(W * H / 9000)); i++) drops.push({ x: rnd() * W, y: rnd() * H, l: 8 + rnd() * 18, v: 9 + rnd() * 9 });
  }

  function sky(scroll) {
    var g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07040f'); g.addColorStop(.45, '#1a0b33'); g.addColorStop(.75, '#4a1250'); g.addColorStop(1, '#ff3d8b');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // haze glow behind the skyline
    var r = cx.createRadialGradient(W * .5, H * .78, 10, W * .5, H * .78, W * .7);
    r.addColorStop(0, 'rgba(255,60,170,.35)'); r.addColorStop(1, 'rgba(255,60,170,0)');
    cx.fillStyle = r; cx.fillRect(0, 0, W, H);
  }

  function frame() {
    var s = scrollY;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sky(s);
    layers.forEach(function (L) {
      cx.drawImage(L.c, 0, 0, L.c.width, L.c.height, 0, -H * .6 + s * L.speed * -1 + H * .0, W, H * 1.6);
    });
    // fog band
    var f = cx.createLinearGradient(0, H * .55, 0, H);
    f.addColorStop(0, 'rgba(120,40,160,0)'); f.addColorStop(1, 'rgba(40,10,60,.55)');
    cx.fillStyle = f; cx.fillRect(0, 0, W, H);
    // rain
    cx.strokeStyle = 'rgba(170,210,255,.22)'; cx.lineWidth = 1; cx.beginPath();
    drops.forEach(function (d) { cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.l * .18, d.y + d.l); d.y += d.v; d.x -= d.v * .18; if (d.y > H) { d.y = -20; d.x = Math.random() * (W + 60); } });
    cx.stroke();
    // dim as the page scrolls up over the city
    var dim = Math.min(.72, s / (H * 1.1) * .72);
    if (dim > 0) { cx.fillStyle = 'rgba(4,3,10,' + dim + ')'; cx.fillRect(0, 0, W, H); }
  }

  var raf;
  function loop() { frame(); if (!reduce) raf = requestAnimationFrame(loop); }
  build(); loop();
  if (reduce) addEventListener('scroll', function () { requestAnimationFrame(frame); }, { passive: true });
  var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { build(); frame(); }, 150); });
})();
