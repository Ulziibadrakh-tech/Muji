// Checks that every stage's org chart adds up to its planned headcount
// and that net changes add up to the difference from the previous stage.
export function validate(data) {
  const errors = [];
  let prev = null;
  for (const s of data.stages) {
    const ids = new Set();
    let total = 0, net = 0;
    for (const u of s.units) {
      if (ids.has(u.id)) errors.push(`${s.no}: давхар id ${u.id}`);
      ids.add(u.id);
      if (u.parent && !s.units.some(x => x.id === u.parent)) errors.push(`${s.no}: ${u.id} эцэг ${u.parent} олдсонгүй`);
      for (const r of u.roles) { total += r.n; net += (r.d ?? 0); }
    }
    for (const r of s.removed || []) net += r.d;
    if (total !== s.headcount) errors.push(`Үе шат ${s.no}: орон тооны нийлбэр ${total} ≠ төлөвлөсөн ${s.headcount}`);
    if (prev && net !== s.headcount - prev.headcount) errors.push(`Үе шат ${s.no}: цэвэр хэрэгцээ ${net} ≠ ${s.headcount - prev.headcount}`);
    prev = s;
  }
  return errors;
}
