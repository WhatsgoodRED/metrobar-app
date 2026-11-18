// MetroBar app shell (Bennie 2026-11-18: "make it into a full screen app, so it won't break the pages on an iPad or a phone").
// Shared by landing-beat-meter.html, index.html and studio.html. Loaded in <head>, no dependencies.
//  - html.standalone when opened from the home screen (display-mode standalone/fullscreen or iOS navigator.standalone)
//  - --vvh = the visible height (visualViewport), html.kb-open while the on-screen keyboard takes the bottom of the screen
//  - rotation / resize: re-lay out (a resize event after the rotation settles, scroll put back inside the page)
//  - once on iPad/iPhone Safari, not installed: a small "Add to Home Screen" card (metrobar.a2hs = dismissed)
(function () {
  var d = document, de = d.documentElement, w = window;
  if (w.self !== w.top) return;   // pages inside an iframe (Pocket Aim) follow their parent
  var mq = function (q) { try { return w.matchMedia(q).matches; } catch (e) { return false; } };
  var standalone = function () { return mq('(display-mode: standalone)') || mq('(display-mode: fullscreen)') || w.navigator.standalone === true; };
  var touch = (w.navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in w;
  de.classList.toggle('standalone', standalone());
  if (touch) de.classList.add('touch');

  var vv = w.visualViewport;
  function fit() {
    var h = vv ? vv.height : w.innerHeight;
    de.style.setProperty('--vvh', Math.round(h) + 'px');
    // keyboard: the visible area is much shorter than the layout viewport while a text field has focus
    var a = d.activeElement, typing = a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
    de.classList.toggle('kb-open', !!(touch && typing && vv && w.innerHeight - vv.height > 120));
  }
  if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
  w.addEventListener('resize', fit);
  d.addEventListener('focusin', function () { setTimeout(fit, 350); });
  d.addEventListener('focusout', function () { setTimeout(fit, 350); });
  // iOS keeps the old layout for a moment after a rotation: lay out again once it settles, and pull the page back in
  // (a rotation with the keyboard up can leave the window scrolled sideways)
  function turned() { setTimeout(function () { fit(); if (w.scrollX) w.scrollTo(0, w.scrollY); try { w.dispatchEvent(new Event('resize')); } catch (e) {} }, 320); }
  if (w.screen && w.screen.orientation && w.screen.orientation.addEventListener) w.screen.orientation.addEventListener('change', turned);
  else w.addEventListener('orientationchange', turned);
  fit();

  // Add to Home Screen hint: iPhone / iPad Safari only (iPadOS says "Macintosh" but has touch), not installed, once
  var ua = w.navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (w.navigator.maxTouchPoints || 0) > 1);
  var key = 'metrobar.a2hs', seen = '1';
  try { seen = w.localStorage.getItem(key); } catch (e) {}
  if (!ios || standalone() || seen) return;
  function hint() {
    var gate = d.getElementById('mxGate');
    if (gate && !gate.hidden && gate.offsetParent !== null) return;   // the coming-soon curtain is up
    if (d.querySelector('dialog[open]') || d.getElementById('a2hs')) return;
    var ipad = !/iPhone|iPod/.test(ua);
    var s = d.createElement('style');
    s.textContent = '#a2hs{position:fixed;z-index:95;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(360px,calc(100vw - 32px));' +
      'display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 12px 12px 14px;border-radius:14px;' +
      'background:#15171a;color:#f2f3f1;font:400 .88rem/1.35 "IBM Plex Sans",system-ui,sans-serif;box-shadow:0 18px 44px -14px #000a;animation:a2hs-in .25s ease-out}' +
      '#a2hs img{width:40px;height:40px;border-radius:9px}#a2hs b{display:block;font-weight:600;margin-bottom:2px}' +
      '#a2hs svg{width:15px;height:15px;vertical-align:-2px;margin:0 2px}' +
      '#a2hs button{width:32px;height:32px;border:0;border-radius:50%;background:#ffffff1a;color:inherit;font:inherit;font-size:1rem;cursor:pointer}' +
      (ipad ? '#a2hs{top:calc(14px + env(safe-area-inset-top,0px));bottom:auto;left:auto;right:calc(14px + env(safe-area-inset-right,0px));transform:none}' : '') +
      '@keyframes a2hs-in{from{opacity:0;translate:0 10px}}@media (prefers-reduced-motion:reduce){#a2hs{animation:none}}';
    d.head.appendChild(s);
    var share = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
    var el = d.createElement('div');
    el.id = 'a2hs'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Install MetroBar');
    el.innerHTML = '<img src="icon-192.png" alt=""><div><b>Use MetroBar full screen</b>Tap ' + share + ' Share' + (ipad ? ' (top right)' : '') +
      ', then <b style="display:inline">Add to Home Screen</b>.</div><button type="button" aria-label="Close">×</button>';
    el.querySelector('button').addEventListener('click', function () { el.remove(); try { w.localStorage.setItem(key, '1'); } catch (e) {} });
    d.body.appendChild(el);
    try { w.localStorage.setItem(key, '1'); } catch (e) {}   // shown once
  }
  w.addEventListener('load', function () { setTimeout(hint, 4000); });
})();
