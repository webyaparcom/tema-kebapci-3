/* doner-porsiyon-tahtasi — Döner Porsiyon Tahtası — tebeşir tahtası menü, porsiyon anahtarıyla tüm fiyatlar değişir (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Koyu, çift çerçeveli tebeşir tahtası: üstte etiket/başlık/metin ve yarım · tam · 1,5 porsiyon anahtarı; altında iki sütunlu yemek satırları (ikon, ad, eğik rozet, acılık biberleri, açıklama) ve sağda porsiyon fiyatı. Anahtar değişince tüm sütunun fiyatı tebeşir efektiyle yenilenir. Kayıt alanları: `fiyat` · `fiyat2` · `fiyat3` (porsiyon başına), `aci` (0–3), `rozet`. JS yokken her satırda tüm porsiyon fiyatları başlıklı mini sütunlar hâlinde.
   Üretici: scripts/modul-fabrika (aile module) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: desing: ust · baslik · metin · img · img2 · cta_ad/cta_url · cta2_ad/cta2_url; data (maddeler): [{ ikon?, baslik, metin?, url? }] — metinler dil sözlüğü. */
const P = "modulex-doner-porsiyon-tahtasi";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: module --- */
const yeniMadde = veri.map((o) => ({
  ikon: ikonAd(ilk(o, ["ikon", "icon"])), baslik: metinAl(o, ["baslik", "name", "title"]),
  metin: metinAl(o, ["metin", "text", "description", "spot"]), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
/* module-1 eski şeması: name2/spot2/icon2 … name4 → madde */
const eskiMadde = [2, 3, 4].map((n) => ({ ikon: ikonAd(des["icon" + n]), baslik: metinAl(des, ["name" + n]), metin: metinAl(des, ["spot" + n]), url: "" })).filter((k) => k.baslik);
const kayitlar = yeniMadde.length ? yeniMadde : eskiMadde;
const G1 = medyaUrl(ilk(des, ["img", "image"]));
const G2 = medyaUrl(ilk(des, ["img2", "image2"]));
const gH = (src, s, w, h) => (src ? `<img class="${P}-${s}" src="${esc(src)}" alt="" width="${w || 1200}" height="${h || 900}" loading="lazy" decoding="async" />` : "");
const ustH = (B) => (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "");
const basH = (B) => (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "");
const metH = (B) => (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "");
const listeH = (ic) => (ic ? `<ul class="${P}-maddeler" role="list">${ic}</ul>` : "");
const maddeVar = (k, i) => `<li class="${P}-madde">${ikonH(k.ikon || "check_circle", `${P}-mikon`)}<div class="${P}-myazi"><h3 class="${P}-mbaslik">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${k.metin ? `<p class="${P}-mmetin">${satirlar(k.metin)}</p>` : ""}</div></li>`;
/* --- modül: doner-porsiyon-tahtasi --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = yeniMadde.length ? veri.filter((o) => metinAl(o, ["baslik", "name", "title"])) : [];
    const x = (i, ks) => metinAl(R[i] || {}, ks);
    const sy = (i, ks) => {
      const v = ilk(R[i] || {}, ks);
      if (typeof v === "number") return v;
      let t = pick(v).replace(/[^\d.,]/g, "");
      t = /,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
      const n = t ? Number(t) : NaN;
      return Number.isFinite(n) ? n : NaN;
    };
    const PB = /^[A-Za-z]{3}$/.test(metinAl(des, ["paraBirimi"])) ? metinAl(des, ["paraBirimi"]).toUpperCase() : "";
    const para = (v) => { try { return new Intl.NumberFormat(dil || undefined, PB ? { style: "currency", currency: PB, maximumFractionDigits: v % 1 ? 2 : 0 } : { maximumFractionDigits: 2 }).format(v); } catch (e) { return String(v); } };
    const PA = [metinAl(des, ["p1Ad"]), metinAl(des, ["p2Ad"]), metinAl(des, ["p3Ad"])];
    const FK = [["fiyat", "price"], ["fiyat2", "price2"], ["fiyat3", "price3"]];
    const fv = (i, j) => { const f = sy(i, FK[j]); return Number.isFinite(f) ? para(f) : x(i, FK[j]); };
    /* sütun: fiyatı olan porsiyon; ikinci/üçüncü porsiyon yalnız adı verilmişse */
    const KOL = [0, 1, 2].filter((j) => (j === 0 || PA[j]) && A.some((k, i) => fv(i, j)));
    const coklu = KOL.length > 1 && KOL.every((j) => PA[j]);
    const VS = Math.max(0, KOL.indexOf(Number(metinAl(des, ["varsayilanPorsiyon"])) - 1));
    const AA = metinAl(des, ["aciAd"]);
    const satir = (k, i) => {
      const n = Math.max(0, Math.min(3, Math.round(sy(i, ["aci", "spicy"]) || 0)));
      const rz = x(i, ["rozet", "badge", "etiket"]);
      const aci = n ? `<span class="${P}-aci"${AA ? ` role="img" aria-label="${esc(AA)} ${n}/3"` : ' aria-hidden="true"'}>${'<span class="material-symbols-outlined" aria-hidden="true">local_fire_department</span>'.repeat(n)}</span>` : "";
      const fh = KOL.map((j) => { const t = fv(i, j); return `<span class="${P}-pf" data-p="${j}">${coklu ? `<small class="${P}-pad">${esc(PA[j])}</small>` : ""}<bdi>${t ? esc(t) : "—"}</bdi></span>`; }).join("");
      return `<li class="${P}-yemek"><div class="${P}-yad">${ikonH(k.ikon, `${P}-yikon`)}<h3 class="${P}-yisim">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${rz ? `<span class="${P}-yrozet">${esc(rz)}</span>` : ""}${aci}</div>${k.metin ? `<p class="${P}-yacik">${satirlar(k.metin)}</p>` : ""}${fh ? `<div class="${P}-fiyatlar">${fh}</div>` : ""}</li>`;
    };
    const secici = coklu ? `<div class="${P}-psecici" role="group" aria-label="${esc(metinAl(des, ["porsiyonAd"]) || B.baslik)}">${KOL.map((j, z) => `<button type="button" class="${P}-pdug" data-psec="${j}"${z === VS ? ' data-varsay="1"' : ""} aria-pressed="${z === VS}">${esc(PA[j])}</button>`).join("")}</div>` : "";
    const not = metinAl(des, ["tahtaNot"]);
    return `<div class="${P}-tahta"><div class="${P}-tbas"><div class="${P}-tgiris">${ustH(B)}${basH(B)}${metH(B)}</div>${secici}</div><ul class="${P}-yemekler" role="list">${A.map(satir).join("")}</ul>${not || ctaHtml() ? `<div class="${P}-tson">${not ? `<p class="${P}-tnot">${esc(not)}</p>` : ""}${ctaHtml()}</div>` : ""}</div>`;
  };
const B = { ust: metinAl(des, ["ust","title","badge"]), baslik: metinAl(des, ["baslik","name"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !B.baslik && !B.metin;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
