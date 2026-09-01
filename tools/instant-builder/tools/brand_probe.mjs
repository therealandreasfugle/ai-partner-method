/**
 * brand_probe.mjs
 *
 * Pulls a business's brand off their existing website: their colours, their
 * logo and their photographs. Times every step, so the cost of adding this to
 * a build is a measured number rather than a guess.
 *
 *   node tools/brand_probe.mjs https://www.example.co.uk
 *
 * No API keys and no paid services: it is one page fetch and at most two
 * stylesheets. The whole point is that it is cheap enough to run on every lead
 * that has a site worth reading.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36";

/**
 * Colours that belong to a framework, not to a business.
 *
 * WordPress ships its default palette as inline CSS on every page, and
 * Bootstrap ships its own. Two unrelated Manchester firms came back with the
 * identical "brand" colours because of it, which would have repainted both
 * their sites in WordPress orange. Anything on this list is ignored no matter
 * how often it appears.
 */
const FRAMEWORK_COLOURS = new Set([
  // WordPress core palette
  "#0693e3", "#ff6900", "#fcb900", "#7bdcb5", "#00d084", "#8ed1fc",
  "#eb144c", "#f78da7", "#9b51e0", "#abb8c3", "#cf2e2e",
  // Bootstrap 5 theme colours
  "#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545", "#fd7e14",
  "#ffc107", "#198754", "#20c997", "#0dcaf0", "#0a58ca", "#212529",
  // Tailwind's most common defaults
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6",
]);

/** Colours that carry no brand: paper, ink, and the greys in between. */
function isNeutral([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max > 238 && min > 238) return true;            // white
  if (max < 34) return true;                          // black
  return max - min < 26;                              // grey
}

function toRgb(value) {
  let hex = value.trim().toLowerCase();
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = hex.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");

async function get(url, ms = 8000) {
  const stop = AbortSignal.timeout(ms);
  const res = await fetch(url, { headers: { "user-agent": UA }, signal: stop, redirect: "follow" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.text();
}

export async function readBrand(site) {
  const t0 = Date.now();
  const timing = {};
  const url = site.startsWith("http") ? site : "https://" + site;
  const origin = new URL(url).origin;

  let html;
  try {
    html = await get(url);
  } catch (error) {
    return { ok: false, why: String(error.message).slice(0, 60), ms: Date.now() - t0 };
  }
  timing.page = Date.now() - t0;

  /* --- colours ---------------------------------------------------------
     Read from the markup first, then from the stylesheets it links. The most
     used non-neutral colour is nearly always the brand. */
  const counts = new Map();
  const tally = (text, weight) => {
    const found = text.match(/#[0-9a-fA-F]{3,6}\b|rgba?\([^)]+\)/g) || [];
    for (const raw of found) {
      const rgb = toRgb(raw);
      if (!rgb || isNeutral(rgb)) continue;
      const key = hex(rgb);
      counts.set(key, (counts.get(key) || 0) + weight);
    }
  };

  tally(html, 2);   // inline styles and <style> blocks sit closest to the design

  const sheets = [...html.matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi)]
    .map((tag) => (tag[0].match(/href=["']([^"']+)["']/) || [])[1])
    .filter(Boolean)
    .filter((href) => !/fonts\.googleapis|font-awesome|bootstrap-icons/i.test(href))
    .slice(0, 2)
    .map((href) => (href.startsWith("http") ? href : new URL(href, url).href));

  const cssStart = Date.now();
  for (const sheet of sheets) {
    try { tally(await get(sheet, 6000), 1); } catch { /* a missing sheet is not fatal */ }
  }
  timing.css = Date.now() - cssStart;

  /* A framework colour is only discarded when it barely appears. WordPress
     writes its whole palette into every page whether the design uses it or
     not, which is how two unrelated firms came back with identical brands.
     Used heavily, though, it is genuinely theirs, so the test is how often it
     turns up rather than where it came from. */
  const colours = [...counts.entries()]
    .filter(([value, seen]) => !FRAMEWORK_COLOURS.has(value) || seen >= 12)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([value, seen]) => ({ value, seen, confident: seen >= 6 }));

  /* --- logo ------------------------------------------------------------
     og:image is the one the owner chose to represent them, so it wins. An
     <img> with "logo" in it is the fallback. */
  const meta = (prop) =>
    (html.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + prop + '["\'][^>]+content=["\']([^"\']+)', "i")) || [])[1];

  const images = [...html.matchAll(/<img[^>]+>/gi)].map((m) => m[0]);
  const srcOf = (tag) => (tag.match(/(?:data-)?src=["']([^"']+)["']/) || [])[1];
  const abs = (href) => {
    if (!href) return null;
    try { return href.startsWith("http") ? href : new URL(href, url).href; } catch { return null; }
  };

  /* Regulators, trade bodies and payment providers all put "logo" in their
     filenames, and on a dentist's page there are more of those than there are
     of the practice's own. The one in the header wins, then og:image, and the
     accreditation badges are excluded outright. */
  const notTheirs = /association|accredit|member|partner|badge|award|approved|checkatrade|trustpilot|gdc|which|google|facebook|visa|mastercard/i;
  const header = (html.match(/<(?:header|nav)[\s\S]{0,4000}?<\/(?:header|nav)>/i) || [])[0] || "";
  const headerLogo = [...header.matchAll(/<img[^>]+>/gi)]
    .map((m) => m[0])
    .find((tag) => /logo|brand/i.test(tag) && !notTheirs.test(tag));

  const anyLogo = images.find((tag) => /logo|brand/i.test(tag) && !notTheirs.test(tag));
  /* Plenty of sites never use the word "logo" anywhere. On those, the first
     image inside the header is the mark, because that is where it always is. */
  const firstInHeader = [...header.matchAll(/<img[^>]+>/gi)]
    .map((m) => m[0])
    .find((tag) => !notTheirs.test(tag));

  const logo = abs(headerLogo ? srcOf(headerLogo) : null) ||
               abs(meta("og:image")) ||
               abs(anyLogo ? srcOf(anyLogo) : null) ||
               abs(firstInHeader ? srcOf(firstInHeader) : null) || null;

  /* --- photographs -----------------------------------------------------
     Their own pictures of their own work, which is the whole point. Icons,
     sprites, badges and tracking pixels are filtered out by name, and anything
     hosted somewhere else is dropped: a Facebook tracking pixel is an <img>
     too, and so is every stock photo hotlinked from a CDN we cannot rely on. */
  const junk = /icon|sprite|logo|badge|avatar|placeholder|pixel|spacer|arrow|star|\.svg($|\?)/i;
  const photos = [...new Set(images.map(srcOf).map(abs).filter(Boolean))]
    .filter((href) => !junk.test(href) && !notTheirs.test(href))
    .filter((href) => {
      try { return new URL(href).origin === origin; } catch { return false; }
    })
    .slice(0, 8);

  return {
    ok: true,
    origin,
    colours,
    logo,
    photos,
    counts: { images: images.length, stylesheets: sheets.length },
    timing,
    ms: Date.now() - t0,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const target = process.argv[2];
  if (!target) throw new Error("give me a website");
  const brand = await readBrand(target);
  console.log(JSON.stringify(brand, null, 2));
}
