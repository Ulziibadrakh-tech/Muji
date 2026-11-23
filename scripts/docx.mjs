// Word report (.docx) generated from src/data.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, PageBreak, LevelFormat, Footer, PageNumber, TableLayoutType,
} from "docx";
import { Resvg } from "@resvg/resvg-js";
import { layout, staticSVG, PALETTE, BADGE_TEXT } from "../src/layout.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(here, "fonts");
const C = { ink: "0E0E10", muted: "63676E", cherry: "B3122E", line: "E3E5E9", sunk: "F4F5F7", cocoa: "4A3D00" };
const HEAD = "Arial", BODY = "Arial";
const signed = n => (n > 0 ? "+" + n : n < 0 ? "−" + Math.abs(n) : "0");
const CENTRAL = { 4: "Өндөр", 3: "Дунджаас дээш", 2: "Дунд", 1: "Бага" };

const P = (text, o = {}) => new Paragraph({ spacing: { after: 120, line: 300 }, ...o.p, children: [new TextRun({ text, ...o.r })] });
const bullet = text => new Paragraph({ numbering: { reference: "dots", level: 0 }, spacing: { after: 60, line: 288 }, children: [new TextRun(text)] });
const numbered = (text, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 100, line: 300 }, children: [new TextRun(text)] });

const border = { style: BorderStyle.SINGLE, size: 4, color: C.line };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
function cell(children, w, o = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders: { top: o.top || border, bottom: o.bottom || border, left: noBorder, right: noBorder },
    children: Array.isArray(children) ? children : [children],
  });
}
const cp = (text, o = {}) => new Paragraph({ alignment: o.align, spacing: { after: 20, line: 264 }, children: [new TextRun({ text, size: o.size || 19, bold: o.bold, color: o.color })] });
const listIn = (arr) => (arr && arr.length ? arr : ["—"]).map(t => new Paragraph({ numbering: arr && arr.length ? { reference: "dots-s", level: 0 } : undefined, spacing: { after: 20, line: 264 }, children: [new TextRun({ text: t, size: 19 })] }));

function orgImage(stage) {
  const lay = layout(stage, { mode: "tree" });
  const svg = staticSVG(stage, lay, PALETTE.light, { fonts: { sans: "Golos Text" } });
  const W = lay.width + 48, H = lay.height + 48;
  const fontFiles = fs.readdirSync(FONT_DIR).filter(f => f.endsWith(".ttf")).map(f => path.join(FONT_DIR, f));
  const png = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Golos Text" }, fitTo: { mode: "width", value: Math.round(W * 2) } }).render().asPng();
  const maxW = 610, maxH = 800; // px @96dpi within A4 margins
  const k = Math.min(maxW / W, maxH / H, 0.72);
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, children: [new ImageRun({ type: "png", data: png, transformation: { width: Math.round(W * k), height: Math.round(H * k) }, altText: { title: `Бүтцийн зураглал ${stage.no}`, description: `${stage.structure} — ${stage.headcount} ажилтан`, name: `org-${stage.no}` } })] });
}

function rolesTable(stage, prev) {
  const first = !prev;
  const head = first
    ? ["Албан тушаал", "Гүйцэтгэх үүрэг", "Мэдлэг, ур чадвар, зан төлөв", "Орон тоо"]
    : ["Өөрчлөгдсөн, нэмэгдсэн албан тушаал", "Гүйцэтгэх үүрэг", "Шаардагдах мэдлэг, ур чадвар, туршлага", "Цэвэр хэрэгцээ"];
  const W = [2350, 3150, 2700, 1006];
  const rows = [new TableRow({ tableHeader: true, children: head.map((t, i) => cell(cp(t, { bold: true, size: 18, color: C.muted, align: i === 3 ? AlignmentType.RIGHT : undefined }), W[i], { fill: C.sunk, bottom: { style: BorderStyle.SINGLE, size: 8, color: C.ink } })) })];
  for (const u of stage.units) for (const r of u.roles) {
    if (!first && !r.b && !(r.d ?? 0)) continue;
    const name = [new Paragraph({ spacing: { after: 20, line: 264 }, children: [new TextRun({ text: r.t, bold: true, size: 19 }), ...(r.b ? [new TextRun({ text: "  " + BADGE_TEXT[r.b], size: 16, color: r.b === "new" ? C.cherry : C.muted, bold: true })] : [])] }),
      cp(u.title + (first ? "" : ` · ${r.n} орон тоо`), { size: 16, color: C.muted })];
    rows.push(new TableRow({ cantSplit: true, children: [cell(name, W[0]), cell(listIn(r.duty), W[1]), cell(listIn(r.skill), W[2]), cell(cp(first ? String(r.n) : signed(r.d ?? 0), { bold: true, align: AlignmentType.RIGHT }), W[3])] }));
  }
  for (const r of stage.removed || []) {
    rows.push(new TableRow({ cantSplit: true, children: [cell([new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: r.t, bold: true, size: 19 }), new TextRun({ text: "  Хасагдсан", size: 16, color: C.muted, bold: true })] })], W[0]), cell(cp(r.note), W[1]), cell(cp("—"), W[2]), cell(cp(signed(r.d), { bold: true, align: AlignmentType.RIGHT }), W[3])] }));
  }
  const totalLabel = first ? "Нийт орон тоо" : `Нийт цэвэр орон тооны өөрчлөлт (${prev.headcount} → ${stage.headcount})`;
  const totalVal = first ? String(stage.headcount) : signed(stage.headcount - prev.headcount);
  rows.push(new TableRow({ children: [
    new TableCell({ columnSpan: 3, width: { size: W[0] + W[1] + W[2], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: "auto", fill: C.sunk }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, borders: { top: { style: BorderStyle.SINGLE, size: 8, color: C.ink }, bottom: border, left: noBorder, right: noBorder }, children: [cp(totalLabel, { bold: true })] }),
    cell(cp(totalVal, { bold: true, color: C.cherry, align: AlignmentType.RIGHT, size: 22 }), W[3], { fill: C.sunk, top: { style: BorderStyle.SINGLE, size: 8, color: C.ink } }),
  ] }));
  return new Table({ width: { size: 9206, type: WidthType.DXA }, columnWidths: W, layout: TableLayoutType.FIXED, rows });
}

const LOGO = fs.readFileSync(path.join(here, "ufe-logo.png"));
const TNR = "Times New Roman";
const none = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const tr = (text, o = {}) => new TextRun({ text, font: TNR, size: o.size || 26, bold: o.bold, italics: o.italics, underline: o.underline ? {} : undefined });
const tp = (runs, o = {}) => new Paragraph({ alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 0, line: o.line || 276 }, children: runs });
const tc = (children, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: none, verticalAlign: o.v || "top", margins: { top: o.pad ?? 40, bottom: o.pad ?? 40, left: 0, right: 0 }, children });
const grid = (W, rows) => new Table({ width: { size: W.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: W, layout: TableLayoutType.FIXED, borders: { ...none, insideHorizontal: noBorder, insideVertical: noBorder }, rows: rows.map(r => new TableRow({ children: r.map((c, i) => tc(c, W[i], { pad: 70 })) })) });

function coverPage(m) {
  const C3 = AlignmentType.CENTER;
  const head = new Table({ width: { size: 9298, type: WidthType.DXA }, columnWidths: [1500, 6298, 1500], layout: TableLayoutType.FIXED, borders: { ...none, insideHorizontal: noBorder, insideVertical: noBorder }, rows: [new TableRow({ children: [
    tc([new Paragraph({ children: [new ImageRun({ type: "png", data: LOGO, transformation: { width: 70, height: 90 }, altText: { title: "UFE", description: "Санхүү, эдийн засгийн их сургуулийн лого", name: "ufe-logo" } })] })], 1500, { v: "center" }),
    tc([tp([tr(m.school.toUpperCase().replace(",", ""), { bold: true, underline: true, size: 26 })], { align: C3 }), tp([tr(m.program.toUpperCase(), { bold: true, size: 22 })], { align: C3 })], 6298, { v: "center" }),
    tc([tp([tr("")])], 1500),
  ] })] });
  const dots = "………………………………";
  const W = [600, 2000, 3000, 3698];
  const sign = [["", [tr("Гүйцэтгэсэн", { size: 24 })], [tr(dots, { size: 24 })], [tr(m.authors[0] || "", { size: 24 })]],
    ...m.authors.slice(1).map(a => ["", [tr("")], [tr("")], [tr(a, { size: 24 })]]),
    ["", [tr("Шалгасан багш", { size: 24 })], [tr(dots, { size: 24 })], [tr(m.teacher, { size: 24 })]]];
  return [
    head,
    tp([tr(m.task.replace("№ ", "").toUpperCase(), { bold: true, size: 48 })], { align: C3, before: 2600, after: 360 }),
    grid([3400, 5898], [
      [[tp([tr("Хичээлийн нэр:", { bold: true })])], [tp([tr(m.course, { italics: true })])]],
      [[tp([tr("Группийн дугаар:", { bold: true })])], [tp([tr(m.group, { italics: true })])]],
    ]),
    tp([tr("Сэдэв", { bold: true, size: 24 }), tr(": “", { size: 24 }), tr(`${m.title}ийн ${m.topic}`.toUpperCase(), { italics: true, size: 24 }), tr("”", { size: 24 })], { before: 480 }),
    new Paragraph({ spacing: { before: 2200 }, children: [] }),
    grid(W, sign.map(r => r.map(c => [tp(c || [tr("")])]))),
    tp([tr(`${m.city}. ${m.year}`, { size: 24 })], { align: C3, before: 2000 }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function kvTable(pairs, W = [2400, 6806]) {
  return new Table({ width: { size: W[0] + W[1], type: WidthType.DXA }, columnWidths: W, layout: TableLayoutType.FIXED,
    rows: pairs.map(([k, v]) => new TableRow({ children: [cell(cp(k, { bold: true }), W[0]), cell(cp(v, { color: C.ink }), W[1])] })) });
}

export async function buildDocx(data, outFile) {
  const m = data.meta;
  const children = [];

  // cover — UFE standard title page
  children.push(...coverPage(m));

  // 1. case
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Кейсийн товч")] }));
  children.push(P(data.brief.lede));
  children.push(kvTable(data.brief.facts.map(f => [f.k, f.v])));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Даалгаврын агуулга")] }));
  data.brief.task.forEach(t => children.push(numbered(t, "task")));

  // growth summary
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Өсөлтийн тойм")] }));
  const W4 = [1400, 3406, 1500, 1400, 1500];
  children.push(new Table({ width: { size: 9206, type: WidthType.DXA }, columnWidths: W4, layout: TableLayoutType.FIXED, rows: [
    new TableRow({ tableHeader: true, children: ["Үе шат", "Бүтэц", "Ажилчид", "Түвшин", "Төвлөрөл"].map((t, i) => cell(cp(t, { bold: true, size: 18, color: C.muted, align: i >= 2 ? AlignmentType.RIGHT : undefined }), W4[i], { fill: C.sunk, bottom: { style: BorderStyle.SINGLE, size: 8, color: C.ink } })) }),
    ...data.stages.map(s => new TableRow({ children: [cell(cp(`${s.no} · ${s.years}`, { bold: true }), W4[0]), cell(cp(s.structure), W4[1]), cell(cp(String(s.headcount), { bold: true, align: AlignmentType.RIGHT, color: s === data.stages.at(-1) ? C.cherry : undefined }), W4[2]), cell(cp(String(s.metrics.levels), { align: AlignmentType.RIGHT }), W4[3]), cell(cp(CENTRAL[s.metrics.central], { align: AlignmentType.RIGHT }), W4[4])] })),
  ] }));

  // stages
  data.stages.forEach((s, i) => {
    const prev = data.stages[i - 1];
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(`${i + 2}. Үе шат ${s.no} (${s.years}): ${s.structure}`)] }));
    children.push(new Paragraph({ spacing: { after: 160 }, children: [
      new TextRun({ text: `${s.headcount} ажилтан`, bold: true, color: C.cherry, size: 26 }),
      new TextRun({ text: prev ? `   ${signed(s.headcount - prev.headcount)} өмнөх үеэс · ` : "   ", color: C.muted }),
      new TextRun({ text: `удирдлагын ${s.metrics.levels} түвшин · захиралд шууд ${s.metrics.span} · төвлөрөл ${CENTRAL[s.metrics.central].toLowerCase()}`, color: C.muted }),
    ] }));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Стратегийн зорилго")] }));
    children.push(P(s.goal));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Энэ бүтцийг сонгосон үндэслэл")] }));
    s.why.forEach(t => children.push(bullet(t)));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Бүтцийн зураглал")] }));
    children.push(orgImage(s));
    children.push(P(`Зураг ${i + 1}. ${s.structure}, ${s.years}. Тоо нь тухайн нэгжийн орон тоо; баганын толгойд доод нэгжүүдийг оруулсан нийлбэр.`, { p: { alignment: AlignmentType.CENTER, spacing: { after: 240 } }, r: { size: 17, color: C.muted, italics: true } }));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: false, children: [new TextRun(prev ? "Өөрчлөгдсөн, нэмэгдсэн албан тушаалууд" : "Албан тушаал, үүрэг, орон тоо")] }));
    children.push(rolesTable(s, prev));
  });

  // conclusion
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(`${data.stages.length + 2}. Дүгнэлт`)] }));
  data.conclusion.forEach(t => children.push(numbered(t, "concl")));

  const doc = new Document({
    creator: m.authors.join(", ") || "Сарнай баг",
    title: `${m.title} — ${m.task}`,
    description: m.subtitle,
    styles: {
      default: { document: { run: { font: BODY, size: 22, color: C.ink } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: HEAD, size: 36, bold: true, color: C.ink }, paragraph: { spacing: { before: 120, after: 160 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: BODY, size: 23, bold: true, color: C.cherry }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 1 } },
      ],
    },
    numbering: { config: [
      { reference: "dots", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] },
      { reference: "dots-s", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 200, hanging: 160 } } } }] },
      { reference: "task", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] },
      { reference: "concl", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] },
    ] },
    sections: [{
      properties: { titlePage: true, page: { size: { width: 11906, height: 16838 }, margin: { top: 1247, bottom: 1247, left: 1361, right: 1247 } } },
      footers: { first: new Footer({ children: [new Paragraph({ children: [] })] }), default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${m.title} · ${m.task} · `, size: 16, color: C.muted }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.muted })] })] }) },
      children,
    }],
  });
  fs.writeFileSync(outFile, await Packer.toBuffer(doc));
}
