/* v2 background: an original night city, drawn in the browser.
   Glass towers in three depths, holographic billboards for the projects,
   a cable-stayed bridge, water that reflects it all, haze and light rain.
   Static layers are painted once to offscreen canvases; only the signs'
   flicker, the billboard scanlines and the rain animate. */
(function () {
  var cv = document.getElementById('city');
  if (!cv) return;
  var cx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, seed, layers, boards, drops, horizon;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function pick(a) { return a[(rnd() * a.length) | 0]; }
  var NEON = ['#ff2bd6', '#22e3ff', '#b16cff', '#ffcf3a', '#ff4d6d', '#3dffb5'];
  var WORDS = ['INTRAWEB', 'HEARTH', 'STDNT', 'BACKOFFICE', 'SMART SHELF', 'BASELAYER', 'ARTWORK', 'BNVAC', '24/7', 'OPEN'];

  function offscreen(w, h) { var c = document.createElement('canvas'); c.width = w * dpr; c.height = h * dpr; var g = c.getContext('2d'); g.scale(dpr, dpr); return { c: c, g: g }; }

  function tower(g, x, w, top, base, depth) {
    // glass body: dark navy to violet, lighter at one edge
    var gr = g.createLinearGradient(x, 0, x + w, 0);
    var a = [8 + depth * 4, 10 + depth * 4, 28 + depth * 10], b = [22 + depth * 8, 14 + depth * 4, 52 + depth * 14];
    gr.addColorStop(0, 'rgb(' + b.join(',') + ')'); gr.addColorStop(.5, 'rgb(' + a.join(',') + ')'); gr.addColorStop(1, 'rgb(' + a.map(function (v) { return v * .7 | 0; }).join(',') + ')');
    g.fillStyle = gr; g.fillRect(x, top, w, base - top);
    // stepped crown or spire
    var r = rnd();
    if (r < .3) { g.fillRect(x + w * .2, top - h(18), w * .6, h(18)); g.fillRect(x + w * .4, top - h(40), w * .2, h(22)); }
    else if (r < .5) { g.fillRect(x + w * .48, top - h(70), 2, h(70)); }
    // floors: thin horizontal light bands, some vertical neon strips
    var band = 5 + depth * 2;
    for (var y = top + 6; y < base; y += band) {
      if (rnd() < .55) {
        var lit = rnd(), alpha = .12 + lit * .45;
        g.fillStyle = lit > .85 ? 'rgba(255,200,120,' + alpha + ')' : 'rgba(110,200,255,' + alpha + ')';
        var x0 = x + 3, x1 = x + w - 3;
        while (x0 < x1) { var seg = 6 + rnd() * 30; if (rnd() < .7) g.fillRect(x0, y, Math.min(seg, x1 - x0), 1.2 + depth * .4); x0 += seg + 2; }
      }
    }
    if (rnd() < .45 + depth * .15) {
      var col = pick(NEON); g.save(); g.shadowColor = col; g.shadowBlur = 10 + depth * 6; g.fillStyle = col;
      var sx = rnd() < .5 ? x + 2 : x + w - 4; g.fillRect(sx, top + (base - top) * rnd() * .3, 2 + depth, (base - top) * (.3 + rnd() * .5)); g.restore();
    }
    if (rnd() < .5) { g.save(); g.shadowColor = '#ff2b4a'; g.shadowBlur = 8; g.fillStyle = '#ff5a6e'; g.fillRect(x + w * .48, top - 4, 3, 3); g.restore(); } // aircraft light
  }
  function h(v) { return v * (H / 900); }

  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight; seed = 20261103;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    horizon = H * .78;
    layers = []; boards = [];
    var spec = [
      { n: 0, hMin: .18, hMax: .42, wMin: 26, wMax: 60, gap: 2, speed: .04, fade: .55 },
      { n: 1, hMin: .26, hMax: .62, wMin: 40, wMax: 90, gap: 4, speed: .09, fade: .25 },
      { n: 2, hMin: .32, hMax: .80, wMin: 60, wMax: 140, gap: 10, speed: .16, fade: 0 }
    ];
    spec.forEach(function (s) {
      var L = offscreen(W, H * 1.2), g = L.g, base = horizon + H * .02 * s.n, x = -30;
      while (x < W + 30) {
        var w = s.wMin + rnd() * (s.wMax - s.wMin);
        // taller near the middle so the skyline peaks behind the name
        var mid = 1 - Math.abs((x + w / 2) / W - .5) * 1.2;
        var top = base - H * (s.hMin + rnd() * (s.hMax - s.hMin)) * (.6 + .6 * mid);
        tower(g, x, w, top, base + 4, s.n);
        if (s.n >= 1 && w > 50 && rnd() < .32) boards.push({ layer: layers.length, x: x + w * .12, y: top + (base - top) * (.12 + rnd() * .35), w: w * .76, h: Math.min((base - top) * .3, w * (.8 + rnd() * .9)), word: pick(WORDS), c1: pick(NEON), c2: pick(NEON), ph: rnd() * 6 });
        x += w + s.gap * rnd();
      }
      if (s.fade) { g.fillStyle = 'rgba(30,14,70,' + s.fade + ')'; g.fillRect(0, 0, W, base + 6); }
      layers.push({ c: L.c, speed: s.speed });
    });
    // bridge, on the right, over the water
    var B = offscreen(W, H), g = B.g, bx = W * .62, by = horizon + h(6), pyl = [bx + W * .07, bx + W * .25];
    g.strokeStyle = 'rgba(200,220,255,.55)'; g.lineWidth = 1;
    pyl.forEach(function (px) {
      g.fillStyle = '#1a1838'; g.fillRect(px - 3, by - h(150), 6, h(150));
      for (var k = 1; k <= 9; k++) { g.beginPath(); g.moveTo(px, by - h(140)); g.lineTo(px - k * W * .009, by); g.moveTo(px, by - h(140)); g.lineTo(px + k * W * .009, by); g.stroke(); }
    });
    g.save(); g.shadowColor = '#22e3ff'; g.shadowBlur = 8; g.fillStyle = '#7fe9ff'; g.fillRect(bx - W * .05, by, W * .5, 2); g.restore();
    layers.push({ c: B.c, speed: .16, bridge: true });
    drops = [];
    for (var i = 0; i < (reduce ? 0 : Math.round(W * H / 14000)); i++) drops.push({ x: rnd() * W, y: rnd() * H, l: 8 + rnd() * 14, v: 8 + rnd() * 8 });
  }

  function board(b, t, oy) {
    var y = b.y + oy;
    cx.save();
    var gr = cx.createLinearGradient(b.x, y, b.x, y + b.h);
    gr.addColorStop(0, b.c1); gr.addColorStop(1, b.c2);
    cx.globalAlpha = .82 + .18 * Math.sin(t * 2 + b.ph);
    cx.shadowColor = b.c1; cx.shadowBlur = 22; cx.fillStyle = gr; cx.fillRect(b.x, y, b.w, b.h);
    cx.shadowBlur = 0;
    // scanlines drifting down the board
    cx.fillStyle = 'rgba(0,0,0,.22)';
    var off = (t * 18 + b.ph * 10) % 4;
    for (var sy = y + off; sy < y + b.h; sy += 4) cx.fillRect(b.x, sy, b.w, 1.4);
    // a simple shape and the word, stacked if the board is tall
    cx.fillStyle = 'rgba(255,255,255,.9)';
    var fs = Math.max(8, Math.min(b.w / (b.word.length * .62), b.h * .22));
    cx.font = '800 ' + fs + 'px "Barlow Condensed", Impact, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    if (b.h > b.w * 1.1) {
      cx.globalAlpha *= .7; cx.beginPath(); cx.arc(b.x + b.w / 2, y + b.h * .38, Math.min(b.w, b.h) * .22, 0, 6.3); cx.fill(); cx.globalAlpha = 1;
      cx.fillText(b.word, b.x + b.w / 2, y + b.h * .8);
    } else cx.fillText(b.word, b.x + b.w / 2, y + b.h / 2);
    cx.restore();
  }

  function frame(t) {
    t = (t || 0) / 1000;
    var s = scrollY;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // sky
    var sk = cx.createLinearGradient(0, 0, 0, horizon);
    sk.addColorStop(0, '#03030b'); sk.addColorStop(.6, '#0d0a26'); sk.addColorStop(1, '#2a0f4a');
    cx.fillStyle = sk; cx.fillRect(0, 0, W, H);
    var glow = cx.createRadialGradient(W * .45, horizon, 10, W * .45, horizon, W * .6);
    glow.addColorStop(0, 'rgba(120,60,255,.35)'); glow.addColorStop(1, 'rgba(120,60,255,0)');
    cx.fillStyle = glow; cx.fillRect(0, 0, W, H);
    // city layers, parallax
    var oys = [];
    layers.forEach(function (L, i) { var oy = -s * L.speed; oys[i] = oy; cx.drawImage(L.c, 0, 0, L.c.width, L.c.height, 0, oy, W, L.c.height / dpr); });
    boards.forEach(function (b) { board(b, t, oys[b.layer]); });
    // water: reflect the band just above the horizon, squashed and rippled
    var wy = horizon + h(8) - s * .16;
    cx.fillStyle = '#05040e'; cx.fillRect(0, wy, W, H - wy + 10);
    cx.save(); cx.globalAlpha = .45; cx.translate(0, wy * 2); cx.scale(1, -1);
    var src = cv, sh = Math.min(h(260), wy);
    for (var y = 0; y < sh; y += 3) {
      var dx = Math.sin(y * .18 + t * 2.2) * 3;
      cx.drawImage(src, 0, (wy - y - 3) * dpr, W * dpr, 3 * dpr, dx, wy - y - 3, W, 3);
    }
    cx.restore();
    var wf = cx.createLinearGradient(0, wy, 0, H); wf.addColorStop(0, 'rgba(5,4,14,.1)'); wf.addColorStop(1, 'rgba(5,4,14,.9)');
    cx.fillStyle = wf; cx.fillRect(0, wy, W, H - wy + 10);
    // haze over the base of the skyline
    var hz = cx.createLinearGradient(0, horizon - h(160), 0, horizon + h(20));
    hz.addColorStop(0, 'rgba(90,40,160,0)'); hz.addColorStop(1, 'rgba(90,40,160,.28)');
    cx.fillStyle = hz; cx.fillRect(0, 0, W, horizon + h(20));
    // rain
    if (drops.length) {
      cx.strokeStyle = 'rgba(170,200,255,.16)'; cx.lineWidth = 1; cx.beginPath();
      drops.forEach(function (d) { cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.l * .12, d.y + d.l); d.y += d.v; d.x -= d.v * .12; if (d.y > H) { d.y = -20; d.x = Math.random() * (W + 40); } });
      cx.stroke();
    }
    var dim = Math.min(.7, s / (H * 1.1) * .7);
    if (dim > 0) { cx.fillStyle = 'rgba(3,3,10,' + dim + ')'; cx.fillRect(0, 0, W, H); }
  }

  function loop(t) { frame(t); if (!reduce) requestAnimationFrame(loop); }
  function start() { build(); requestAnimationFrame(loop); }
  // wait for the sign font so billboard words use it
  (document.fonts && document.fonts.load ? document.fonts.load('800 20px "Barlow Condensed"').catch(function () {}) : Promise.resolve()).then(start);
  if (reduce) addEventListener('scroll', function () { requestAnimationFrame(frame); }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); frame(); }, 150); });
})();
