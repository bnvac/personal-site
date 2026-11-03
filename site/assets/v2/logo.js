/* The name as chunky extruded pixel blocks: each letter is a 6x7 grid,
   drawn as cubes with a deep side, a bevelled face and a hard outline,
   then given a slight lean and a slow bob per letter. */
(function () {
  var cv = document.getElementById('logo');
  if (!cv) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = {
    B: ['111110', '110011', '110011', '111110', '110011', '110011', '111110'],
    N: ['110011', '111011', '111111', '110111', '110011', '110011', '110011'],
    V: ['110011', '110011', '110011', '110011', '011110', '011110', '001100'],
    A: ['011110', '110011', '110011', '111111', '110011', '110011', '110011'],
    C: ['011111', '110000', '110000', '110000', '110000', '110000', '011111']
  };
  var word = (cv.dataset.word || 'BNVAC').toUpperCase().split('');
  var cx = cv.getContext('2d'), dpr, s, depth, W, H;
  var COLS = 6, ROWS = 7, GAP = .55; // gap between letters, in cells

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var cssW = Math.min(innerWidth * .9, 1100);
    var cells = word.length * COLS + (word.length - 1) * GAP + 5; // +3 for extrusion room
    s = Math.floor(cssW / cells);
    depth = Math.max(3, Math.round(s * .42));
    W = Math.ceil(cells * s + depth * 2); H = Math.ceil(ROWS * s + depth * 2 + s * 1.4);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }

  function cells() {
    // every filled cell as {x,y,r,c,i} plus a lookup, after lean and bob
    var out = [], t = cells.t || 0;
    word.forEach(function (ch, i) {
      var g = G[ch]; if (!g) return;
      var ox = depth + (i * (COLS + GAP)) * s + s * 1.4;
      var bob = reduce ? 0 : Math.sin(t * 1.6 + i * .7) * s * .16;
      var oy = depth * .3 + s * .5 + bob;
      var mine = [];
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) if (g[r][c] === '1') mine.push([r, c]);
      // the flicks: a cell kicked out left at the foot, right at the top
      var bl = mine.filter(function (q) { return q[0] === ROWS - 1; }).sort(function (a, b) { return a[1] - b[1]; })[0];
      var tr = mine.filter(function (q) { return q[0] === 0; }).sort(function (a, b) { return b[1] - a[1]; })[0];
      if (bl) mine.push([bl[0], bl[1] - 1]);
      if (tr) mine.push([tr[0], tr[1] + 1]);
      mine.forEach(function (q) {
        var r = q[0], c = q[1];
        out.push({ i: i, r: r, c: c, x: Math.round(ox + c * s + (ROWS - 1 - r) * s * .16), y: Math.round(oy + r * s) });
      });
    });
    return out;
  }
  function has(set, i, r, c) { return set[i + ':' + r + ':' + c]; }

  function draw(t) {
    cells.t = (t || 0) / 1000;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    var list = cells(), set = {};
    list.forEach(function (p) { set[p.i + ':' + p.r + ':' + p.c] = 1; });
    var o = Math.max(2, Math.round(s * .16)); // outline width
    var top = Math.min.apply(null, list.map(function (p) { return p.y; })), bot = top + ROWS * s;
    var gr = cx.createLinearGradient(0, top, 0, bot);
    gr.addColorStop(0, '#9ff8ff'); gr.addColorStop(.18, '#35e0ff'); gr.addColorStop(.55, '#a46bff'); gr.addColorStop(1, '#ff2bd6');
    var bv = Math.max(2, Math.round(s * .16));
    // each letter whole, left to right, so every letter's outline sits over
    // the one before it: squashed together, but still separated
    word.forEach(function (_, li) {
      var L = list.filter(function (p) { return p.i === li; });
      cx.fillStyle = '#07020f';
      L.forEach(function (p) { cx.fillRect(p.x - o, p.y - o, s + depth + o * 2, s + depth + o * 2); });
      for (var k = depth; k > 0; k--) {
        cx.fillStyle = k > depth * .55 ? '#2a0a4a' : '#4b1475';
        L.forEach(function (p) { cx.fillRect(p.x + k, p.y + k, s, s); });
      }
      cx.fillStyle = gr;
      L.forEach(function (p) { cx.fillRect(p.x, p.y, s + 1, s + 1); });
      L.forEach(function (p) {
        if (!has(set, p.i, p.r - 1, p.c)) { cx.fillStyle = 'rgba(255,255,255,.75)'; cx.fillRect(p.x, p.y, s, bv); }
        if (!has(set, p.i, p.r, p.c - 1)) { cx.fillStyle = 'rgba(255,255,255,.45)'; cx.fillRect(p.x, p.y, bv, s); }
        if (!has(set, p.i, p.r + 1, p.c)) { cx.fillStyle = 'rgba(40,0,60,.35)'; cx.fillRect(p.x, p.y + s - bv, s, bv); }
        if (!has(set, p.i, p.r, p.c + 1)) { cx.fillStyle = 'rgba(40,0,60,.25)'; cx.fillRect(p.x + s - bv, p.y, bv, s); }
      });
    });
    // 5. a moving sheen across the face
    if (!reduce) {
      var sx = ((cells.t * .35) % 1.6 - .3) * W;
      cx.save(); cx.globalCompositeOperation = 'source-atop';
      var sh = cx.createLinearGradient(sx - s * 3, 0, sx + s * 3, 0);
      sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.5, 'rgba(255,255,255,.35)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
      cx.fillStyle = sh; cx.fillRect(0, 0, W, H); cx.restore();
    }
  }

  function loop(t) { draw(t); if (!reduce) requestAnimationFrame(loop); }
  size(); requestAnimationFrame(loop);
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw(); }, 150); });
})();
