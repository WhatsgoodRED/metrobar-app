/* MetroBar note highway (2026-11-21, TEST): Guitar Hero style lanes for the Flow Game and Pocket Aim.
   Learning first: every note carries its syllable, the beat lines are numbered (1 2 3 4) so you see where the word sits,
   and every hit that isn't dead on says how many ms early or late it was. Stars and accuracy are untouched: the show
   score, multiplier and crowd sit on top. Landing words (the last word of the bar, red lane) count double. Missing never
   ends the round, the crowd just cools off. */
(function () {
  'use strict';
  var GR = { perfect: { pts: 100, crowd: 3, col: '#2fbf55', txt: 'PERFECT' }, good: { pts: 70, crowd: 1.5, col: '#3d8bff', txt: 'GOOD' },
    ok: { pts: 30, crowd: -3, col: '#ff8a3d', txt: 'OK' }, miss: { pts: 0, crowd: -9, col: '#7a7f86', txt: 'MISS' } };
  var CROWD = [[20, 'Crowd is leaving'], [40, 'Cold crowd'], [65, 'Heads nodding'], [85, 'Crowd is hyped'], [101, 'Crowd on fire']];
  var BLUE = '#1f66c9', RED = '#d10f0f';
  function crowdName(v) { for (var i = 0; i < CROWD.length; i++) if (v < CROWD[i][0]) return CROWD[i][1]; return CROWD[CROWD.length - 1][1]; }
  function rr(c, x, y, w, h, r) { r = Math.min(r, h / 2, w / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  function Highway(canvas, opt) {
    opt = opt || {};
    var c = canvas.getContext('2d'), dpr = 1, W = 0, H = 0, fx = [], flash = [0, 0], calm = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var S = null;
    function reset() { S = { score: 0, streak: 0, mult: 1, maxMult: 1, crowd: 50, crowdMax: 50, crowdMin: 50, land: 0, landPerfect: 0, n: 0, perfect: 0, offs: [] }; fx = []; }
    reset();
    function size() {
      var b = canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1), w = Math.max(1, Math.round(b.width * d)), h = Math.max(1, Math.round(b.height * d));
      if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
      dpr = d; W = w; H = h;
    }
    // perspective: the far end (top) is narrower, like a guitar neck coming at you
    function px(x, y) { var k = 0.62 + 0.38 * (y / H); return W / 2 + (x - W / 2) * k; }
    function judge(grade, land, offMs) {
      var g = GR[grade] || GR.ok; S.n++;
      if (grade === 'perfect' || grade === 'good') { S.streak++; if (grade === 'perfect') S.perfect++; } else S.streak = 0;
      S.mult = Math.min(4, 1 + Math.floor(S.streak / 8)); S.maxMult = Math.max(S.maxMult, S.mult);
      S.score += g.pts * (land ? 2 : 1) * S.mult;
      S.crowd = Math.round(Math.max(0, Math.min(100, S.crowd + g.crowd + (land ? (grade === 'perfect' ? 2 : grade === 'miss' ? -3 : 0) : 0))));
      S.crowdMax = Math.max(S.crowdMax, S.crowd); S.crowdMin = Math.min(S.crowdMin, S.crowd);
      if (land) { S.land++; if (grade === 'perfect') S.landPerfect++; }
      if (grade !== 'miss' && offMs != null) S.offs.push(offMs);
      var lane = land ? 1 : 0; if (grade !== 'miss') flash[lane] = 1;
      var t = grade === 'perfect' ? (land ? 'LANDED' : 'PERFECT') : grade === 'miss' ? 'MISS' : Math.abs(Math.round(offMs || 0)) + ' ms ' + ((offMs || 0) > 0 ? 'LATE' : 'EARLY');
      fx.push({ lane: lane, t: t, col: g.col, age: 0, big: grade === 'perfect', parts: grade === 'miss' || calm ? [] : burst(grade === 'perfect' ? 14 : 7) });
      if (fx.length > 12) fx.shift();
    }
    function burst(n) { var a = []; for (var i = 0; i < n; i++) { var r = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 1.4; a.push([Math.cos(r) * s, Math.sin(r) * s - 0.8]); } return a; }
    function stray() { S.streak = 0; S.mult = 1; S.crowd = Math.max(0, S.crowd - 6); S.crowdMin = Math.min(S.crowdMin, S.crowd); fx.push({ lane: -1, t: 'NO NOTE', col: GR.miss.col, age: 0, parts: [] }); }
    function hold(clean) { if (clean) { S.score += 50 * S.mult; S.crowd = Math.min(100, S.crowd + 2); fx.push({ lane: 0, t: 'HELD', col: GR.perfect.col, age: 0, parts: [] }); } else { S.streak = 0; S.mult = 1; S.crowd = Math.max(0, S.crowd - 4); } }

    // scene: { now, look, notes: [{t, lane, label, st, end, state, ghost}], beats: [{t, bar, n}], title }
    function draw(sc) {
      size(); if (!W || !H) return;
      var now = sc.now, look = sc.look || 2, hitY = H * (opt.hitFrac || 0.84), gap = Math.round(10 * dpr), side = Math.round((opt.side == null ? 46 : opt.side) * dpr);
      var lw = (W - side * 2 - gap) / 2, lx = [side, side + lw + gap], fire = S.mult >= 4;
      var Y = function (t) { return hitY - (t - now) / look * hitY; };
      c.clearRect(0, 0, W, H);
      // the neck
      var grd = c.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, 'rgba(10,12,14,0.0)'); grd.addColorStop(0.25, 'rgba(10,12,14,0.86)'); grd.addColorStop(1, 'rgba(10,12,14,0.96)');
      c.fillStyle = grd; c.beginPath(); c.moveTo(px(side - 6 * dpr, 0), 0); c.lineTo(px(W - side + 6 * dpr, 0), 0); c.lineTo(px(W - side + 6 * dpr, H), H); c.lineTo(px(side - 6 * dpr, H), H); c.closePath(); c.fill();
      [0, 1].forEach(function (i) {
        var col = i ? RED : BLUE, a = 0.10 + flash[i] * 0.25;
        c.fillStyle = col; c.globalAlpha = a; c.beginPath(); c.moveTo(px(lx[i], 0), 0); c.lineTo(px(lx[i] + lw, 0), 0); c.lineTo(px(lx[i] + lw, H), H); c.lineTo(px(lx[i], H), H); c.closePath(); c.fill(); c.globalAlpha = 1;
      });
      if (fire && !calm) { c.save(); c.shadowColor = '#ffb21f'; c.shadowBlur = 24 * dpr; c.strokeStyle = 'rgba(255,178,31,0.9)'; c.lineWidth = 3 * dpr; c.beginPath(); c.moveTo(px(side - 6 * dpr, H * 0.15), H * 0.15); c.lineTo(px(side - 6 * dpr, H), H); c.moveTo(px(W - side + 6 * dpr, H * 0.15), H * 0.15); c.lineTo(px(W - side + 6 * dpr, H), H); c.stroke(); c.restore(); }
      // beat lines with their count: where the words sit
      c.textBaseline = 'middle'; c.textAlign = 'right';
      (sc.beats || []).forEach(function (b) {
        var y = Y(b.t); if (y < -10 || y > H + 10) return;
        c.strokeStyle = b.bar ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)'; c.lineWidth = (b.bar ? 2.5 : 1.2) * dpr;
        c.beginPath(); c.moveTo(px(side, y), y); c.lineTo(px(W - side, y), y); c.stroke();
        if (b.n != null && y > H * 0.08) { c.fillStyle = b.bar ? '#fff' : 'rgba(255,255,255,0.55)'; c.font = (b.bar ? '800 ' : '600 ') + Math.round(12 * dpr) + 'px system-ui, sans-serif'; c.fillText(String(b.n), px(side, y) - 6 * dpr, y); }
      });
      // hit line and the two frets
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3 * dpr; c.beginPath(); c.moveTo(px(side, hitY), hitY); c.lineTo(px(W - side, hitY), hitY); c.stroke();
      [0, 1].forEach(function (i) {
        var cx = px(lx[i] + lw / 2, hitY), col = i ? RED : BLUE, r = Math.min(lw * 0.22, 22 * dpr) * (1 + flash[i] * 0.25);
        c.lineWidth = 4 * dpr; c.strokeStyle = col; c.fillStyle = 'rgba(0,0,0,0.5)';
        if (i) { rr(c, cx - r, hitY - r, r * 2, r * 2, 6 * dpr); } else { c.beginPath(); c.arc(cx, hitY, r, 0, Math.PI * 2); }
        c.fill(); c.stroke();
        if (flash[i] > 0.02) { c.globalAlpha = flash[i]; c.fillStyle = col; c.fill(); c.globalAlpha = 1; }
        flash[i] *= 0.86;
      });
      // ghost syllables: the words you rap between the hits (not scored), small and faint in the middle
      c.textAlign = 'center';
      (sc.notes || []).forEach(function (n) {
        if (!n.ghost) return; var y = Y(n.t); if (y < 0 || y > hitY + 4) return;
        c.font = '500 ' + Math.round(11 * dpr * (0.75 + 0.25 * y / H)) + 'px system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,0.42)'; c.fillText(n.label || '', px(W / 2, y), y);
      });
      // notes, far ones first
      var ns = (sc.notes || []).filter(function (n) { return !n.ghost && n.state !== 'hit'; }).sort(function (a, b) { return b.t - a.t; });
      ns.forEach(function (n) {
        var y = Y(n.t); if (y < -40 * dpr || y > H + 40 * dpr) return;
        var done = n.state && n.state !== 'miss'; if (done && y > hitY + 2) return;   // hit notes vanish into the fret
        var k = 0.62 + 0.38 * (y / H), col = n.state === 'miss' ? '#555b62' : n.lane ? RED : BLUE;
        if (n.end) { var y2 = Y(n.end); c.strokeStyle = col; c.globalAlpha = 0.55; c.lineWidth = 10 * dpr * k; c.lineCap = 'round'; c.beginPath(); c.moveTo(px(lx[n.lane] + lw / 2, y), y); c.lineTo(px(lx[n.lane] + lw / 2, Math.max(y2, 0)), Math.max(y2, 0)); c.stroke(); c.globalAlpha = 1; }
        var fs = Math.round((n.st || n.lane ? 15 : 13) * dpr * k), lab = n.label || '';
        c.font = '800 ' + fs + 'px system-ui, sans-serif';
        var tw = c.measureText(lab).width, w = Math.min(lw * k - 4 * dpr, Math.max(34 * dpr * k, tw + 20 * dpr * k)), h = (n.st || n.lane ? 32 : 26) * dpr * k, cx = px(lx[n.lane] + lw / 2, y);
        c.fillStyle = col; rr(c, cx - w / 2, y - h / 2, w, h, n.lane ? 7 * dpr : h / 2); c.fill();
        c.lineWidth = 2 * dpr; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.stroke();
        c.fillStyle = '#fff'; c.fillText(lab.length > 14 ? lab.slice(0, 13) + '…' : lab, cx, y + 1);
      });
      // hit feedback: the grade and the ms, so the timing lesson stays in view
      fx.forEach(function (f) {
        f.age += 1; var a = Math.max(0, 1 - f.age / 45); if (!a) return;
        var cx = f.lane < 0 ? W / 2 : px(lx[f.lane] + lw / 2, hitY), y = hitY - 34 * dpr - f.age * 0.9 * dpr;
        c.globalAlpha = a; c.fillStyle = f.col; c.font = '900 ' + Math.round((f.big ? 20 : 15) * dpr) + 'px system-ui, sans-serif'; c.fillText(f.t, cx, y);
        f.parts.forEach(function (p) { c.beginPath(); c.arc(cx + p[0] * f.age * 2.2 * dpr, hitY + p[1] * f.age * 2.2 * dpr + 0.05 * f.age * f.age * dpr, 3 * dpr, 0, Math.PI * 2); c.fill(); });
        c.globalAlpha = 1;
      });
      fx = fx.filter(function (f) { return f.age < 45; });
      // multiplier (left) and crowd meter (right)
      var mx = side / 2;
      c.fillStyle = fire ? '#ffb21f' : '#fff'; c.font = '900 ' + Math.round(18 * dpr) + 'px system-ui, sans-serif'; c.fillText('×' + S.mult, mx, hitY);
      c.font = '600 ' + Math.round(9 * dpr) + 'px system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,0.7)';
      for (var i = 0; i < 8; i++) { c.globalAlpha = (S.mult >= 4 || i < S.streak % 8) ? 1 : 0.2; c.fillRect(mx - 8 * dpr, hitY - 18 * dpr - i * 6 * dpr, 16 * dpr, 4 * dpr); } c.globalAlpha = 1;
      var cxm = W - side / 2, top = H * 0.2, bot = hitY, hh = bot - top, v = S.crowd / 100;
      c.fillStyle = 'rgba(255,255,255,0.12)'; rr(c, cxm - 6 * dpr, top, 12 * dpr, hh, 6 * dpr); c.fill();
      var cc = S.crowd < 40 ? '#d64a3a' : S.crowd < 65 ? '#e0b23a' : '#2fbf55'; c.fillStyle = cc; rr(c, cxm - 6 * dpr, bot - hh * v, 12 * dpr, hh * v, 6 * dpr); c.fill();
      c.save(); c.translate(cxm, top - 8 * dpr); c.fillStyle = '#fff'; c.font = '700 ' + Math.round(9 * dpr) + 'px system-ui, sans-serif'; c.fillText('CROWD', 0, 0); c.restore();
      // show score
      c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = '900 ' + Math.round(16 * dpr) + 'px system-ui, sans-serif'; c.fillText(String(S.score), side, Math.max(14 * dpr, H * 0.06));
      c.textAlign = 'right'; c.font = '700 ' + Math.round(11 * dpr) + 'px system-ui, sans-serif'; c.fillStyle = cc; c.fillText(crowdName(S.crowd).toUpperCase(), W - side, Math.max(14 * dpr, H * 0.06));
      if (fire) { c.textAlign = 'center'; c.fillStyle = '#ffb21f'; c.font = '900 ' + Math.round(13 * dpr) + 'px system-ui, sans-serif'; c.fillText('IN THE POCKET ×4', W / 2, Math.max(14 * dpr, H * 0.06)); }
      c.textAlign = 'center';
    }
    function stats() { var o = S.offs, avg = o.length ? Math.round(o.reduce(function (a, b) { return a + b; }, 0) / o.length) : 0; return { score: S.score, maxMult: S.maxMult, crowd: S.crowd, crowdName: crowdName(S.crowd), crowdMax: S.crowdMax, land: S.land, landPerfect: S.landPerfect, n: S.n, perfect: S.perfect, avg: avg }; }
    function clear() { size(); c.clearRect(0, 0, W, H); }
    return { draw: draw, judge: judge, stray: stray, hold: hold, reset: reset, stats: stats, clear: clear };
  }
  Highway.best = function (key, score) {
    var m = {}; try { m = JSON.parse(localStorage.getItem('metrobar.hwBest') || '{}') || {}; } catch (e) {}
    var was = m[key] || 0; if (score > was) { m[key] = score; try { localStorage.setItem('metrobar.hwBest', JSON.stringify(m)); } catch (e) {} }
    return was;
  };
  Highway.on = function () { try { return localStorage.getItem('metrobar.gameHw') !== 'off'; } catch (e) { return true; } };
  Highway.set = function (v) { try { localStorage.setItem('metrobar.gameHw', v ? 'on' : 'off'); } catch (e) {} };
  window.MBHighway = Highway;
})();
