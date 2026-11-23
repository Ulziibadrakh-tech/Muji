// Presentation (.pptx) generated from src/data.js — native shapes, editable in PowerPoint.
import pptxgen from "pptxgenjs";
import { BADGE_TEXT, subtreeCount, displayCount } from "../src/layout.js";

const C = { paper: "FAF6F0", raised: "FFFDF9", sunk: "F2EBE1", ink: "2A1A17", muted: "6E5C55", line: "E4D9CC", lineStrong: "957F70", cherry: "A01630", cherryStrong: "741226", cherrySoft: "F7E3E5", onCherry: "FFF8F2", cocoa: "6B4231", petrol: "2F5D6B", amber: "8A5414" };
const HEAD = "Cambria", BODY = "Calibri";
const RULE = { lead: C.cherry, cocoa: C.cocoa, petrol: C.petrol, support: C.lineStrong, gov: C.ink, sub: C.lineStrong, out: C.lineStrong };
const CENTRAL = { 4: "Өндөр", 3: "Дунджаас дээш", 2: "Дунд", 1: "Бага" };
const signed = n => (n > 0 ? "+" + n : n < 0 ? "−" + Math.abs(n) : "0");
const W = 13.333, H = 7.5, MX = 0.6;

export async function buildPptx(data, outFile) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = `${data.meta.title} — ${data.meta.task}`;
  pres.subject = data.meta.topic;
  pres.author = data.meta.authors.join(", ") || "Сарнай баг";
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
  const footer = `${data.meta.title} · ${data.meta.task}`;

  pres.defineSlideMaster({ title: "TITLE", background: { color: C.paper } });
  pres.defineSlideMaster({
    title: "CONTENT", background: { color: C.paper },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.42, w: W - MX * 2, h: 0.75, fontFace: HEAD, fontSize: 30, bold: true, color: C.ink, valign: "top", align: "left", margin: 0 }, text: "" } },
      { line: { x: MX, y: 6.98, w: W - MX * 2, h: 0, line: { color: C.line, width: 0.75 } } },
      { text: { text: footer, options: { x: MX, y: 7.02, w: 8, h: 0.3, fontFace: BODY, fontSize: 10, color: C.muted, margin: 0 } } },
    ],
    slideNumber: { x: W - MX - 0.6, y: 7.02, w: 0.6, h: 0.3, fontFace: BODY, fontSize: 10, color: C.muted, align: "right" },
  });
  pres.defineSlideMaster({
    title: "DIVIDER", background: { color: C.paper },
    objects: [{ rect: { x: 0, y: 0, w: 4.7, h: H, fill: { color: C.cherry } } }],
    slideNumber: { x: W - MX - 0.6, y: 7.02, w: 0.6, h: 0.3, fontFace: BODY, fontSize: 10, color: C.muted, align: "right" },
  });

  const text = (s, t, o) => s.addText(t, { isTextBox: true, margin: 0, fontFace: BODY, color: C.ink, ...o });

  // ── 1. title
  pres.addSection({ title: "Танилцуулга" });
  let s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Танилцуулга" });
  text(s, `${data.meta.task} — ${data.meta.topic}`, { x: MX, y: 0.7, w: 6.6, h: 0.4, fontSize: 14, color: C.muted });
  text(s, data.meta.title, { x: MX, y: 1.5, w: 6.6, h: 2.6, fontFace: HEAD, fontSize: 54, bold: true, valign: "top", lineSpacingMultiple: 0.9 });
  text(s, data.meta.subtitle, { x: MX, y: 4.25, w: 6.4, h: 0.8, fontSize: 18, bold: true, valign: "top" });
  text(s, [data.meta.school, data.meta.authors.length ? data.meta.authors.join(", ") : null].filter(Boolean).join("\n"), { x: MX, y: 6.2, w: 6.4, h: 0.7, fontSize: 12, color: C.muted, valign: "bottom" });
  const max = Math.max(...data.stages.map(x => x.headcount));
  const barColors = [C.cocoa, C.ink, C.cherryStrong, C.cherry];
  data.stages.forEach((st, i) => {
    const bw = 1.05, gap = 0.3, x = 7.75 + i * (bw + gap), base = 5.6, bh = Math.max(0.12, (st.headcount / max) * 3.6);
    s.addShape(pres.shapes.RECTANGLE, { x, y: base - bh, w: bw, h: bh, fill: { color: barColors[i] }, line: { color: barColors[i], width: 0 }, objectName: `bar-${st.no}` });
    text(s, String(st.headcount), { x, y: base - bh - 0.62, w: bw + 0.4, h: 0.55, fontFace: HEAD, fontSize: 30, bold: true, color: i === 3 ? C.cherry : C.ink, valign: "bottom" });
    text(s, st.years, { x, y: base + 0.12, w: bw + 0.3, h: 0.28, fontSize: 11, bold: true });
    text(s, st.short, { x, y: base + 0.4, w: bw + 0.3, h: 0.5, fontSize: 10, color: C.muted, valign: "top" });
  });
  s.addShape(pres.shapes.LINE, { x: 7.6, y: 5.6, w: 5.2, h: 0, line: { color: C.ink, width: 0.75 } });

  // ── 2. case
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Танилцуулга" });
  s.addText("Кейс ба даалгавар", { placeholder: "title" });
  text(s, "Даалгаврын агуулга", { x: MX, y: 1.45, w: 4.6, h: 0.35, fontSize: 15, bold: true, color: C.cherry });
  text(s, data.brief.task.map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: i < data.brief.task.length - 1, paraSpaceAfter: 10 } })), { x: MX, y: 1.9, w: 4.6, h: 2.6, fontSize: 16, valign: "top" });
  text(s, data.brief.lede, { x: MX, y: 4.6, w: 4.6, h: 2.0, fontSize: 13, color: C.muted, valign: "top" });
  data.brief.facts.forEach((f, i) => {
    const y = 1.45 + i * 1.06;
    s.addShape(pres.shapes.LINE, { x: 5.7, y, w: W - MX - 5.7, h: 0, line: { color: C.line, width: 0.75 } });
    text(s, f.k, { x: 5.7, y: y + 0.12, w: 1.9, h: 0.8, fontSize: 13, bold: true, valign: "top" });
    text(s, f.v, { x: 7.7, y: y + 0.12, w: W - MX - 7.7, h: 0.85, fontSize: 13, color: C.muted, valign: "top" });
  });

  // ── 3. overview
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Танилцуулга" });
  s.addText("Дөрвөн үе шат, дөрвөн бүтэц", { placeholder: "title" });
  data.stages.forEach((st, i) => {
    const cw = (W - MX * 2 - 0.3 * 3) / 4, x = MX + i * (cw + 0.3);
    s.addShape(pres.shapes.LINE, { x, y: 1.55, w: cw, h: 0, line: { color: i === data.stages.length - 1 ? C.cherry : C.lineStrong, width: 2.25 } });
    text(s, st.no, { x, y: 1.7, w: cw, h: 0.6, fontFace: HEAD, fontSize: 30, bold: true, color: C.cherry });
    text(s, st.years, { x, y: 2.35, w: cw, h: 0.3, fontSize: 12, bold: true, color: C.muted });
    text(s, st.structure, { x, y: 2.7, w: cw, h: 0.8, fontSize: 17, bold: true, valign: "top" });
    text(s, String(st.headcount), { x, y: 3.6, w: cw, h: 1.0, fontFace: HEAD, fontSize: 60, bold: true, color: i === data.stages.length - 1 ? C.cherry : C.ink, valign: "top" });
    text(s, "ажилтан" + (i ? ` · ${signed(st.headcount - data.stages[i - 1].headcount)}` : ""), { x, y: 4.65, w: cw, h: 0.3, fontSize: 12, color: C.muted });
    text(s, `Удирдлагын түвшин: ${st.metrics.levels}\nЗахиралд шууд: ${st.metrics.span}\nТөвлөрөл: ${CENTRAL[st.metrics.central]}`, { x, y: 5.15, w: cw, h: 1.0, fontSize: 12, valign: "top", lineSpacingMultiple: 1.2 });
    for (let k = 1; k <= 4; k++) s.addShape(pres.shapes.RECTANGLE, { x: x + (k - 1) * 0.16, y: 6.55 - k * 0.07, w: 0.1, h: k * 0.07, fill: { color: k <= st.metrics.central ? C.cherry : C.line }, line: { color: k <= st.metrics.central ? C.cherry : C.line, width: 0 } });
  });

  // ── stages
  data.stages.forEach((st, i) => {
    const prev = data.stages[i - 1];
    const sec = `Үе шат ${st.no}`;
    pres.addSection({ title: sec });

    // divider
    s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: sec });
    text(s, `Үе шат ${st.no}`, { x: 0.5, y: 0.6, w: 3.8, h: 0.4, fontSize: 16, bold: true, color: C.onCherry });
    text(s, st.years, { x: 0.5, y: 1.0, w: 3.8, h: 0.4, fontSize: 16, color: C.onCherry });
    text(s, String(st.headcount), { x: 0.5, y: 4.3, w: 3.8, h: 1.6, fontFace: HEAD, fontSize: 110, bold: true, color: C.onCherry, valign: "bottom" });
    text(s, "ажилтан" + (prev ? `  ${signed(st.headcount - prev.headcount)}` : ""), { x: 0.5, y: 6.0, w: 3.8, h: 0.4, fontSize: 16, color: C.onCherry });
    text(s, st.structure, { x: 5.3, y: 0.45, w: 7.4, h: 1.25, fontFace: HEAD, fontSize: 34, bold: true, valign: "bottom", lineSpacingMultiple: 0.95 });
    text(s, st.goal, { x: 5.3, y: 1.85, w: 7.4, h: 1.1, fontSize: 14, color: C.muted, valign: "top" });
    text(s, "Яагаад энэ бүтэц", { x: 5.3, y: 3.05, w: 7.4, h: 0.35, fontSize: 14, bold: true, color: C.cherry });
    text(s, st.why.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < st.why.length - 1, paraSpaceAfter: 6 } })), { x: 5.3, y: 3.45, w: 7.4, h: 2.95, fontSize: 13, valign: "top" });
    text(s, `Удирдлагын түвшин ${st.metrics.levels}   ·   Захиралд шууд ${st.metrics.span}   ·   Төвлөрөл ${CENTRAL[st.metrics.central].toLowerCase()}`, { x: 5.3, y: 6.55, w: 7.4, h: 0.35, fontSize: 12, color: C.muted });

    // chart
    s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
    s.addText("Бүтцийн зураглал", { placeholder: "title" });
    text(s, `Үе шат ${st.no} · ${st.years} · ${st.structure} · ${st.headcount} ажилтан`, { x: MX, y: 1.0, w: W - MX * 2, h: 0.35, fontSize: 14, color: C.muted });
    drawChart(pres, s, st);
    s.addNotes(st.why.join("\n\n"));

    // tables
    const rows = [];
    for (const u of st.units) for (const r of u.roles) if (!prev || r.b || (r.d ?? 0)) rows.push({ u, r });
    for (const r of st.removed || []) rows.push({ removed: r });
    const per = 6, pages = Math.ceil(rows.length / per);
    for (let p = 0; p < pages; p++) {
      s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
      const t = prev ? "Өөрчлөгдсөн, нэмэгдсэн албан тушаалууд" : "Албан тушаал, үүрэг, орон тоо";
      s.addText(t + (pages > 1 ? ` (${p + 1}/${pages})` : ""), { placeholder: "title" });
      const hdr = (prev ? ["Албан тушаал", "Гүйцэтгэх үүрэг", "Шаардагдах мэдлэг, ур чадвар, туршлага", "Цэвэр хэрэгцээ"] : ["Албан тушаал", "Гүйцэтгэх үүрэг", "Мэдлэг, ур чадвар, зан төлөв", "Орон тоо"])
        .map((h, k) => ({ text: h, options: { bold: true, fontSize: 11, color: C.muted, fill: { color: C.sunk }, align: k === 3 ? "right" : "left", border: [{ type: "none" }, { type: "none" }, { pt: 1, color: C.ink }, { type: "none" }] } }));
      const body = rows.slice(p * per, (p + 1) * per).map(({ u, r, removed }) => {
        const b = { border: [{ type: "none" }, { type: "none" }, { pt: 0.75, color: C.line }, { type: "none" }], valign: "top" };
        if (removed) return [
          { text: [{ text: removed.t, options: { bold: true, breakLine: true } }, { text: "Хасагдсан", options: { fontSize: 9, bold: true, color: C.muted } }], options: b },
          { text: removed.note, options: b }, { text: "—", options: b },
          { text: signed(removed.d), options: { ...b, align: "right", bold: true, color: C.amber } }];
        const tag = r.b ? BADGE_TEXT[r.b] + " · " : "";
        const net = prev ? signed(r.d ?? 0) : String(r.n);
        return [
          { text: [{ text: r.t, options: { bold: true, breakLine: true } }, { text: tag + u.title + (prev ? ` · ${r.n} орон тоо` : ""), options: { fontSize: 9, color: r.b === "new" ? C.cherry : C.muted } }], options: b },
          { text: (r.duty || []).join("; ") || "—", options: b },
          { text: (r.skill || []).join("; ") || "—", options: b },
          { text: net, options: { ...b, align: "right", bold: true, color: (r.d ?? 0) < 0 ? C.amber : C.ink } }];
      });
      const tableRows = [hdr, ...body];
      if (p === pages - 1) {
        const lbl = prev ? `Нийт цэвэр хэрэгцээ (${prev.headcount} → ${st.headcount})` : "Нийт орон тоо";
        const val = prev ? signed(st.headcount - prev.headcount) : String(st.headcount);
        const ft = { fill: { color: C.sunk }, bold: true, border: [{ pt: 1, color: C.ink }, { type: "none" }, { type: "none" }, { type: "none" }] };
        tableRows.push([{ text: lbl, options: { ...ft, colspan: 3 } }, { text: val, options: { ...ft, align: "right", color: C.cherry, fontSize: 14 } }]);
      }
      s.addTable(tableRows, { x: MX, y: 1.35, w: W - MX * 2, colW: [3.0, 4.15, 3.95, 1.03], fontFace: BODY, fontSize: 12, color: C.ink, margin: [0.07, 0.08, 0.07, 0.08], autoPage: false });
    }
  });

  // ── comparison
  pres.addSection({ title: "Дүгнэлт" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Дүгнэлт" });
  s.addText("Бүтцийн хувьсал", { placeholder: "title" });
  const bd = { border: [{ type: "none" }, { type: "none" }, { pt: 0.75, color: C.line }, { type: "none" }] };
  const head = [{ text: "", options: { ...bd, fill: { color: C.sunk } } }, ...data.stages.map(st => ({ text: [{ text: st.no + "  ", options: { color: C.cherry, bold: true, fontFace: HEAD, fontSize: 16 } }, { text: st.years, options: { color: C.muted, fontSize: 11 } }], options: { ...bd, fill: { color: C.sunk } } }))];
  const metric = (label, f, strong) => [{ text: label, options: { ...bd, color: C.muted } }, ...data.stages.map((st, k) => ({ text: String(f(st)), options: { ...bd, bold: !!strong, color: strong && k === data.stages.length - 1 ? C.cherry : C.ink, fontSize: strong ? 20 : 13 } }))];
  s.addTable([head,
    metric("Бүтэц", st => st.structure),
    metric("Ажилчид", st => st.headcount, true),
    metric("Удирдлагын түвшин", st => st.metrics.levels),
    metric("Захиралд шууд тайлагнах", st => st.metrics.span),
    metric("Төвлөрөл", st => CENTRAL[st.metrics.central]),
    metric("Бүтээгдэхүүний шугам", st => ["Шоколад, нарийн боов", "Шоколад, боов + гоо сайхны худалдаа", "Хоёр салбар", "Гурван салбар + охин компани"][data.stages.indexOf(st)] || ""),
  ], { x: MX, y: 1.45, w: W - MX * 2, colW: [2.65, 2.37, 2.37, 2.37, 2.37], fontFace: BODY, fontSize: 13, color: C.ink, margin: [0.1, 0.1, 0.1, 0.1] });

  // ── conclusion
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Дүгнэлт" });
  s.addText("Дүгнэлт", { placeholder: "title" });
  data.conclusion.forEach((t, k) => {
    const y = 1.5 + k * 1.3;
    text(s, String(k + 1).padStart(2, "0"), { x: MX, y, w: 0.9, h: 0.7, fontFace: HEAD, fontSize: 30, bold: true, color: C.cherry, valign: "top" });
    text(s, t, { x: MX + 1.0, y: y + 0.05, w: W - MX * 2 - 1.0, h: 1.1, fontSize: 16, valign: "top" });
  });

  // ── end
  s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Дүгнэлт" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: C.cherry }, line: { color: C.cherry, width: 0 } });
  text(s, "Анхаарал хандуулсанд баярлалаа", { x: MX, y: 2.0, w: W - MX * 2, h: 1.9, valign: "bottom", fontFace: HEAD, fontSize: 48, bold: true, color: C.onCherry });
  text(s, "Асуулт, санал", { x: MX, y: 4.15, w: W - MX * 2, h: 0.5, fontSize: 20, color: C.onCherry });

  await pres.writeFile({ fileName: outFile });
}

// Compact org chart: governance chain on top, divisions as columns with their sub-units listed inside.
function drawChart(pres, s, st) {
  const X0 = MX, Y0 = 1.6, AW = W - MX * 2, AH = 5.2;
  const units = st.units;
  const chain = units.filter(u => u.level === "chain");
  const cols = units.filter(u => u.level === "col");
  const itemsOf = id => units.filter(u => u.parent === id && u.level === "item");
  const sidesOf = id => units.filter(u => u.parent === id && u.level === "side");
  const line = (x, y, w, h, dashed) => s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color: C.lineStrong, width: 1, dashType: dashed ? "dash" : "solid" } });
  const box = (x, y, w, h, u) => {
    const out = u.kind === "out";
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: out ? C.paper : C.raised }, line: { color: out ? C.lineStrong : C.line, width: 0.75, dashType: out ? "dash" : "solid" }, objectName: `node-${u.id}` });
    if (!out) s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.045, fill: { color: RULE[u.kind] }, line: { color: RULE[u.kind], width: 0 } });
  };
  const nodeText = (x, y, w, h, u, count) => {
    const runs = [];
    if (u.kicker) runs.push({ text: u.kicker.toUpperCase(), options: { fontSize: 9, bold: true, color: C.muted, charSpacing: 1, breakLine: true } });
    runs.push({ text: u.title, options: { fontSize: 13, bold: true, color: C.ink, breakLine: count !== null || !!u.badge } });
    if (count !== null) runs.push({ text: `${count} хүн`, options: { fontSize: 12.5, bold: true, color: u.kind === "lead" ? C.cherry : C.ink } });
    if (u.badge) runs.push({ text: (count !== null ? "   " : "") + BADGE_TEXT[u.badge], options: { fontSize: 8.5, bold: true, color: u.badge === "new" ? C.cherry : C.muted } });
    s.addText(runs, { isTextBox: true, x: x + 0.1, y: y + 0.08, w: w - 0.2, h: h - 0.12, margin: 0, fontFace: BODY, valign: "top" });
  };

  const cw = 3.0, ch = chain.length > 2 ? 0.62 : 0.86, cgap = chain.length > 2 ? 0.14 : 0.2;
  let y = Y0;
  const cx = X0 + AW / 2;
  let prevBottom = null;
  for (const c of chain) {
    const x = cx - cw / 2;
    if (prevBottom !== null) line(cx, prevBottom, 0, y - prevBottom);
    box(x, y, cw, ch, c); nodeText(x, y, cw, ch, c, displayCount(st, c));
    for (const sd of sidesOf(c.id)) {
      const sx = x + cw + 0.55;
      line(x + cw, y + ch / 2, 0.55, 0);
      box(sx, y, cw, ch, sd); nodeText(sx, y, cw, ch, sd, displayCount(st, sd));
    }
    prevBottom = y + ch; y += ch + cgap;
  }
  const colY = prevBottom + 0.45, busY = prevBottom + 0.22;
  const n = cols.length, gap = 0.18;
  const colW = Math.min(3.0, (AW - (n - 1) * gap) / n);
  const startX = X0 + (AW - (n * colW + (n - 1) * gap)) / 2;
  const maxItems = Math.max(0, ...cols.map(c => itemsOf(c.id).length));
  const headH = 0.9;
  const rowH = Math.min(0.42, maxItems ? (Y0 + AH - colY - headH - 0.12) / maxItems : 0.34);
  line(cx, prevBottom, 0, busY - prevBottom);
  if (n > 1) line(startX + colW / 2, busY, (n - 1) * (colW + gap), 0);
  cols.forEach((c, i) => {
    const x = startX + i * (colW + gap);
    line(x + colW / 2, busY, 0, colY - busY);
    const items = itemsOf(c.id);
    const hgt = headH + (items.length ? items.length * rowH + 0.1 : 0);
    box(x, colY, colW, hgt, c);
    nodeText(x, colY, colW, headH, c, subtreeCount(st, c.id));
    if (items.length) {
      s.addShape(pres.shapes.LINE, { x: x + 0.1, y: colY + headH, w: colW - 0.2, h: 0, line: { color: C.line, width: 0.75 } });
      items.forEach((it, k) => {
        const iy = colY + headH + 0.05 + k * rowH;
        const cnt = displayCount(st, it);
        const label = it.title + (it.kind === "out" ? " (гэрээт)" : "");
        s.addText([{ text: label, options: { color: it.kind === "out" ? C.muted : C.ink } }, ...(it.badge && it.badge !== "out" ? [{ text: "  " + BADGE_TEXT[it.badge], options: { fontSize: 8, bold: true, color: it.badge === "new" ? C.cherry : C.muted } }] : [])],
          { isTextBox: true, x: x + 0.1, y: iy, w: colW - 0.65, h: rowH, margin: 0, fontFace: BODY, fontSize: 12, valign: "middle", fit: "shrink" });
        s.addText(cnt === null ? "—" : String(cnt), { isTextBox: true, x: x + colW - 0.55, y: iy, w: 0.45, h: rowH, margin: 0, fontFace: BODY, fontSize: 12, bold: true, align: "right", valign: "middle", color: C.ink });
      });
    }
  });
}
