/* v2 background: a city you descend through as you scroll.
   The top of the page is sky above the tower tops; the bottom is the wet,
   lit street. Three layers of towers move at different rates (the near
   ones fastest), so going down feels like dropping between buildings.
   Windows are a repeating texture per layer, so a frame is a handful of
   rectangles, not thousands. An optional photo (data-wallpaper) replaces
   the city when set. */
(function () {
  var cv = document.getElementById('city');
  if (!cv) return;
  var cx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, seed, layers, cars, drops, depth;
  var NEON = ['#ff2bd6', '#22e3ff', '#b16cff', '#ffd23f', '#ff4d6d', '#3dffb5'];
  var WORDS = ['INTRAWEB', 'HEARTH', 'STDNT', 'BACKOFFICE', 'SMART SHELF', 'BASELAYER', 'ARTWORK', 'BNVAC', 'OPEN 24/7', 'MILLIS', 'NOODLES', 'HOTEL'];
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function pick(a) { return a[(rnd() * a.length) | 0]; }

  var WALL = null;
  if (cv.dataset.wallpaper) { var wi = new Image(); wi.onload = function () { WALL = wi; }; wi.src = cv.dataset.wallpaper; }

  function windowTile(n) {
    // a tile of lit and dark windows; the near layer has bigger windows
    var tw = 64, th = 96, c = document.createElement('canvas'); c.width = tw * dpr; c.height = th * dpr;
    var g = c.getContext('2d'); g.scale(dpr, dpr);
    var cw = 4 + n * 2, ch = 3 + n * 1.5, gx = 7 + n * 3, gy = 7 + n * 3;
    for (var y = 2; y < th - ch; y += gy) for (var x = 2; x < tw - cw; x += gx) {
      var r = rnd();
      if (r < .18 + n * .05) g.fillStyle = 'rgba(255,196,120,' + (.45 + rnd() * .5) + ')';
      else if (r < .42 + n * .05) g.fillStyle = 'rgba(110,210,255,' + (.25 + rnd() * .5) + ')';
      else g.fillStyle = 'rgba(255,255,255,.03)';
      g.fillRect(x, y, cw, ch);
    }
    return cx.createPattern(c, 'repeat');
  }

  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight; seed = 20261103;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    depth = H * 5;            // the full fall, top of the sky to the street
    layers = [];
    var spec = [
      { n: 0, travel: .45, wMin: 30, wMax: 70, topMin: .55, topMax: 1.3, col: [24, 16, 60], haze: .5 },
      { n: 1, travel: .72, wMin: 50, wMax: 110, topMin: .9, topMax: 2.0, col: [16, 11, 42], haze: .22 },
      { n: 2, travel: 1.0, wMin: 90, wMax: 190, topMin: 1.25, topMax: 2.8, col: [7, 5, 18], haze: 0 }
    ];
    spec.forEach(function (s) {
      var towers = [], x = -40;
      while (x < W + 40) {
        var w = s.wMin + rnd() * (s.wMax - s.wMin), mid = 1 - Math.abs((x + w / 2) / W - .5) * 1.1;
        var top = H * (s.topMin + rnd() * (s.topMax - s.topMin)) * (1.25 - .45 * mid);
        var t = { x: x, w: w, top: top, crown: rnd(), signs: [], strips: [] };
        // billboards and neon strips at random depths down the tower
        for (var y = top + 60; y < depth - H * .3; y += H * (.35 + rnd() * .6)) {
          if (s.n >= 1 && rnd() < .55) t.signs.push({ y: y, h: Math.min(w * (.6 + rnd() * .9), H * .3), word: pick(WORDS), c1: pick(NEON), c2: pick(NEON), ph: rnd() * 6, vertical: rnd() < .35 });
          if (rnd() < .5) t.strips.push({ y: y + rnd() * 80, h: 80 + rnd() * H * .5, c: pick(NEON), side: rnd() < .5 });
        }
        towers.push(t);
        x += w + (s.n === 2 ? 14 + rnd() * 40 : rnd() * 8);
      }
      // skybridges between neighbouring near/mid towers
      var bridges = [];
      if (s.n >= 1) for (var i = 0; i < towers.length - 1; i++) if (rnd() < .45) {
        var a = towers[i], b = towers[i + 1], yy = Math.max(a.top, b.top) + 80 + rnd() * (depth * .6);
        if (yy < depth - H * .4) bridges.push({ x: a.x + a.w - 2, w: b.x - (a.x + a.w) + 4, y: yy, c: pick(NEON) });
      }
      layers.push({ s: s, towers: towers, bridges: bridges, tile: windowTile(s.n) });
    });
    cars = [];
    for (var k = 0; k < (reduce ? 0 : 26); k++) cars.push({ y: depth * (.25 + rnd() * .65), x: rnd() * W, v: (rnd() < .5 ? -1 : 1) * (60 + rnd() * 160), c: rnd() < .5 ? '#ff4d6d' : '#bfefff', layer: 1 + (rnd() < .5 ? 1 : 0) });
    drops = [];
    for (var j = 0; j < (reduce ? 0 : Math.round(W * H / 12000)); j++) drops.push({ x: rnd() * W, y: rnd() * H, l: 8 + rnd() * 14, v: 8 + rnd() * 8 });
  }

  function progress() {
    var max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  }

  function sky(p) {
    // night sky at the top, magenta smog in the middle, warm street glow below
    var g = cx.createLinearGradient(0, 0, 0, H);
    function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }); }
    var topC = p < .5 ? mix([3, 3, 12], [28, 8, 44], p * 2) : mix([28, 8, 44], [40, 10, 30], (p - .5) * 2);
    var botC = p < .5 ? mix([40, 14, 76], [110, 24, 110], p * 2) : mix([110, 24, 110], [150, 60, 40], (p - .5) * 2);
    g.addColorStop(0, 'rgb(' + topC + ')'); g.addColorStop(1, 'rgb(' + botC + ')');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  }

  function sign(sg, x, w, y, t) {
    cx.save();
    var h = sg.h, bw = sg.vertical ? Math.max(18, w * .22) : w * .8, bx = sg.vertical ? x + w - bw - 4 : x + w * .1;
    if (sg.vertical) h = Math.max(h, bw * 4);
    var gr = cx.createLinearGradient(bx, y, bx, y + h); gr.addColorStop(0, sg.c1); gr.addColorStop(1, sg.c2);
    var flick = Math.sin(t * 2 + sg.ph) > -.96 ? 1 : .35;
    cx.globalAlpha = (.8 + .2 * Math.sin(t * 1.3 + sg.ph)) * flick;
    cx.shadowColor = sg.c1; cx.shadowBlur = 24; cx.fillStyle = gr; cx.fillRect(bx, y, bw, h); cx.shadowBlur = 0;
    cx.fillStyle = 'rgba(0,0,0,.22)'; var off = (t * 16 + sg.ph * 10) % 4;
    for (var sy = y + off; sy < y + h; sy += 4) cx.fillRect(bx, sy, bw, 1.3);
    cx.fillStyle = 'rgba(255,255,255,.92)'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    if (sg.vertical) {
      var letters = sg.word.replace(/\s/g, '').split(''), fs = Math.min(bw * .8, h / letters.length * .85);
      cx.font = '800 ' + fs + 'px "Barlow Condensed", Impact, sans-serif';
      letters.forEach(function (l, i) { cx.fillText(l, bx + bw / 2, y + (i + .5) * (h / letters.length)); });
    } else {
      var f2 = Math.max(9, Math.min(bw / (sg.word.length * .6), h * .3));
      cx.font = '800 ' + f2 + 'px "Barlow Condensed", Impact, sans-serif';
      cx.fillText(sg.word, bx + bw / 2, y + h / 2);
    }
    cx.restore();
  }

  function frame(ms) {
    var t = (ms || 0) / 1000, p = progress();
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (WALL) { wallpaper(p); rain(); return; }
    sky(p);
    // moon and smog glow, which drift up out of view as you descend
    var my = H * .22 - p * H * 1.5;
    if (my > -160) {
      var mr = Math.min(W, H) * .06, halo = cx.createRadialGradient(W * .78, my, mr * .6, W * .78, my, mr * 5);
      halo.addColorStop(0, 'rgba(255,170,230,.35)'); halo.addColorStop(1, 'rgba(255,170,230,0)');
      cx.fillStyle = halo; cx.fillRect(W * .78 - mr * 5, my - mr * 5, mr * 10, mr * 10);
      var disc = cx.createRadialGradient(W * .78 - mr * .3, my - mr * .3, mr * .1, W * .78, my, mr);
      disc.addColorStop(0, '#fff4fb'); disc.addColorStop(.7, '#ffc6ea'); disc.addColorStop(1, '#e58ad0');
      cx.fillStyle = disc; cx.beginPath(); cx.arc(W * .78, my, mr, 0, 6.3); cx.fill();
    }
    layers.forEach(function (L) {
      var s = L.s, cam = p * (depth - H) * s.travel;           // how far this layer has scrolled
      L.towers.forEach(function (tw) {
        var top = tw.top - cam, bottom = depth - cam;
        if (top > H || bottom < 0) return;
        var y0 = Math.max(top, -10), y1 = Math.min(bottom, H + 10);
        var gr = cx.createLinearGradient(tw.x, 0, tw.x + tw.w, 0);
        var c = s.col, lc = c.map(function (v) { return v + 14; });
        gr.addColorStop(0, 'rgb(' + lc + ')'); gr.addColorStop(.6, 'rgb(' + c + ')'); gr.addColorStop(1, 'rgb(' + c.map(function (v) { return v * .6 | 0; }) + ')');
        cx.fillStyle = gr; cx.fillRect(tw.x, y0, tw.w, y1 - y0);
        // windows: the pattern is anchored to the tower so it scrolls with it
        cx.save(); cx.beginPath(); cx.rect(tw.x + 3, Math.max(top + 10, -10), tw.w - 6, y1 - Math.max(top + 10, -10)); cx.clip();
        cx.translate(tw.x, -cam % 96); cx.fillStyle = L.tile; cx.fillRect(0, -96, tw.w, H + 200); cx.restore();
        // crown
        if (top > -120 && top < H) {
          cx.fillStyle = 'rgb(' + c + ')';
          if (tw.crown < .3) { cx.fillRect(tw.x + tw.w * .2, top - 22, tw.w * .6, 22); cx.fillRect(tw.x + tw.w * .42, top - 60, tw.w * .16, 40); }
          else if (tw.crown < .55) { cx.fillRect(tw.x + tw.w * .48, top - 90, 3, 90); cx.save(); cx.shadowColor = '#ff3355'; cx.shadowBlur = 10; cx.fillStyle = Math.sin(t * 3 + tw.x) > 0 ? '#ff5a6e' : '#5a1020'; cx.fillRect(tw.x + tw.w * .48 - 1, top - 92, 5, 5); cx.restore(); }
          else if (tw.crown < .75) { cx.beginPath(); cx.moveTo(tw.x, top); cx.lineTo(tw.x + tw.w / 2, top - tw.w * .5); cx.lineTo(tw.x + tw.w, top); cx.fill(); }
        }
        tw.strips.forEach(function (st) {
          var y = st.y - cam; if (y > H || y + st.h < 0) return;
          cx.save(); cx.shadowColor = st.c; cx.shadowBlur = 14 + s.n * 6; cx.fillStyle = st.c;
          cx.fillRect(st.side ? tw.x + 2 : tw.x + tw.w - 5, y, 2 + s.n, st.h); cx.restore();
        });
        tw.signs.forEach(function (sg) { var y = sg.y - cam; if (y > H || y + sg.h * 4 < 0) return; sign(sg, tw.x, tw.w, y, t); });
      });
      L.bridges.forEach(function (b) {
        var y = b.y - cam; if (y < -20 || y > H + 20) return;
        cx.fillStyle = 'rgb(' + s.col + ')'; cx.fillRect(b.x, y, b.w, 14 + s.n * 4);
        cx.save(); cx.shadowColor = b.c; cx.shadowBlur = 12; cx.fillStyle = b.c; cx.fillRect(b.x, y + 4, b.w, 2); cx.restore();
      });
      // flying traffic weaves between the layers
      cars.forEach(function (car) {
        if (car.layer !== s.n) return;
        var y = car.y - cam; if (y < -10 || y > H + 10) return;
        car.x += car.v / 60; if (car.x > W + 40) car.x = -40; if (car.x < -40) car.x = W + 40;
        cx.save(); cx.shadowColor = car.c; cx.shadowBlur = 10; cx.fillStyle = car.c;
        cx.fillRect(car.x, y, 10 + s.n * 4, 2.5); cx.globalAlpha = .35; cx.fillRect(car.x - car.v * .12, y + .5, car.v * .12, 1.5); cx.restore();
      });
      if (s.haze) { cx.fillStyle = 'rgba(40,14,80,' + s.haze + ')'; cx.fillRect(0, 0, W, H); }
    });
    // the street: shows up as the near layer reaches its bottom
    var street = depth - p * (depth - H) - H * .18;
    if (street < H) {
      var sg = cx.createLinearGradient(0, street, 0, H);
      sg.addColorStop(0, 'rgba(255,90,140,.55)'); sg.addColorStop(.1, 'rgba(20,8,24,.95)'); sg.addColorStop(1, '#050308');
      cx.fillStyle = sg; cx.fillRect(0, street, W, H - street + 2);
      // light trails along the road and their reflections
      for (var i = 0; i < 4; i++) {
        var ly = street + 14 + i * 10, run = (t * (90 + i * 40)) % (W + 200) - 100;
        cx.save(); cx.shadowColor = i % 2 ? '#ff4d6d' : '#ffe8b0'; cx.shadowBlur = 12; cx.fillStyle = i % 2 ? 'rgba(255,77,109,.8)' : 'rgba(255,232,176,.8)';
        cx.fillRect(i % 2 ? W - run - 160 : run, ly, 160, 2); cx.restore();
      }
      cx.fillStyle = 'rgba(255,43,214,.08)'; for (var k = 0; k < 12; k++) cx.fillRect((k * 137) % W, street + 50 + (k * 31) % 90, 60 + (k * 23) % 80, 2);
    }
    rain();
  }

  function rain() {
    if (!drops.length) return;
    cx.strokeStyle = 'rgba(170,200,255,.16)'; cx.lineWidth = 1; cx.beginPath();
    drops.forEach(function (d) { cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.l * .12, d.y + d.l); d.y += d.v; d.x -= d.v * .12; if (d.y > H) { d.y = -20; d.x = Math.random() * (W + 40); } });
    cx.stroke();
    var base = +cv.dataset.dim || 0;
    if (base) { cx.fillStyle = 'rgba(3,3,10,' + base + ')'; cx.fillRect(0, 0, W, H); }
  }

  function wallpaper(p) {
    var z = 1.14, iw = WALL.naturalWidth, ih = WALL.naturalHeight;
    var k = Math.max(W / iw, H / ih) * z, dw = iw * k, dh = ih * k;
    cx.fillStyle = '#05040b'; cx.fillRect(0, 0, W, H);
    cx.drawImage(WALL, (W - dw) / 2, (H - dh) / 2 - p * (dh - H) / 2, dw, dh);
    var v = cx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .2, W / 2, H * .5, Math.max(W, H) * .75);
    v.addColorStop(0, 'rgba(10,4,24,.15)'); v.addColorStop(1, 'rgba(4,2,12,.75)'); cx.fillStyle = v; cx.fillRect(0, 0, W, H);
  }

  function loop(ms) { frame(ms); if (!reduce) requestAnimationFrame(loop); }
  function start() { build(); requestAnimationFrame(loop); }
  (document.fonts && document.fonts.load ? document.fonts.load('800 20px "Barlow Condensed"').catch(function () {}) : Promise.resolve()).then(start);
  if (reduce) addEventListener('scroll', function () { requestAnimationFrame(frame); }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); frame(); }, 150); });
})();
