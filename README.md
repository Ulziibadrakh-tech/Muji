# Сарнай шоколадны үйлдвэр — Семинарын даалгавар 2

Байгууллагын бүтэц, хүний нөөцийн бие даалт. Интерактив вэб сайт, Word тайлан, PowerPoint слайд гурвуулаа **нэг өгөгдлийн файлаас** үүснэ.

## Юу засах вэ

| Засах зүйл | Файл |
|---|---|
| Бүх текст, албан тушаал, орон тоо, үүрэг, ур чадвар, багийн нэр | `src/data.js` |
| Өнгө, фонт, хэмжээ | `src/tokens.css`, `src/site.css` |
| Сайтын бүтэц | `src/index.html`, `src/app.js` |
| Бүтцийн зураглалын байршил | `src/layout.js` |
| Word тайлан | `scripts/docx.mjs` |
| PowerPoint слайд | `scripts/pptx.mjs` |

Багийн гишүүдийн нэрийг `src/data.js` дотор `authors: ["Нэр 1", "Нэр 2"]` гэж бичнэ — сайт, тайлангийн нүүр, слайд гурвуулаа шинэчлэгдэнэ.

Build хийх бүрт орон тооны нийлбэрийг шалгана: үе шат бүрийн албан тушаалын нийлбэр 9 / 45 / 48 / 55-тай, цэвэр хэрэгцээ нь өмнөх үеийн зөрүүтэй тэнцэхгүй бол build зогсож, алдааг нэрлэнэ.

## Ажиллуулах

```bash
npm install
npm run build      # dist/ — сайт + downloads/*.docx, *.pptx
npm run dev        # build хийгээд http://localhost:5173 дээр нээнэ
```

Node 18+ хэрэгтэй.

## Vercel рүү байршуулах

1. Энэ хавтсыг GitHub repo болгон push хийнэ.
2. Vercel → **Add New → Project** → repo-г сонгоно.
3. Тохиргоо `vercel.json`-д бий (build: `npm run build`, output: `dist`). **Deploy** дарна.

Дараа нь `src/data.js`-ийг GitHub дээр засаж commit хийхэд Vercel дахин build хийж, сайт болон татах файлууд хамт шинэчлэгдэнэ.

## Бүтэц

```
src/            сайт (статик, framework-гүй)
  data.js       ← бүх агуулга
  layout.js     бүтцийн зураглалын байршил (сайт, слайд, тайланд хуваалцана)
  app.js        интерактив хэсэг: SVG зураглал, шилжилт, томруулах, дэлгэрэнгүй
scripts/
  build.mjs     dist/ үүсгэнэ
  validate.mjs  орон тооны шалгалт
  docx.mjs      Word тайлан
  pptx.mjs      PowerPoint слайд
  fonts/        Word тайлангийн зураглалд ашиглах Golos Text (ttf)
```

## Фонт

Cormorant Garamond, Golos Text — SIL Open Font License 1.1.
