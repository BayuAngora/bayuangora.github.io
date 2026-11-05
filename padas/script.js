(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SCRIPTS = PADAS.SCRIPTS;
  // Banner slots that still point at "#" should not jump the page.
  ['slotTop', 'slotBottom'].forEach(function (id) {
    $(id).addEventListener('click', function (e) { if ($(id).getAttribute('href') === '#') e.preventDefault(); });
  });
  var SCRIPT_ORDER = [
    ['jawa', 'Jawa'],
    ['sunda', 'Sunda'],
    ['bali', 'Bali'],
    ['batak', 'Batak'],
    ['lontara', 'Lontara'],
    ['rejang', 'Rejang'],
    ['kawi', 'Kawi'],
    ['pallawa', 'Pallawa']
  ];
  var NOTES = {
    batak: 'Batak follows the Toba letters; k and h share one letter.',
    lontara: 'Lontara does not write final consonants, so they are left out.',
    rejang: 'Rejang: é is the e sign, e is the eu sign.',
    kawi: 'Kawi uses the Unicode Kawi block. dh, th, kh, gh and the dotted letters are supported.',
    pallawa: 'Pallawa is set with Grantha letters, its closest Unicode script.'
  };
  var COLORS = [
    { label: 'R', name: 'Red', hex: '#e00' },
    { label: 'G', name: 'Green', hex: '#0e0' },
    { label: 'B', name: 'Blue', hex: '#00e' },
    { label: 'Y', name: 'Yellow', hex: '#ee0' },
    { label: 'Wh', name: 'White', hex: '#fff' },
    { label: 'Bk', name: 'Black', hex: '#000' }
  ];
  var state = { script: 'sunda', style: '', size: 36, stroke: 0, color: '#e60', bg: 'Transparent', input: SCRIPTS.sunda.sample, converted: '' };
  /* ---------- helpers ---------- */
  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function lum(h) { var c = hexToRgb(h); return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); }
  function shade(h, f) {
    var c = hexToRgb(h).map(function (v) { return Math.round(v * f); });
    return '#' + c.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
  }
  function onColor(h) { return lum(h) > 0.4 ? '#111' : '#eef'; }
  function normHex(v) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(v).trim());
    if (!m) return null;
    var s = m[1].toLowerCase();
    if (s.length === 3) s = s.split('').map(function (c) { return c + c; }).join('');
    return '#' + s;
  }
  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* ---------- layout + painting (shared by preview, png, jpg, pdf, svg) ---------- */
  var mctx = document.createElement('canvas').getContext('2d');
  function fontStr(cfg) { return cfg.size + 'px "' + cfg.family + '", "Noto Sans", sans-serif'; }
  function wrapLines(ctx, text, maxW) {
    var out = [];
    text.split('\n').forEach(function (par) {
      if (!par.trim()) { out.push(''); return; }
      var line = '';
      par.split(/ +/).forEach(function (w) {
        var t = line ? line + ' ' + w : w;
        if (line && ctx.measureText(t).width > maxW) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out.length ? out : [''];
  }
  function rgbHex(c) {
    return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join('');
  }
  function tint(h, f) { return rgbHex(hexToRgb(h).map(function (v) { return v + (255 - v) * f; })); }
  function hueShift(h, deg) {
    var c = hexToRgb(h).map(function (v) { return v / 255; });
    var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]), l = (mx + mn) / 2, d = mx - mn, hh = 0, s = 0;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === c[0]) hh = (c[1] - c[2]) / d + (c[1] < c[2] ? 6 : 0);
      else if (mx === c[1]) hh = (c[2] - c[0]) / d + 2;
      else hh = (c[0] - c[1]) / d + 4;
      hh *= 60;
    }
    hh = (hh + deg + 360) % 360;
    function f(n) {
      var k = (n + hh / 30) % 12;
      var a = s * Math.min(l, 1 - l);
      return (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
    }
    return rgbHex([f(0), f(8), f(4)]);
  }
  // Outline color: contrasts with the text color (or with the background when the text is transparent).
  function outlineColor(cfg) {
    if (cfg.color) return lum(cfg.color) < 0.18 ? '#fff' : '#000';
    return cfg.bg ? (lum(cfg.bg) < 0.4 ? '#fff' : '#000') : '#fff';
  }
  function geometry(cfg) {
    var size = cfg.size, st = cfg.style;
    mctx.font = fontStr(cfg);
    var lines = wrapLines(mctx, cfg.text || ' ', 1400);
    var lh = Math.round(size * 1.7);
    var textW = size;
    lines.forEach(function (l) { textW = Math.max(textW, mctx.measureText(l).width); });
    var S = cfg.stroke || 0;
    if (!cfg.color) S = Math.max(S, 2);
    var bold = (st === 'bolder' && cfg.color) ? size * 0.045 : 0;
    var depth = 0, extraX = 0, extraY = 0;
    if (st === 'shadow') depth = Math.max(2, Math.round(size * 0.09));
    if (st === '3d') { extraX = (textW + size * 1.5) * 0.1; extraY = (lines.length * lh + size * 1.2) * 0.1; }
    var padX = Math.max(28, size * 0.9) + depth + extraX + S + bold / 2;
    var padY = Math.max(22, size * 0.7) + depth + extraY + S + bold / 2;
    return {
      lines: lines, lh: lh, textW: textW, halfH: lines.length * lh / 2, S: S, bold: bold, depth: depth,
      W: Math.ceil(textW + padX * 2), H: Math.ceil(lines.length * lh + padY * 2), size: size, st: st
    };
  }
  // One list of drawing steps shared by the canvas (png, jpg, pdf, preview) and the svg export.
  function plan(cfg, geo) {
    var st = geo.st, size = geo.size, color = cfg.color;
    var oc = outlineColor(cfg);
    var base = color || oc;
    var eff = lum(base) < 0.08 ? '#888' : base;
    var face = null;
    if (color) {
      if (st === 'gradient') face = { grad: [[0, tint(color, 0.75)], [0.5, color], [1, hueShift(shade(color, 0.55), 55)]], y0: -geo.halfH, y1: geo.halfH };
      else face = { solid: color };
    }
    var layers = [], ops = [], i;
    if (st === 'shadow') {
      var sc = shade(eff, 0.45);
      for (i = geo.depth; i >= 1; i--) layers.push({ a: 1, d: 1, e: i * 0.55, f: i, color: sc });
    } else if (st === '3d') {
      var N = Math.max(10, Math.min(30, Math.round(size * 0.3)));
      var vx = geo.textW * 0.5 + size * 1.5, vy = geo.halfH + size * 1.2;
      for (i = N; i >= 1; i--) {
        var t = i / N, s = 1 - 0.1 * t;
        layers.push({ a: s, d: s, e: vx * (1 - s), f: vy * (1 - s), color: shade(eff, 0.85 - 0.5 * t) });
      }
    }
    if (geo.S > 0) layers.forEach(function (l) { ops.push({ a: l.a, d: l.d, e: l.e, f: l.f, fill: null, stroke: oc, lw: 2 * geo.S }); });
    layers.forEach(function (l) { ops.push({ a: l.a, d: l.d, e: l.e, f: l.f, fill: { solid: l.color }, stroke: null, lw: 0 }); });
    if (geo.S > 0) ops.push({ a: 1, d: 1, e: 0, f: 0, fill: null, stroke: oc, lw: 2 * geo.S + geo.bold });
    if (face) ops.push({ a: 1, d: 1, e: 0, f: 0, fill: face, stroke: geo.bold > 0 ? color : null, lw: geo.bold });
    return ops;
  }
  function paint(canvas, cfg, scale, opts) {
    var geo = geometry(cfg);
    var sc = Math.max(0.25, Math.min(scale, 8192 / geo.W, 8192 / geo.H));
    canvas.width = Math.ceil(geo.W * sc);
    canvas.height = Math.ceil(geo.H * sc);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(sc, 0, 0, sc, 0, 0);
    ctx.clearRect(0, 0, geo.W, geo.H);
    var bg = cfg.bg;
    if (opts && opts.opaque && !bg) bg = lum(cfg.color || outlineColor(cfg)) < 0.4 ? '#ffffff' : '#000000';
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, geo.W, geo.H); }
    ctx.save();
    ctx.translate(geo.W / 2, geo.H / 2);
    ctx.font = fontStr(cfg);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    var base = -geo.halfH + geo.lh * 0.7;
    plan(cfg, geo).forEach(function (op) {
      ctx.save();
      ctx.transform(op.a, 0, 0, op.d, op.e, op.f);
      if (op.fill) {
        if (op.fill.grad) {
          var g = ctx.createLinearGradient(0, op.fill.y0, 0, op.fill.y1);
          op.fill.grad.forEach(function (s) { g.addColorStop(s[0], s[1]); });
          ctx.fillStyle = g;
        } else ctx.fillStyle = op.fill.solid;
      }
      if (op.stroke) { ctx.strokeStyle = op.stroke; ctx.lineWidth = op.lw; }
      geo.lines.forEach(function (l, i) {
        var y = base + i * geo.lh;
        if (op.fill) ctx.fillText(l, 0, y);
        if (op.stroke) ctx.strokeText(l, 0, y);
      });
      ctx.restore();
    });
    ctx.restore();
    return geo;
  }
  function buildSvg(cfg, fontCss) {
    var geo = geometry(cfg);
    var W = geo.W, H = geo.H;
    var base = -geo.halfH + geo.lh * 0.7;
    var texts = geo.lines.map(function (l, i) {
      return '<text x="0" y="' + (base + i * geo.lh).toFixed(2) + '" xml:space="preserve">' + esc(l) + '</text>';
    }).join('');
    var ops = plan(cfg, geo);
    var defs = '';
    ops.some(function (op) {
      if (op.fill && op.fill.grad) {
        defs = '<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="' + op.fill.y0 + '" x2="0" y2="' + op.fill.y1 + '">' +
          op.fill.grad.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>';
        return true;
      }
      return false;
    });
    var body = ops.map(function (op) {
      var fill = 'none', stroke = 'none', sw = '';
      if (op.fill) fill = op.fill.grad ? 'url(#g)' : op.fill.solid;
      if (op.stroke) { stroke = op.stroke; sw = ' stroke-width="' + op.lw.toFixed(2) + '"'; }
      var m = [op.a, 0, 0, op.d, op.e, op.f].map(function (n) { return +n.toFixed(4); }).join(' ');
      return '<use href="#t" transform="matrix(' + m + ')" fill="' + fill + '" stroke="' + stroke + '"' + sw + '/>';
    }).join('');
    var bg = cfg.bg ? '<rect width="' + W + '" height="' + H + '" fill="' + cfg.bg + '"/>' : '';
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<style>' + fontCss + '</style><defs>' + defs +
      '<g id="t" font-family="\'' + cfg.family + '\',\'Noto Sans\',sans-serif" font-size="' + geo.size + '" text-anchor="middle" stroke-linejoin="round" stroke-miterlimit="2">' + texts + '</g></defs>' +
      bg + '<g transform="translate(' + W / 2 + ' ' + H / 2 + ')">' + body + '</g></svg>\n';
  }
  /* ---------- fonts ---------- */
  function ensureFont(cfg) {
    var load = document.fonts && document.fonts.load ? document.fonts.load(fontStr(cfg), cfg.text || ' ') : Promise.resolve();
    var timeout = new Promise(function (res) { setTimeout(res, 4000); });
    return Promise.race([load.catch(function () {}), timeout]);
  }
  function fontCssFor(family) {
    var url = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(family).replace(/%20/g, '+') + '&display=swap';
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('css');
      return r.text();
    }).then(function (css) {
      var urls = [];
      css.replace(/url\((https:[^)]+)\)/g, function (_, u) { urls.push(u); return _; });
      return Promise.all(urls.map(function (u) {
        return fetch(u).then(function (r) { return r.blob(); }).then(function (b) {
          return new Promise(function (res, rej) {
            var fr = new FileReader();
            fr.onload = function () { res([u, fr.result]); };
            fr.onerror = rej;
            fr.readAsDataURL(b);
          });
        });
      })).then(function (pairs) {
        pairs.forEach(function (p) { css = css.split(p[0]).join(p[1]); });
        return { css: css, embedded: true };
      });
    }).catch(function () {
      return { css: '@import url("' + url + '");', embedded: false };
    });
  }
  /* ---------- rendering ---------- */
  var renderId = 0;
  function currentCfg() {
    return { text: state.converted, family: SCRIPTS[state.script].family, style: state.style, size: state.size, stroke: state.stroke, color: state.color, bg: state.bg };
  }
  function render() {
    var id = ++renderId;
    var sc = SCRIPTS[state.script];
    state.converted = PADAS.convert(state.input, state.script);
    $('unicode').value = state.converted;
    $('unicode').style.fontFamily = '"' + sc.family + '", var(--font-body)';
    $('out').setAttribute('aria-label', 'Aksara ' + sc.label + ': ' + state.input);
    var cfg = currentCfg();
    ensureFont(cfg).then(function () {
      if (id !== renderId) return;
      paint($('out'), cfg, Math.max(2, window.devicePixelRatio || 1));
      $('out').style.width = geometry(cfg).W + 'px';
    });
  }
  var raf = 0;
  function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); }
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', schedule);
  /* ---------- controls ---------- */
  function setHint() {
    $('hint').textContent = 'e = pepet, é = taling. ' + (NOTES[state.script] || '');
  }
  function buildScripts() {
    var root = $('scripts');
    SCRIPT_ORDER.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.id = s[0];
      b.textContent = s[1];
      b.setAttribute('aria-pressed', String(s[0] === state.script));
      b.addEventListener('click', function () {
        var prev = state.script;
        if (prev === s[0]) return;
        if (!state.input.trim() || state.input === SCRIPTS[prev].sample) {
          state.input = SCRIPTS[s[0]].sample;
          $('input').value = state.input;
        }
        state.script = s[0];
        Array.prototype.forEach.call(root.children, function (c) { c.setAttribute('aria-pressed', String(c.dataset.id === state.script)); });
        setHint();
        render();
      });
      root.appendChild(b);
    });
  }
  function buildStyles() {
    var root = $('styles');
    [['bolder', 'Bolder'], ['shadow', 'Shadow'], ['gradient', 'Gradient'], ['3d', '3D Effect']].forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.id = s[0];
      b.textContent = s[1];
      b.setAttribute('aria-pressed', String(s[0] === state.style));
      b.addEventListener('click', function () {
        state.style = s[0];
        Array.prototype.forEach.call(root.children, function (c) { c.setAttribute('aria-pressed', String(c.dataset.id === state.style)); });
        render();
      });
      root.appendChild(b);
    });
  }
  function palette(rootId, key, allowClear, hexRowId, hexInId, hexGoId) {
    var root = $(rootId);
    var plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'plus';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Add a custom hex color');
    plus.setAttribute('aria-expanded', 'false');
    function refresh() {
      Array.prototype.forEach.call(root.querySelectorAll('.swatch'), function (b) {
        var h = b.dataset.hex || '';
        b.setAttribute('aria-pressed', String(h === (state[key] || '')));
      });
    }
    function add(hex, label, name, beforePlus) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.dataset.hex = hex;
      b.style.background = hex;
      b.style.color = onColor(hex);
      b.textContent = label;
      b.setAttribute('aria-label', name);
      b.title = name + (hex ? ' ' + hex : '');
      b.addEventListener('click', function () {
        state[key] = hex || null;
        refresh();
        render();
        if (!hex && key === 'color') toast('Transparent text shows only the stroke');
      });
      root.insertBefore(b, beforePlus ? plus : null);
      return b;
    }
    COLORS.forEach(function (c) { add(c.hex, c.label, c.name, false); });
    if (allowClear) {
      var t = add('', 'Tr', 'Transparent', false);
      t.classList.add('checker');
      t.style.background = '';
      t.style.color = '';
    }
    root.appendChild(plus);
    var row = $(hexRowId), input = $(hexInId);
    plus.addEventListener('click', function () {
      row.hidden = !row.hidden;
      plus.setAttribute('aria-expanded', String(!row.hidden));
      if (!row.hidden) input.focus();
    });
    function applyHex() {
      var h = normHex(input.value);
      if (!h) { input.setAttribute('aria-invalid', 'true'); toast('Use a hex code like #FF8800'); return; }
      input.removeAttribute('aria-invalid');
      var ex = root.querySelector('.swatch[data-hex="' + h + '"]');
      if (!ex) {
        var customs = root.querySelectorAll('.swatch[data-custom]');
        if (customs.length >= 4) customs[0].remove();
        ex = add(h, '#', 'Custom ' + h, true);
        ex.dataset.custom = '1';
      }
      state[key] = h;
      refresh();
      render();
      input.value = '';
    }
    $(hexGoId).addEventListener('click', applyHex);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyHex(); } });
    input.addEventListener('input', function () { input.removeAttribute('aria-invalid'); });
    refresh();
  }
  /* ---------- downloads ---------- */
  function fileBase() { return 'padas-' + state.script + '-' + state.style; }
  function deliver(filename, data) {
    var p = (window.claude && window.claude.use) ? window.claude.use('downloads') : Promise.resolve(null);
    return Promise.resolve(p).catch(function () { return null; }).then(function (dl) {
      if (dl) {
        return dl.save({ filename: filename, data: data }).then(function () {
          toast('Saved ' + filename);
        }, function (e) {
          if (e && e.code === 'declined') toast('Download cancelled');
          else toast('Download is not available here');
        });
      }
      var blob = data instanceof Blob ? data : new Blob([data]);
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast('Saved ' + filename);
    });
  }
  function canvasBlob(canvas, type, q) {
    return new Promise(function (res) { canvas.toBlob(res, type, q); });
  }
  function exportCanvas(opaque, scale) {
    var cfg = currentCfg();
    var c = document.createElement('canvas');
    var geo = paint(c, cfg, scale, { opaque: opaque });
    return { canvas: c, geo: geo, cfg: cfg };
  }
  function doExport(kind) {
    var cfg = currentCfg();
    if (!cfg.text.trim()) { toast('Type some text first'); return Promise.resolve(); }
    return ensureFont(cfg).then(function () {
      if (kind === 'png') {
        var r = exportCanvas(false, 4);
        return canvasBlob(r.canvas, 'image/png').then(function (b) { return deliver(fileBase() + '.png', b); });
      }
      if (kind === 'jpg') {
        var r2 = exportCanvas(true, 4);
        return canvasBlob(r2.canvas, 'image/jpeg', 0.95).then(function (b) { return deliver(fileBase() + '.jpg', b); });
      }
      if (kind === 'svg') {
        return fontCssFor(cfg.family).then(function (f) {
          var svg = buildSvg(cfg, f.css);
          return deliver(fileBase() + '.svg', new Blob([svg], { type: 'image/svg+xml' })).then(function () {
            if (!f.embedded) toast('SVG saved. Its font loads from Google Fonts when opened online.');
          });
        });
      }
      if (kind === 'pdf') {
        if (!(window.jspdf && window.jspdf.jsPDF)) { toast('PDF library did not load. Check your connection.'); return; }
        var r3 = exportCanvas(true, 3);
        var w = r3.geo.W, h = r3.geo.H;
        var pdf = new window.jspdf.jsPDF({ orientation: w > h ? 'l' : 'p', unit: 'px', format: [w, h], hotfixes: ['px_scaling'] });
        pdf.addImage(r3.canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
        return deliver(fileBase() + '.pdf', pdf.output('blob'));
      }
    }).catch(function () { toast('Export failed. Try a smaller size or shorter text.'); });
  }
  function buildDownloads() {
    var root = $('dl');
    ['jpg', 'png', 'svg', 'pdf'].forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.textContent = '.' + k;
      b.setAttribute('aria-label', 'Download as ' + k.toUpperCase());
      b.addEventListener('click', function () { doExport(k); });
      root.appendChild(b);
    });
  }
  /* ---------- wire up ---------- */
  $('input').value = state.input;
  $('input').addEventListener('input', function () { state.input = $('input').value; schedule(); });
  $('size').addEventListener('input', function () {
    state.size = +$('size').value;
    $('sizeVal').textContent = state.size + ' px';
    schedule();
  });
  $('stroke').addEventListener('input', function () {
    state.stroke = +$('stroke').value;
    $('strokeVal').textContent = state.stroke + ' px';
    schedule();
  });
  buildScripts();
  buildStyles();
  palette('palFg', 'color', true, 'hexFg', 'hexFgIn', 'hexFgGo');
  palette('palBg', 'bg', true, 'hexBg', 'hexBgIn', 'hexBgGo');
  buildDownloads();
  setHint();
  render();
})();
