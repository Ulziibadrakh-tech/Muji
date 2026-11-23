import data from "./data.js";
import { layout, wrap, M, BADGE_TEXT, displayCount, subtreeCount } from "./layout.js";

const $ = (s, r = document) => r.querySelector(s);
const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}, text) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text !== undefined) e.textContent = text;
  return e;
};
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const signed = n => (n > 0 ? "+" + n : n < 0 ? "−" + Math.abs(n) : "0");
const CENTRAL = { 4: "Өндөр", 3: "Дунджаас дээш", 2: "Дунд", 1: "Бага" };

const S = data.stages;
const state = { i: 0, mode: innerWidth < 760 ? "list" : "tree", view: { s: 1, x: 0, y: 0 }, lay: null, open: null };

/* ── text measure (canvas, after fonts load) ─────────────── */
const ctx = document.createElement("canvas").getContext("2d");
const measure = (t, size, weight = 600) => { ctx.font = `${weight} ${size}px "Golos Text Variable", "Golos Text", system-ui, sans-serif`; return ctx.measureText(t).width; };

/* ── static text ─────────────────────────────────────────── */
function renderStatic() {
  const m = data.meta;
  $("#heroMeta").textContent = `${m.task} — ${m.topic}` + (m.authors.length ? ` · ${m.authors.join(", ")}` : "");
  $("#heroTitle").textContent = m.title;
  $("#heroSub").textContent = m.subtitle;
  $("#heroLede").textContent = data.brief.lede;
  $("#briefTask").innerHTML = data.brief.task.map(t => `<li>${esc(t)}</li>`).join("");
  $("#briefFacts").innerHTML = data.brief.facts.map(f => `<dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd>`).join("");
  $("#conclusion").innerHTML = data.conclusion.map(t => `<li>${esc(t)}</li>`).join("");
  $("#footText").textContent = `${m.task} · ${m.topic} · ${m.school} · ${m.status}`;
}

/* ── hero growth chart ───────────────────────────────────── */
function renderGrowth() {
  const svg = $("#growth");
  const base = 262, maxH = 200, w = 96, gap = 28, x0 = 16;
  const max = Math.max(...S.map(s => s.headcount));
  svg.append(el("line", { class: "g-rule", x1: 0, x2: 520, y1: base - maxH * (30 / max), y2: base - maxH * (30 / max) }));
  svg.append(el("line", { class: "g-rule", x1: 0, x2: 520, y1: base - maxH, y2: base - maxH }));
  S.forEach((s, i) => {
    const hgt = Math.max(10, (s.headcount / max) * maxH), x = x0 + i * (w + gap);
    const g = el("g", { class: "g-bar", "data-i": i, tabindex: 0, role: "button", "aria-label": `Үе шат ${s.no}, ${s.years}: ${s.headcount} ажилтан, ${s.structure}` });
    g.append(el("rect", { class: "g-hit", x: x - 8, y: 0, width: w + 16, height: 330 }));
    const r = el("rect", { class: "g-slab" + (reduced ? "" : " g-grow"), x, y: base - hgt, width: w, height: hgt, rx: 2 });
    r.style.animationDelay = `${150 + i * 140}ms`;
    g.append(r);
    const num = el("text", { class: "g-num", x, y: base - hgt - 12 }, reduced ? s.headcount : "0");
    g.append(num);
    g.append(el("text", { class: "g-yr", x, y: base + 26 }, s.years));
    g.append(el("text", { class: "g-nm", x, y: base + 44 }, s.short));
    g.addEventListener("click", () => goStage(i, true));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goStage(i, true); } });
    svg.append(g);
    if (!reduced) countUp(num, 0, s.headcount, 900, 150 + i * 140);
  });
  svg.append(el("line", { class: "g-base", x1: 0, x2: 520, y1: base + 0.5, y2: base + 0.5 }));
}

function countUp(node, from, to, dur = 600, delay = 0) {
  if (reduced || from === to) { node.textContent = to; return; }
  const t0 = performance.now() + delay;
  const step = t => {
    const p = Math.min(1, Math.max(0, (t - t0) / dur));
    const e = 1 - Math.pow(1 - p, 3);
    node.textContent = Math.round(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── stepper, header, why, roles ─────────────────────────── */
function renderSteps() {
  const box = $("#steps");
  box.innerHTML = "";
  S.forEach((s, i) => {
    const b = h("button", "sn-step");
    b.type = "button"; b.setAttribute("role", "tab"); b.id = `tab-${i}`;
    b.innerHTML = `<span class="sn-step__no">${s.no}</span><span class="sn-step__years">${s.years}</span><span class="sn-step__name">${esc(s.short)} · ${s.headcount}</span>`;
    b.addEventListener("click", () => goStage(i));
    box.append(b);
  });
  box.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const n = (state.i + (e.key === "ArrowRight" ? 1 : -1) + S.length) % S.length;
      goStage(n); $(`#tab-${n}`).focus();
    }
  });
}

function updateSteps() {
  S.forEach((s, i) => {
    const b = $(`#tab-${i}`);
    b.setAttribute("aria-selected", i === state.i ? "true" : "false");
    b.tabIndex = i === state.i ? 0 : -1;
    b.classList.toggle("sn-step--past", i < state.i);
  });
}

function renderHead() {
  const s = S[state.i], p = S[state.i - 1];
  const delta = p ? `<span class="sn-stat__delta"><b>${signed(s.headcount - p.headcount)}</b> өмнөх үеэс</span>` : `<span class="sn-stat__delta">Анхны баг</span>`;
  $("#eraHead").innerHTML = `
    <header class="sn-era">
      <div class="sn-era__index" aria-hidden="true">${s.no}</div>
      <div>
        <p class="sn-era__kicker">Үе шат ${s.no} · ${s.years}</p>
        <h2 class="sn-era__title" id="eraTitle">${esc(s.structure)}</h2>
      </div>
      <div class="sn-stat sn-stat--s">
        <span class="sn-stat__label">Ажилчид</span>
        <span class="sn-stat__value sn-stat__value--key" id="eraCount">${s.headcount}</span>
        ${delta}
      </div>
    </header>`;
  if (p) countUp($("#eraCount"), p.headcount, s.headcount, 600);
}

function meter(v) { return `<span class="meter" aria-label="${CENTRAL[v]}">${[1, 2, 3, 4].map(k => `<i class="${k <= v ? "on" : ""}" style="height:${8 + k * 6}px"></i>`).join("")}</span>`; }

function renderWhy() {
  const s = S[state.i];
  $("#why").innerHTML = `
    <div>
      <h3>Стратегийн зорилго</h3>
      <p class="goal">${esc(s.goal)}</p>
    </div>
    <div>
      <h3>Яагаад энэ бүтэц</h3>
      <ol>${s.why.map(t => `<li>${esc(t)}</li>`).join("")}</ol>
    </div>
    <dl class="metrics">
      <div><dt>Удирдлагын түвшин</dt><dd>${s.metrics.levels}</dd></div>
      <div><dt>Захиралд шууд</dt><dd>${s.metrics.span}</dd></div>
      <div><dt>Төвлөрөл: ${CENTRAL[s.metrics.central].toLowerCase()}</dt><dd>${meter(s.metrics.central)}</dd></div>
    </dl>`;
}

function roleRows(s) {
  const first = state.i === 0;
  const rows = [];
  for (const u of s.units) for (const r of u.roles) {
    if (first || r.b || (r.d ?? 0) !== 0) rows.push({ u, r });
  }
  return rows;
}

function renderRoles() {
  const s = S[state.i], first = state.i === 0;
  const rows = roleRows(s);
  const head = first
    ? ["Албан тушаал", "Гүйцэтгэх үүрэг", "Мэдлэг, ур чадвар, зан төлөв", "Орон тоо"]
    : ["Өөрчлөгдсөн, нэмэгдсэн албан тушаал", "Гүйцэтгэх үүрэг", "Шаардагдах мэдлэг, ур чадвар, туршлага", "Цэвэр хэрэгцээ"];
  const li = a => a && a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "—";
  const badge = b => b ? `<span class="sn-badge sn-badge--${b}">${BADGE_TEXT[b]}</span>` : "";
  let body = rows.map(({ u, r }) => {
    const num = first ? r.n : signed(r.d ?? 0);
    const cls = !first && (r.d ?? 0) < 0 ? " net-neg" : "";
    return `<tr><td data-l="${head[0]}">${esc(r.t)}${badge(r.b)}<small>${esc(u.title)}${first ? "" : ` · ${r.n} орон тоо`}</small></td><td data-l="${head[1]}">${li(r.duty)}</td><td data-l="${head[2]}">${li(r.skill)}</td><td class="sn-num${cls}" data-l="${head[3]}">${num}</td></tr>`;
  }).join("");
  body += (s.removed || []).map(r => `<tr><td data-l="${head[0]}">${esc(r.t)}<span class="sn-badge sn-badge--reduced">Хасагдсан</span></td><td data-l="${head[1]}">${esc(r.note)}</td><td data-l="${head[2]}">—</td><td class="sn-num net-neg" data-l="${head[3]}">${signed(r.d)}</td></tr>`).join("");
  const prev = S[state.i - 1];
  const foot = first
    ? `<tr><td colspan="3">Нийт орон тоо</td><td class="sn-num">${s.headcount}</td></tr>`
    : `<tr><td colspan="3">Нийт цэвэр хэрэгцээ · ${prev.headcount} → ${s.headcount}</td><td class="sn-num">${signed(s.headcount - prev.headcount)}</td></tr>`;
  $("#roles").innerHTML = `
    <h3>${first ? "Албан тушаал ба орон тоо" : "Өөрчлөгдсөн, нэмэгдсэн албан тушаалууд"}</h3>
    <table class="sn-table">
      <thead><tr><th style="width:24%">${head[0]}</th><th>${head[1]}</th><th>${head[2]}</th><th class="sn-num">${head[3]}</th></tr></thead>
      <tbody>${body}</tbody>
      <tfoot>${foot}</tfoot>
    </table>`;
}

/* ── org chart (SVG) ─────────────────────────────────────── */
const nodeEls = new Map();

function buildNode(g, n) {
  g.replaceChildren();
  g.dataset.kind = n.kind;
  g.append(el("rect", { class: "o-box", x: 0.5, y: 0.5, width: n.w - 1, height: n.h - 1, rx: 2 }));
  g.append(el("rect", { class: "o-rule", x: 0, y: 0, width: n.w, height: 3, rx: 1 }));
  let ty = M.padTop;
  if (n.kicker) { ty += 10; g.append(el("text", { class: "o-kicker", x: M.padX, y: ty }, n.kicker.toUpperCase())); ty += 6; }
  for (const line of n.lines) { ty += M.line - 4; g.append(el("text", { class: "o-title", x: M.padX, y: ty }, line)); ty += 4; }
  if (n.count !== null) {
    ty += 26;
    const t = el("text", { class: "o-count", x: M.padX, y: ty });
    const num = el("tspan", { class: "o-num" }, String(n.count));
    t.append(num, el("tspan", { class: "o-unit", dx: 3 }, "хүн"));
    g.append(t);
  }
  if (n.badge && BADGE_TEXT[n.badge]) {
    const txt = BADGE_TEXT[n.badge].toUpperCase();
    const bw = measure(txt, 9.5) * 1.08 + 14;
    const b = el("g", { class: `o-badge ${n.badge}`, transform: `translate(${n.w - M.padX - bw} ${n.h - M.padBottom - 17})` });
    b.append(el("rect", { width: bw, height: 17, rx: 3 }), el("text", { x: bw / 2, y: 12, "text-anchor": "middle" }, txt));
    g.append(b);
  }
  const cnt = n.count === null ? "" : `, ${n.count} хүн`;
  g.setAttribute("aria-label", `${n.unit.title}${cnt}${n.badge ? ", " + BADGE_TEXT[n.badge] : ""}`);
}

function depth(n) { return n.level === "chain" || n.level === "side" ? 0 : n.level === "col" ? 1 : 2; }

function renderChart(animate = true) {
  const s = S[state.i];
  const view = $("#chartView");
  const chart = $("#chart");
  chart.dataset.mode = state.mode;
  const svg = $("#org");
  const lay = layout(s, { mode: state.mode, width: Math.max(280, view.clientWidth), measure });
  state.lay = lay;
  const anim = animate && !reduced;

  if (state.mode === "list") {
    svg.setAttribute("viewBox", `-1 -1 ${lay.width + 2} ${lay.height + 2}`);
    svg.setAttribute("height", lay.height + 2);
    svg.style.height = lay.height + 2 + "px";
  } else {
    svg.removeAttribute("viewBox"); svg.removeAttribute("height"); svg.style.height = "";
  }

  // links: fade out old, draw new
  const lg = $("#links");
  const drawLinks = () => {
    lg.replaceChildren(...lay.links.map(l => {
      const p = el("path", { d: l.d, class: "o-link" + (l.dashed ? " dashed" : anim ? " draw" : "") });
      if (!l.dashed && anim) p.setAttribute("pathLength", "1");
      return p;
    }));
    lg.style.opacity = 1;
  };
  if (anim && lg.childNodes.length) { lg.style.opacity = 0; setTimeout(drawLinks, 200); } else drawLinks();

  // nodes
  const ng = $("#nodes");
  const seen = new Set();
  lay.nodes.forEach((n, idx) => {
    seen.add(n.id);
    let g = nodeEls.get(n.id);
    const delay = anim ? depth(n) * 70 + Math.min(idx, 20) * 12 : 0;
    const target = `translate(${n.x}px, ${n.y}px)`;
    if (!g || g.classList.contains("leave")) {
      if (g) g.remove();
      g = el("g", { class: "o-node" + (anim ? " enter" : ""), tabindex: 0, role: "button", "data-id": n.id });
      g.style.transform = anim ? `translate(${n.x}px, ${n.y + 14}px)` : target;
      buildNode(g, n);
      g.addEventListener("click", onNodeClick);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSheet(g.dataset.id); } });
      ng.append(g);
      nodeEls.set(n.id, g);
      if (anim) {
        g.getBoundingClientRect();
        g.style.transitionDelay = `${delay + 120}ms`;
        requestAnimationFrame(() => { g.classList.remove("enter"); g.style.transform = target; });
      }
    } else {
      const old = g.querySelector(".o-num");
      const from = old ? +old.textContent : null;
      buildNode(g, n);
      g.style.transitionDelay = `${delay}ms`;
      g.style.transform = target;
      const nn = g.querySelector(".o-num");
      if (nn && from !== null && from !== n.count && anim) {
        countUp(nn, from, n.count, 600, delay + 200);
        g.classList.remove("pulse"); g.getBoundingClientRect(); g.classList.add("pulse");
      }
    }
  });
  for (const [id, g] of nodeEls) {
    if (!seen.has(id)) {
      nodeEls.delete(id);
      if (anim) { g.style.transitionDelay = "0ms"; g.classList.add("leave"); setTimeout(() => g.remove(), 380); }
      else g.remove();
    }
  }
  if (state.mode === "tree") {
    const sw = Math.min(1, (view.clientWidth - 48) / lay.width);
    view.style.height = Math.round(Math.max(380, Math.min(lay.height * sw + 56, innerHeight * 0.78, 760))) + "px";
    fit("width", anim);
  } else { view.style.height = ""; setView({ s: 1, x: 0, y: 0 }, false); }
}

/* ── pan & zoom (tree mode) ──────────────────────────────── */
function setView(v, anim = true) {
  state.view = v;
  const w = $("#world");
  w.classList.toggle("no-anim", !anim);
  w.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.s})`;
}
function fit(kind = "width", anim = true) {
  const view = $("#chartView"), lay = state.lay;
  const vw = view.clientWidth, vh = view.clientHeight, pad = 24;
  let s = (vw - pad * 2) / lay.width;
  if (kind === "all") s = Math.min(s, (vh - pad * 2) / lay.height);
  s = Math.min(1, s);
  const x = (vw - lay.width * s) / 2;
  const y = kind === "all" ? (vh - lay.height * s) / 2 : pad;
  setView({ s, x, y }, anim);
}
function zoomAt(f, cx, cy, anim = true) {
  const v = state.view;
  const s = Math.min(2.5, Math.max(0.2, v.s * f));
  const k = s / v.s;
  setView({ s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }, anim);
}

let dragMoved = false;
function initPanZoom() {
  const view = $("#chartView");
  const pts = new Map();
  let last = null, pinch = null;
  view.addEventListener("pointerdown", e => {
    if (state.mode !== "tree") return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragMoved = false;
    if (pts.size === 1) last = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: state.view.s };
    }
  });
  view.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId) || state.mode !== "tree") return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = view.getBoundingClientRect();
    if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2 - r.left, cy = (a.y + b.y) / 2 - r.top;
      zoomAt((pinch.s * d / pinch.d) / state.view.s, cx, cy, false);
      if (!dragMoved) { dragMoved = true; for (const id of pts.keys()) try { view.setPointerCapture(id); } catch (_) {} }
    } else if (pts.size === 1 && last) {
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      if (!dragMoved && Math.hypot(e.clientX - last.x0, e.clientY - last.y0) > 6) { dragMoved = true; view.classList.add("is-dragging"); try { view.setPointerCapture(e.pointerId); } catch (_) {} }
      if (dragMoved) setView({ ...state.view, x: state.view.x + dx, y: state.view.y + dy }, false);
      last.x = e.clientX; last.y = e.clientY;
    }
  });
  const end = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 1) { const p = [...pts.values()][0]; last = { x: p.x, y: p.y, x0: p.x, y0: p.y }; }
    if (!pts.size) { last = null; view.classList.remove("is-dragging"); }
  };
  view.addEventListener("pointerup", end);
  view.addEventListener("pointercancel", end);
  view.addEventListener("wheel", e => {
    if (state.mode !== "tree" || !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const r = view.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top, false);
  }, { passive: false });
  view.addEventListener("dblclick", e => {
    if (state.mode !== "tree" || e.target.closest(".o-node")) return;
    const r = view.getBoundingClientRect();
    zoomAt(1.6, e.clientX - r.left, e.clientY - r.top);
  });
  $("#zoomTools").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const vw = view.clientWidth / 2, vh = view.clientHeight / 2;
    if (b.dataset.zoom === "in") zoomAt(1.3, vw, vh);
    if (b.dataset.zoom === "out") zoomAt(1 / 1.3, vw, vh);
    if (b.dataset.zoom === "fit") fit("all");
  });
}

function onNodeClick(e) {
  if (dragMoved) { dragMoved = false; return; }
  openSheet(e.currentTarget.dataset.id);
}

/* ── detail sheet ────────────────────────────────────────── */
let lastFocus = null;
function openSheet(id) {
  const s = S[state.i];
  const u = s.units.find(x => x.id === id);
  if (!u) return;
  lastFocus = document.activeElement;
  nodeEls.forEach(g => g.classList.toggle("is-open", g.dataset.id === id));
  const parent = s.units.find(x => x.id === u.parent);
  const count = displayCount(s, u);
  const badge = u.badge ? `<span class="sn-badge sn-badge--${u.badge}">${BADGE_TEXT[u.badge]}</span>` : "";
  const kicker = [u.kicker, parent && u.level === "item" ? parent.title : null].filter(Boolean).join(" · ") || `Үе шат ${s.no}`;
  const li = a => a && a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
  let body = `<p class="sheet__kicker">${esc(kicker)}</p><h3 class="sheet__title" id="sheetTitle">${esc(u.title)}</h3>`;
  body += `<div class="sheet__sum">${count === null ? "" : `<b>${count}</b><span>${u.level === "col" ? "хүн, доод нэгжийг оруулаад" : "хүн"}</span>`} ${badge}</div>`;
  const note = { gov: "Компанийн засаглалын байгууллага. Гишүүд нь ажилтан биш тул орон тоонд тооцохгүй.", sub: "Тусдаа хуулийн этгээд — охин компани. Ажилчид нь компанийн орон тоонд орохгүй; хайрцгийн нийлүүлэлтийг ханган нийлүүлэлтийн менежер уялдуулна.", out: "Гадны гэрээт үйлчилгээ. Ачааллын оргил үед ашиглах тул орон тоонд тооцохгүй." }[u.kind];
  if (note) body += `<p class="sheet__empty">${note}</p>`;
  for (const r of u.roles) {
    const net = state.i > 0 && r.d ? `<small>${signed(r.d)}</small>` : "";
    body += `<div class="role"><div class="role__head"><h4 class="role__t">${esc(r.t)}</h4><span class="role__n">${r.n} ${net}</span></div>${r.b ? `<span class="sn-badge sn-badge--${r.b}">${BADGE_TEXT[r.b]}</span>` : ""}${r.duty && r.duty.length ? `<h5>Гүйцэтгэх үүрэг</h5>${li(r.duty)}` : ""}${r.skill && r.skill.length ? `<h5>Мэдлэг, ур чадвар</h5>${li(r.skill)}` : ""}</div>`;
  }
  const kids = s.units.filter(x => x.parent === u.id && x.level !== "side");
  if (kids.length) {
    body += `<div class="role"><h5>Доод нэгжүүд</h5><ul>${kids.map(k => `<li><a href="#" data-open="${k.id}">${esc(k.title)}</a>${displayCount(s, k) !== null ? ` — ${k.level === "col" ? subtreeCount(s, k.id) : displayCount(s, k)} хүн` : ""}</li>`).join("")}</ul></div>`;
  }
  $("#sheetBody").innerHTML = body;
  $("#sheetBody").scrollTop = 0;
  const sh = $("#sheet");
  sh.hidden = false;
  requestAnimationFrame(() => sh.classList.add("is-open"));
  state.open = id;
  setTimeout(() => $(".sheet__close").focus({ preventScroll: true }), 50);
}
function closeSheet() {
  const sh = $("#sheet");
  if (sh.hidden) return;
  sh.classList.remove("is-open");
  $(".sheet__panel").style.transform = "";
  nodeEls.forEach(g => g.classList.remove("is-open"));
  state.open = null;
  setTimeout(() => { sh.hidden = true; }, reduced ? 0 : 340);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
function initSheet() {
  const sh = $("#sheet");
  sh.addEventListener("click", e => {
    if (e.target.closest("[data-close]")) closeSheet();
    const a = e.target.closest("[data-open]");
    if (a) { e.preventDefault(); openSheet(a.dataset.open); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
  // swipe down to close (bottom sheet)
  const panel = $(".sheet__panel");
  let y0 = null, dy = 0;
  const start = e => { if (innerWidth >= 760) return; if ($("#sheetBody").scrollTop > 0 && !e.target.closest("#sheetGrab")) return; y0 = e.touches[0].clientY; dy = 0; panel.style.transition = "none"; };
  const move = e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); panel.style.transform = `translateY(${dy}px)`; };
  const stop = () => { if (y0 === null) return; panel.style.transition = ""; if (dy > 110) closeSheet(); else panel.style.transform = ""; y0 = null; };
  panel.addEventListener("touchstart", start, { passive: true });
  panel.addEventListener("touchmove", move, { passive: true });
  panel.addEventListener("touchend", stop);
}

/* ── compare ─────────────────────────────────────────────── */
function renderCompare() {
  const grid = $("#compareGrid");
  grid.innerHTML = "";
  S.forEach((s, i) => {
    const lay = layout(s, { mode: "tree", measure });
    const b = h("button", "cmp");
    b.type = "button";
    b.setAttribute("aria-label", `Үе шат ${s.no}: ${s.structure}, ${s.headcount} ажилтан — нээх`);
    const svg = el("svg", { viewBox: `-12 -12 ${lay.width + 24} ${lay.height + 24}`, preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" });
    for (const l of lay.links) svg.append(el("path", { d: l.d, class: "t-link" }));
    for (const n of lay.nodes) svg.append(el("rect", { class: `t-box ${n.kind}`, x: n.x, y: n.y, width: n.w, height: n.h, rx: 4 }));
    b.innerHTML = `<span class="cmp__no">${s.no}</span><span class="cmp__name">${esc(s.structure)}</span><span class="cmp__yr">${s.years}</span>`;
    b.append(svg);
    const dl = h("dl", "", `<dt>Ажилчид</dt><dd>${s.headcount}</dd><dt>Удирдлагын түвшин</dt><dd>${s.metrics.levels}</dd><dt>Захиралд шууд</dt><dd>${s.metrics.span}</dd><dt>Төвлөрөл</dt><dd>${CENTRAL[s.metrics.central]}</dd>`);
    b.append(dl);
    b.addEventListener("click", () => goStage(i, true));
    grid.append(b);
  });
}

/* ── stage switching ─────────────────────────────────────── */
function goStage(i, scroll = false) {
  i = Math.max(0, Math.min(S.length - 1, i));
  const changed = i !== state.i;
  state.i = i;
  closeSheet();
  updateSteps();
  renderHead();
  renderWhy();
  renderRoles();
  renderChart(changed);
  $("#prevBtn").disabled = i === 0;
  $("#nextBtn").disabled = i === S.length - 1;
  try { history.replaceState(null, "", `#stage-${i + 1}`); } catch (e) {}
  if (scroll) $("#structure").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

function initSwipe() {
  const zone = $("#eraHead");
  let x0 = null, y0 = null;
  zone.addEventListener("pointerdown", e => { if (e.pointerType === "mouse") return; x0 = e.clientX; y0 = e.clientY; });
  zone.addEventListener("pointerup", e => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 50) goStage(state.i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

function initModes() {
  const seg = $(".seg");
  const set = m => {
    state.mode = m;
    seg.querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", b.dataset.mode === m ? "true" : "false"));
    $("#chartHint").textContent = m === "tree" ? "Нэгж дээр дарж албан тушаал, үүргийг харна. Чирж, хоёр хуруугаар томруулна." : "Нэгж дээр дарж албан тушаал, үүргийг харна.";
    renderChart(false);
  };
  seg.addEventListener("click", e => { const b = e.target.closest("button"); if (b) set(b.dataset.mode); });
  set(state.mode);
}

function initTheme() {
  const btn = $("#themeBtn");
  const sync = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    btn.setAttribute("aria-label", dark ? "Гэрэл горим" : "Харанхуй горим");
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    document.querySelector('meta[name="theme-color"]').content = dark ? "#18110f" : "#faf6f0";
  };
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("sarnai-theme", next); } catch (e) {}
    sync();
  });
  sync();
}

/* ── boot ────────────────────────────────────────────────── */
async function boot() {
  renderStatic();
  initTheme();
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  renderGrowth();
  renderSteps();
  initPanZoom();
  initSheet();
  initSwipe();
  const m = location.hash.match(/stage-(\d)/);
  state.i = m ? Math.max(0, Math.min(S.length - 1, +m[1] - 1)) : 0;
  initModes();
  goStage(state.i);
  renderCompare();
  $("#prevBtn").addEventListener("click", () => goStage(state.i - 1));
  $("#nextBtn").addEventListener("click", () => goStage(state.i + 1));
  let rw = innerWidth;
  addEventListener("resize", () => {
    if (Math.abs(innerWidth - rw) < 40) return;
    rw = innerWidth;
    renderChart(false);
  });
  if (m) $("#structure").scrollIntoView();
}
boot();
