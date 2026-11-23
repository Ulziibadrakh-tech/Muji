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
  $("#heroMeta").textContent = `${m.task} — ${m.topic}`;
  $("#cvUni").textContent = m.school.toUpperCase().replace(",", "");
  $("#cvProg").textContent = (m.program || "").toUpperCase();
  $("#cvTitle").textContent = m.task.replace("№ ", "").toUpperCase();
  $("#cvCourse").textContent = m.course || "";
  $("#cvGroup").textContent = m.group || "";
  $("#cvTopic").textContent = `${m.title}ийн ${m.topic}`.toUpperCase();
  $("#cvSign").innerHTML = [["Гүйцэтгэсэн", m.authors], ["Шалгасан багш", [m.teacher].filter(Boolean)]]
    .map(([k, names]) => `<span class="cover__k">${esc(k)}</span><span class="cover__dots" aria-hidden="true"></span><span class="cover__v">${names.map(esc).join("<br>")}</span>`).join("");
  $("#cvCity").textContent = [m.city, m.year].filter(Boolean).join(". ");
  $("#heroTitle").textContent = m.title;
  $("#heroSub").textContent = m.subtitle;
  $("#heroLede").textContent = data.brief.lede;
  $("#briefTask").innerHTML = data.brief.task.map(t => `<li>${esc(t)}</li>`).join("");
  $("#briefFacts").innerHTML = data.brief.facts.map(f => `<dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd>`).join("");
  $("#conclusion").innerHTML = data.conclusion.map(t => `<li>${esc(t)}</li>`).join("");
  $("#footText").textContent = [m.task, m.course, m.group && `Групп ${m.group}`, m.school, m.authors.join(", "), m.teacher && `Багш ${m.teacher}`].filter(Boolean).join(" · ");
}

/* ── hero bento: KPIs, gauges, net-need bars, centralisation arc ── */
const ARROW = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
function renderHero() {
  const last = S[S.length - 1];
  const nets = S.map((s, i) => (i ? s.headcount - S[i - 1].headcount : s.headcount));
  const maxNet = Math.max(...nets);
  const kpis = [
    { label: "Ажилчид, 2031", num: last.headcount, unit: "хүн", accent: true },
    { label: "Үе шат", num: S.length, unit: "бүтэц" },
    { label: "Хамгийн их өсөлт", num: "+" + maxNet, unit: S[nets.indexOf(maxNet)].years.slice(2, 4) + "–" + S[nets.indexOf(maxNet)].years.slice(-2) },
    { label: "Удирдлагын түвшин", num: S[0].metrics.levels + "→" + last.metrics.levels, unit: "" },
  ];
  const hc = S.map(s => s.headcount), mx = Math.max(...hc);
  const viz = [
    // headcount step line
    `<svg viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="var(--cherry)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" points="${hc.map((v, i) => `${i * 66.6},${52 - (v / mx) * 48}`).join(" ")}"/>${hc.map((v, i) => `<circle cx="${i * 66.6}" cy="${52 - (v / mx) * 48}" r="3.5" fill="var(--surface)" stroke="var(--cherry)" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join("")}</svg>`,
    // four stages as growing tiles
    `<svg viewBox="0 0 200 56" aria-hidden="true">${S.map((s, i) => `<rect x="${i * 50}" y="${56 - 14 - i * 12}" width="42" height="${14 + i * 12}" rx="8" fill="${i === S.length - 1 ? "var(--ink)" : "var(--surface-3)"}"/>`).join("")}</svg>`,
    // net-need mini bars
    `<svg viewBox="0 0 200 56" aria-hidden="true">${nets.map((n, i) => `<rect x="${i * 50 + 6}" y="${56 - Math.max(4, (n / maxNet) * 56)}" width="30" height="${Math.max(4, (n / maxNet) * 56)}" rx="6" fill="${n === maxNet ? "var(--cherry)" : "var(--surface-3)"}"/>`).join("")}</svg>`,
    // management layers 3 → 5
    `<svg viewBox="0 0 200 56" aria-hidden="true">${[0, 1, 2].map(k => `<rect x="${30 - k * 10}" y="${k * 13 + 8}" width="${20 + k * 20}" height="7" rx="3.5" fill="var(--surface-3)"/>`).join("")}${[0, 1, 2, 3, 4].map(k => `<rect x="${150 - k * 9}" y="${k * 10 + 3}" width="${16 + k * 18}" height="6" rx="3" fill="var(--ink)"/>`).join("")}<path d="M88 30h22m-6-5 6 5-6 5" fill="none" stroke="var(--ink-muted)" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  ];
  $("#kpis").innerHTML = kpis.map((k, i) => `<div class="card kpi${k.accent ? " kpi--accent" : ""}"><div class="kpi__top"><span>${esc(k.label)}</span><span class="kpi__icon">${ARROW}</span></div><div class="kpi__viz">${viz[i]}</div><div class="kpi__num">${k.num}${k.unit ? `<small>${esc(k.unit)}</small>` : ""}</div></div>`).join("");

  // gauges: share of final headcount
  const R = 40, C = 2 * Math.PI * R, sweep = 0.75; // 270° dial
  const box = $("#gauges");
  box.innerHTML = "";
  S.forEach((s, i) => {
    const pct = Math.round((s.headcount / last.headcount) * 100);
    const b = h("button", "gauge");
    b.type = "button"; b.dataset.i = i;
    b.setAttribute("aria-label", `Үе шат ${s.no}, ${s.years}: ${s.headcount} ажилтан — нээх`);
    const ticks = Array.from({ length: 12 }, (_, k) => { const a = (135 + k * (270 / 11)) * Math.PI / 180; return `<line class="gauge__tick" x1="${50 + Math.cos(a) * 48}" y1="${50 + Math.sin(a) * 48}" x2="${50 + Math.cos(a) * 52}" y2="${50 + Math.sin(a) * 52}"/>`; }).join("");
    b.innerHTML = `<span class="gauge__pct">${s.headcount}<small>хүн</small></span>
      <svg viewBox="0 0 100 100" aria-hidden="true">${ticks}
        <circle class="gauge__track" cx="50" cy="50" r="${R}" stroke-dasharray="${C * sweep} ${C}" transform="rotate(135 50 50)"/>
        <circle class="gauge__fill" cx="50" cy="50" r="${R}" stroke-dasharray="${C * sweep} ${C}" stroke-dashoffset="${C * sweep}" transform="rotate(135 50 50)" data-off="${C * sweep * (1 - pct / 100)}"/>
        <text x="50" y="56" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor" font-family="inherit">${pct}%</text>
      </svg>
      <span class="gauge__yr">${s.years}</span><span class="gauge__name">${esc(s.short)}</span>`;
    b.addEventListener("click", () => goStage(i, true));
    box.append(b);
  });
  requestAnimationFrame(() => setTimeout(() => box.querySelectorAll(".gauge__fill").forEach(c => (c.style.strokeDashoffset = c.dataset.off)), reduced ? 0 : 350));

  // net-need bars
  const svg = $("#bars");
  const W = 300, base = 150, maxH = 112, bw = 46, gap = (W - bw * S.length) / (S.length - 1);
  svg.innerHTML = "";
  nets.forEach((n, i) => {
    const x = i * (bw + gap), hgt = Math.max(6, (n / maxNet) * maxH);
    svg.append(el("rect", { class: "b-ghost", x, y: base - maxH, width: bw, height: maxH, rx: 12 }));
    const r = el("rect", { class: "b-bar" + (n === maxNet ? " hot" : "") + (reduced ? "" : " grow"), x, y: base - hgt, width: bw, height: hgt, rx: 12 });
    r.style.animationDelay = `${300 + i * 110}ms`;
    svg.append(r);
    svg.append(el("text", { class: "b-val", x: x + bw / 2, y: base - hgt - 8, "text-anchor": "middle" }, (i ? "+" : "") + n));
    svg.append(el("text", { class: "b-lbl", x: x + bw / 2, y: base + 18, "text-anchor": "middle" }, s_yr(S[i].years)));
  });

  // centralisation arc
  drawArc(0);
}
const s_yr = y => "’" + y.slice(2, 4) + "–" + y.slice(-2);
function drawArc(sel) {
  const svg = $("#arc");
  const cx = 120, cy = 118, r = 92;
  const pt = t => [cx - r * Math.cos(Math.PI * t), cy - r * Math.sin(Math.PI * t)];
  const len = Math.PI * r;
  const v = S[sel].metrics.central; // 4..1
  svg.innerHTML = "";
  svg.append(el("path", { class: "a-track", d: `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}` }));
  const f = el("path", { class: "a-fill", d: `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`, "stroke-dasharray": `${len} ${len}`, "stroke-dashoffset": len });
  svg.append(f);
  requestAnimationFrame(() => (f.style.strokeDashoffset = len * (1 - v / 4)));
  S.forEach((s, i) => {
    const [x, y] = pt(s.metrics.central / 4);
    const d = el("circle", { class: "a-dot" + (i === sel ? " on" : ""), cx: x, cy: y, r: i === sel ? 9 : 6, tabindex: 0, role: "button", "aria-label": `Үе шат ${s.no}: төвлөрөл ${CENTRAL[s.metrics.central].toLowerCase()}` });
    d.addEventListener("click", () => drawArc(i));
    d.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); drawArc(i); } });
    svg.append(d);
  });
  svg.append(el("text", { class: "a-num", x: cx, y: cy - 22, "text-anchor": "middle" }, s_yr(S[sel].years)));
  svg.append(el("text", { class: "a-cap", x: cx, y: cy - 2, "text-anchor": "middle" }, "Цэг дээр дарна"));
  $("#arcLabel").innerHTML = `<b>${CENTRAL[v]}</b> — ${esc(S[sel].structure.toLowerCase())}`;
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
    const b = h("button", "step");
    b.type = "button"; b.setAttribute("role", "tab"); b.id = `tab-${i}`;
    b.innerHTML = `<span class="step__no">${s.no}</span><span class="step__txt"><span class="step__yr">${s.years}</span><span class="step__nm">${esc(s.short)} · ${s.headcount}</span></span>`;
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
  });
}

function renderHead() {
  const s = S[state.i], p = S[state.i - 1];
  const delta = p ? `<b>${signed(s.headcount - p.headcount)}</b> өмнөх үеэс` : "Анхны баг";
  $("#eraHead").innerHTML = `
    <div class="era__no" aria-hidden="true">${s.no}</div>
    <div>
      <p class="era__yr">Үе шат ${s.no} · ${s.years}</p>
      <h2 class="era__title" id="eraTitle">${esc(s.structure)}</h2>
    </div>
    <div class="era__stat">
      <div class="era__count" id="eraCount">${s.headcount}</div>
      <div class="era__delta">ажилтан · ${delta}</div>
    </div>`;
  if (p) countUp($("#eraCount"), p.headcount, s.headcount, 600);
}

function meter(v) { return `<span class="meter" aria-label="${CENTRAL[v]}">${[1, 2, 3, 4].map(k => `<i class="${k <= v ? "on" : ""}" style="height:${10 + k * 6}px"></i>`).join("")}</span>`; }

function renderWhy() {
  const s = S[state.i];
  $("#why").innerHTML = `
    <article class="card"><h3>Стратегийн зорилго</h3><p class="goal">${esc(s.goal)}</p></article>
    <article class="card"><h3>Яагаад энэ бүтэц</h3><ol>${s.why.map(t => `<li>${esc(t)}</li>`).join("")}</ol></article>
    <article class="card card--black">
      <dl class="metrics">
        <div><dt>Удирдлагын түвшин</dt><dd>${s.metrics.levels}</dd></div>
        <div><dt>Захиралд шууд</dt><dd>${s.metrics.span}</dd></div>
        <div><dt>Төвлөрөл: ${CENTRAL[s.metrics.central].toLowerCase()}</dt><dd>${meter(s.metrics.central)}</dd></div>
      </dl>
    </article>`;
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
    return `<tr><td data-l="${head[0]}">${esc(r.t)}${badge(r.b)}<small>${esc(u.title)}${first ? "" : ` · ${r.n} орон тоо`}</small></td><td data-l="${head[1]}">${li(r.duty)}</td><td data-l="${head[2]}">${li(r.skill)}</td><td class="num${cls}" data-l="${head[3]}">${num}</td></tr>`;
  }).join("");
  body += (s.removed || []).map(r => `<tr><td data-l="${head[0]}">${esc(r.t)}<span class="sn-badge sn-badge--reduced">Хасагдсан</span></td><td data-l="${head[1]}">${esc(r.note)}</td><td data-l="${head[2]}">—</td><td class="num net-neg" data-l="${head[3]}">${signed(r.d)}</td></tr>`).join("");
  const prev = S[state.i - 1];
  const total = first ? `Нийт орон тоо<b>${s.headcount}</b>` : `Нийт цэвэр орон тооны өөрчлөлт ${prev.headcount} → ${s.headcount}<b>${signed(s.headcount - prev.headcount)}</b>`;
  $("#roles").innerHTML = `
    <div class="roles__head"><h3>${first ? "Албан тушаал ба орон тоо" : "Өөрчлөгдсөн, нэмэгдсэн албан тушаалууд"}</h3><span class="roles__total">${total}</span></div>
    <table class="tbl">
      <thead><tr><th style="width:26%">${head[0]}</th><th>${head[1]}</th><th>${head[2]}</th><th class="num">${head[3]}</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

/* ── org chart (SVG) ─────────────────────────────────────── */
const nodeEls = new Map();

function buildNode(g, n) {
  g.replaceChildren();
  g.dataset.kind = n.kind;
  g.append(el("rect", { class: "o-box", x: 0.5, y: 0.5, width: n.w - 1, height: n.h - 1, rx: 14 }));
  if (n.kind !== "out") g.append(el("circle", { class: "o-dot", cx: n.w - 15, cy: 15, r: 4 }));
  let ty = M.padTop;
  if (n.kicker) { ty += 10; g.append(el("text", { class: "o-kicker", x: M.padX, y: ty }, n.kicker)); ty += 6; }
  for (const line of n.lines) { ty += M.line - 4; g.append(el("text", { class: "o-title", x: M.padX, y: ty }, line)); ty += 4; }
  if (n.count !== null) {
    ty += 26;
    const t = el("text", { class: "o-count", x: M.padX, y: ty });
    const num = el("tspan", { class: "o-num" }, String(n.count));
    t.append(num, el("tspan", { class: "o-unit", dx: 4 }, "хүн"));
    g.append(t);
  }
  if (n.badge && BADGE_TEXT[n.badge]) {
    const txt = BADGE_TEXT[n.badge];
    const bw = measure(txt, 9.5) * 1.06 + 16;
    const b = el("g", { class: `o-badge ${n.badge}`, transform: `translate(${n.w - M.padX - bw + 4} ${n.h - M.padBottom - 18})` });
    b.append(el("rect", { width: bw, height: 18, rx: 9 }), el("text", { x: bw / 2, y: 12.5, "text-anchor": "middle" }, txt));
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
  let body = `<p class="sheet__kicker"><span class="chip">${esc(kicker)}</span></p><h3 class="sheet__title" id="sheetTitle">${esc(u.title)}</h3>`;
  body += `<div class="sheet__sum">${count === null ? "" : `<b>${count}</b><span>${u.level === "col" ? "хүн, доод нэгжийг оруулаад" : "хүн"}</span>`} ${badge}</div>`;
  const note = { gov: "Компанийн засаглалын байгууллага. Гишүүд нь ажилтан биш тул орон тоонд тооцохгүй.", sub: "Тусдаа хуулийн этгээд — хувьцааны хяналтын багцыг (51-ээс дээш хувь) эзэмшдэг охин компани. Ажилчид нь компанийн орон тоонд орохгүй; хайрцгийн нийлүүлэлтийг ханган нийлүүлэлтийн менежер уялдуулна.", out: "Гадны гэрээт үйлчилгээ. Ачааллын оргил үед ашиглах тул орон тоонд тооцохгүй." }[u.kind];
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
    const svg = el("svg", { viewBox: `-8 -8 ${lay.width + 16} ${lay.height + 16}`, preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" });
    for (const l of lay.links) svg.append(el("path", { d: l.d, class: "t-link" }));
    for (const n of lay.nodes) svg.append(el("rect", { class: `t-box ${n.kind}`, x: n.x, y: n.y, width: n.w, height: n.h, rx: 14 }));
    b.innerHTML = `<div class="cmp__top"><span class="cmp__no">${s.no}</span><span class="cmp__yr">${s.years}</span></div><span class="cmp__name">${esc(s.structure)}</span>`;
    b.append(svg);
    b.append(h("div", "cmp__big", `${s.headcount}<small style="font-size:14px;font-weight:500;letter-spacing:0;color:var(--ink-muted);margin-left:6px">ажилтан</small>`));
    b.append(h("dl", "", `<dt>Удирдлагын түвшин</dt><dd>${s.metrics.levels}</dd><dt>Захиралд шууд</dt><dd>${s.metrics.span}</dd><dt>Төвлөрөл</dt><dd>${CENTRAL[s.metrics.central]}</dd>`));
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
  drawArc(i);
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
    $("#chartHint").textContent = m === "tree" ? "Нэгжийг сонгож албан тушаал, үүргийн мэдээллийг харна. Зургийг чирж байрлалыг өөрчилж, хоёр хуруугаар томруулна." : "Нэгжийг сонгож албан тушаал, үүргийн мэдээллийг харна.";
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
    document.querySelector('meta[name="theme-color"]').content = dark ? "#0a0a0b" : "#edeff2";
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
  renderHero();
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
