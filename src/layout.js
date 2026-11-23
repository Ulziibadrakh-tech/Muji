// Org-chart layout shared by the website (SVG, animated), the PowerPoint
// generator (native shapes) and the Word generator (rendered PNG).
// Pure functions: no DOM access.

export const BADGE_TEXT = { new: "Шинэ", changed: "Өөрчлөгдсөн", reduced: "Багассан", out: "Гэрээт" };

export const M = {
  colW: 196, itemW: 178, gapX: 20, gapY: 56, stack: 10, indent: 18,
  padX: 14, padTop: 13, padBottom: 12, kicker: 16, line: 19, count: 26, side: 32,
  titleSize: 14.5, kickerSize: 10.5, countSize: 21,
};

// Rough text measure for environments without canvas (Node).
export function estimateWidth(text, size, weight = 600) {
  let w = 0;
  for (const ch of text) {
    if (ch === " ") w += 0.28;
    else if ("ilj.,:;|!'’()«»—–-".includes(ch)) w += 0.32;
    else if ("мшщжюфыМШЩЖЮФЫmwMW".includes(ch)) w += 0.82;
    else if (ch === ch.toUpperCase() && /[A-ZА-ЯӨҮЁ]/.test(ch)) w += 0.68;
    else w += 0.535;
  }
  return w * size * (weight >= 600 ? 1.03 : 1);
}

export function wrap(text, maxW, size, measure = estimateWidth, maxLines = 2) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (measure(next, size, 600) <= maxW || !cur) cur = next;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1] + " " + lines.slice(maxLines).join(" ");
    while (measure(last + "…", size, 600) > maxW && last.length > 1) last = last.slice(0, -1);
    kept[maxLines - 1] = last.trimEnd() + "…";
    return kept;
  }
  return lines;
}

const own = u => u.roles.reduce((a, r) => a + r.n, 0);

export function subtreeCount(stage, id) {
  const u = stage.units.find(x => x.id === id);
  let n = own(u);
  for (const c of stage.units.filter(x => x.parent === id && x.level !== "side")) n += subtreeCount(stage, c.id);
  return n;
}

export function displayCount(stage, u) {
  if (u.kind === "gov" || u.kind === "sub" || u.kind === "out") return null;
  return u.level === "col" ? subtreeCount(stage, u.id) : own(u);
}

function nodeBox(stage, u, w, measure) {
  const lines = wrap(u.title, w - M.padX * 2, M.titleSize, measure, 2);
  const kicker = u.kicker && u.level !== "item" ? u.kicker : (u.kind === "out" || u.kind === "sub" ? u.kicker : null);
  const count = displayCount(stage, u);
  const h = M.padTop + (kicker ? M.kicker : 0) + lines.length * M.line + 6 + (count === null && !u.badge ? 0 : M.count) + M.padBottom - (count === null && !u.badge ? 6 : 0);
  return { id: u.id, unit: u, w, h, lines, kicker, count, level: u.level, kind: u.kind, badge: u.badge || null };
}

// mode: "tree" (wide, top-down) or "list" (narrow, indented)
export function layout(stage, { mode = "tree", width = 360, measure = estimateWidth } = {}) {
  const units = stage.units;
  const chain = units.filter(u => u.level === "chain");
  const top = chain[chain.length - 1];
  const cols = units.filter(u => u.level === "col");
  const itemsOf = id => units.filter(u => u.parent === id && u.level === "item");
  const sidesOf = id => units.filter(u => u.parent === id && u.level === "side");
  const nodes = [], links = [];
  const L = (id, d, dashed = false) => links.push({ id, d, dashed });

  if (mode === "tree") {
    const colsW = cols.length * M.colW + Math.max(0, cols.length - 1) * M.gapX;
    const hasSide = chain.some(c => sidesOf(c.id).length);
    const chainW = M.colW + (hasSide ? (M.side + M.colW) * 2 : 0);
    const W = Math.max(colsW, chainW);
    const cx = W / 2;
    let y = 0;
    let prev = null;
    for (const c of chain) {
      const b = nodeBox(stage, c, M.colW, measure);
      b.x = cx - M.colW / 2; b.y = y; nodes.push(b);
      if (prev) L(`${prev.id}-${c.id}`, `M${cx} ${prev.y + prev.h} V${y}`);
      for (const s of sidesOf(c.id)) {
        const sb = nodeBox(stage, s, M.colW, measure);
        sb.x = b.x + M.colW + M.side; sb.y = b.y + (b.h - sb.h) / 2; nodes.push(sb);
        L(`${c.id}-${s.id}`, `M${b.x + M.colW} ${b.y + b.h / 2} H${sb.x}`, s.kind === "out");
      }
      prev = b; y += b.h + M.gapY * 0.6;
    }
    const pb = nodes.find(n => n.id === top.id);
    const colY = pb.y + pb.h + M.gapY;
    const busY = pb.y + pb.h + M.gapY / 2;
    let x0 = (W - colsW) / 2;
    const colBoxes = cols.map((c, i) => {
      const b = nodeBox(stage, c, M.colW, measure);
      b.x = x0 + i * (M.colW + M.gapX); b.y = colY; return b;
    });
    // equalise column header heights for a clean row
    const hMax = Math.max(0, ...colBoxes.map(b => b.h));
    colBoxes.forEach(b => (b.h = hMax));
    if (colBoxes.length) {
      const first = colBoxes[0].x + M.colW / 2, last = colBoxes[colBoxes.length - 1].x + M.colW / 2;
      L(`${top.id}-bus`, `M${cx} ${pb.y + pb.h} V${busY}` + (colBoxes.length > 1 ? ` M${first} ${busY} H${last}` : ""));
    }
    let maxY = colY + hMax;
    for (const b of colBoxes) {
      nodes.push(b);
      L(`bus-${b.id}`, `M${b.x + M.colW / 2} ${busY} V${b.y}`);
      let iy = b.y + b.h + M.stack + 6;
      const trunkX = b.x + M.indent / 2 + 2;
      let lastMid = null;
      for (const it of itemsOf(b.id)) {
        const ib = nodeBox(stage, it, M.itemW, measure);
        ib.x = b.x + M.indent; ib.y = iy; nodes.push(ib);
        const mid = iy + Math.min(ib.h / 2, 22);
        L(`${b.id}-${it.id}`, `M${trunkX} ${mid} H${ib.x}`, it.kind === "out");
        lastMid = mid; iy += ib.h + M.stack;
      }
      if (lastMid !== null) L(`${b.id}-trunk`, `M${trunkX} ${b.y + b.h} V${lastMid}`);
      maxY = Math.max(maxY, iy);
    }
    return { nodes, links, width: W, height: maxY };
  }

  // list mode
  const W = width;
  const step = 14;
  let y = 0;
  let prev = null;
  const place = (u, x) => {
    const b = nodeBox(stage, u, W - x, measure);
    b.x = x; b.y = y; nodes.push(b); y += b.h + M.stack; return b;
  };
  for (const c of chain) {
    const b = place(c, 0);
    if (prev) L(`${prev.id}-${c.id}`, `M${step} ${prev.y + prev.h} V${b.y}`);
    for (const s of sidesOf(c.id)) {
      const sb = place(s, step * 2);
      L(`${c.id}-${s.id}`, `M${step} ${b.y + b.h} V${sb.y + 20} H${sb.x}`);
    }
    prev = b;
  }
  const pb = nodes.find(n => n.id === top.id);
  let lastColMid = null;
  for (const c of cols) {
    const cb = place(c, step * 2);
    const mid = cb.y + 20;
    L(`${top.id}-${c.id}`, `M${step} ${mid} H${cb.x}`);
    lastColMid = mid;
    let lastMid = null;
    for (const it of itemsOf(c.id)) {
      const ib = place(it, step * 4);
      const m = ib.y + Math.min(ib.h / 2, 20);
      L(`${c.id}-${it.id}`, `M${step * 3} ${m} H${ib.x}`, it.kind === "out");
      lastMid = m;
    }
    if (lastMid !== null) L(`${c.id}-trunk`, `M${step * 3} ${cb.y + cb.h} V${lastMid}`);
  }
  if (lastColMid !== null) L(`${top.id}-trunk`, `M${step} ${pb.y + pb.h} V${lastColMid}`);
  return { nodes, links, width: W, height: y };
}

// Static SVG markup (used for the Word report image and the comparison thumbnails).
export function staticSVG(stage, lay, c, { scale = 1, fonts = { sans: "Golos Text", serif: "Cormorant Garamond" }, pad = 24 } = {}) {
  const W = lay.width + pad * 2, H = lay.height + pad * 2;
  const rule = k => ({ lead: c.cherry, cocoa: c.cocoa, petrol: c.petrol, support: c.lineStrong, gov: c.ink, sub: c.lineStrong }[k] || c.lineStrong);
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * scale}" height="${H * scale}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${c.paper}"/><g transform="translate(${pad} ${pad})">`;
  for (const l of lay.links) s += `<path d="${l.d}" fill="none" stroke="${c.lineStrong}" stroke-width="1"${l.dashed ? ' stroke-dasharray="4 3"' : ""}/>`;
  for (const n of lay.nodes) {
    const out = n.kind === "out";
    s += `<g transform="translate(${n.x} ${n.y})">`;
    s += `<rect x="0.5" y="0.5" width="${n.w - 1}" height="${n.h - 1}" rx="2" fill="${out ? c.paper : c.raised}" stroke="${out ? c.lineStrong : c.line}"${out ? ' stroke-dasharray="4 3"' : ""}/>`;
    if (!out) s += `<rect x="0" y="0" width="${n.w}" height="3" rx="1" fill="${rule(n.kind)}"/>`;
    let ty = M.padTop;
    if (n.kicker) { ty += 10; s += `<text x="${M.padX}" y="${ty}" font-family="${fonts.sans}" font-size="${M.kickerSize}" font-weight="600" letter-spacing="1" fill="${c.muted}">${esc(n.kicker.toUpperCase())}</text>`; ty += 6; }
    for (const line of n.lines) { ty += M.line - 4; s += `<text x="${M.padX}" y="${ty}" font-family="${fonts.sans}" font-size="${M.titleSize}" font-weight="600" fill="${out ? c.muted : c.ink}">${esc(line)}</text>`; ty += 4; }
    if (n.count !== null) {
      ty += 6 + 20;
      s += `<text x="${M.padX}" y="${ty}" font-family="${fonts.sans}" font-size="${M.countSize}" font-weight="600" fill="${n.kind === "lead" ? c.cherry : c.ink}">${n.count}<tspan font-size="11" font-weight="400" fill="${c.muted}" dx="3">хүн</tspan></text>`;
    }
    if (n.badge) {
      const t = BADGE_TEXT[n.badge].toUpperCase();
      const bw = estimateWidth(t, 9.5) + 14;
      const bg = { new: c.cherrySoft, changed: c.amberSoft, reduced: c.sunk, out: c.paper }[n.badge];
      const fg = { new: c.cherry, changed: c.amber, reduced: c.muted, out: c.muted }[n.badge];
      s += `<rect x="${n.w - M.padX - bw}" y="${n.h - M.padBottom - 17}" width="${bw}" height="17" rx="3" fill="${bg}"${n.badge === "out" ? ` stroke="${c.lineStrong}"` : ""}/><text x="${n.w - M.padX - bw / 2}" y="${n.h - M.padBottom - 5}" text-anchor="middle" font-family="${fonts.sans}" font-size="9.5" font-weight="600" letter-spacing="0.8" fill="${fg}">${esc(t)}</text>`;
    }
    s += `</g>`;
  }
  return s + `</g></svg>`;
}

export const PALETTE = {
  light: { paper: "#faf6f0", raised: "#fffdf9", sunk: "#f2ebe1", ink: "#2a1a17", muted: "#6e5c55", line: "#e4d9cc", lineStrong: "#957f70", cherry: "#a01630", cherryStrong: "#741226", cherrySoft: "#f7e3e5", onCherry: "#fff8f2", cocoa: "#6b4231", cocoaSoft: "#efe4dc", petrol: "#2f5d6b", petrolSoft: "#e2ecee", amber: "#8a5414", amberSoft: "#f6ead8" },
};
