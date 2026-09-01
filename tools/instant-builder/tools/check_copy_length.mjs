/**
 * check_copy_length.mjs
 *
 * Answers one question: does the generator actually write more than one clipped
 * line per field now that the prompt asks for two sentences?
 *
 *   node tools/check_copy_length.mjs
 *   node tools/check_copy_length.mjs --trade "plumber" --town "Leeds"
 *
 * It builds the SAME prompts the live builder uses, sends them to the SAME free
 * model cascade, and prints the length of every field that shows on the page,
 * with a pass or fail against the minimum that field is supposed to hit.
 *
 * FREE KEYS ONLY. It reads GROQ_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY and
 * MISTRAL_API_KEY from the Agentic Workflows .env. It never touches the paid
 * Anthropic or OpenAI keys, and it never writes a site, stores anything or
 * sends an email. Nothing here costs money.
 *
 * The prompts are pulled straight out of api/build.js at runtime rather than
 * copied, so this cannot quietly drift from what the builder really sends.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BUILD_JS = join(ROOT, "api-service", "api", "build.js");
const ENV_FILE = join(dirname(ROOT), "Agentic Workflows", ".env");

/* ------------------------------------------------------------------ setup */

function loadEnv() {
  let text = "";
  try {
    text = readFileSync(ENV_FILE, "utf8");
  } catch {
    console.error(`could not read ${ENV_FILE}`);
    return;
  }
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    const value = rest.join("=").trim().replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "");
    if (!process.env[key.trim()]) process.env[key.trim()] = value;
  }
}

/**
 * Pull the pieces we need out of build.js without importing it. The file's only
 * export is the Vercel handler, and importing that would drag in the whole
 * request path. Evaluating just the functions we name keeps this honest: the
 * prompt text is the real one, byte for byte.
 */
function extractFromBuilder(names) {
  const source = readFileSync(BUILD_JS, "utf8");

  /** Read from `from` to the character that closes the first `open` after it. */
  const balanced = (from, open, close) => {
    const start = source.indexOf(open, from);
    let depth = 0;
    for (let i = start; i < source.length; i++) {
      if (source[i] === open) depth++;
      else if (source[i] === close) { depth--; if (depth === 0) return source.slice(from, i + 1); }
    }
    throw new Error(`unbalanced ${open} at ${from}`);
  };

  const parts = [];

  // Constants the prompts read. HARD_RULES is a template literal, the example
  // sets are an object, so each needs its own way of finding the end.
  const rulesStart = source.indexOf("const COPY_DOCTRINE");
  parts.push(source.slice(rulesStart, source.indexOf("`;", rulesStart) + 2));

  const egStart = source.indexOf("const LENGTH_EXAMPLES");
  if (egStart > -1) parts.push(balanced(egStart, "{", "}") + ";");

  for (const name of names) {
    let start = source.indexOf(`function ${name}(`);
    if (start < 0) throw new Error(`${name} not found in build.js`);
    // Keep the `async` if there is one. Slicing from `function` alone turns an
    // async function into a plain one, and its awaits become a syntax error.
    if (source.slice(start - 6, start) === "async ") start -= 6;
    parts.push(balanced(start, "{", "}"));
  }
  const constNames = ["MIN_COPY", "atPath", "countWords", "SLOP"];
  for (const name of constNames) {
    const start = source.indexOf(`const ${name} =`);
    if (start < 0) continue;
    const arrayConst = name === "MIN_COPY" || name === "SLOP";
    const semi = source.indexOf(arrayConst ? "];" : ";", start);
    parts.push(source.slice(start, semi + (arrayConst ? 2 : 1)));
  }
  // generateJson lives in this file, not the builder, so the extracted code
  // is handed ours. Same contract: a prompt in, parsed JSON out.
  return new Function("generateJson", parts.join("\n\n") + `\nreturn { ${names.join(", ")} };`)(
    async (prompt) => (await generateJson(prompt)).data);
}

/* ------------------------------------------------------------- model calls */

function keysFor(provider) {
  const base = {
    groq: "GROQ_API_KEY", gemini: "GEMINI_API_KEY",
    openrouter: "OPENROUTER_API_KEY", mistral: "MISTRAL_API_KEY",
  }[provider];
  const keys = process.env[base] ? [process.env[base]] : [];
  for (let i = 2; i <= 10; i++) {
    if (process.env[`${base}_${i}`]) keys.push(process.env[`${base}_${i}`]);
  }
  return keys;
}

const CASCADE = [
  ["groq", "llama-3.3-70b-versatile"],
  ["gemini", "gemini-2.5-flash"],
  ["mistral", "mistral-small-latest"],
  ["openrouter", "openai/gpt-oss-20b:free"],
];

async function post(url, headers, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 90)}`);
  return r.json();
}

async function callModel(provider, model, key, prompt) {
  if (provider === "gemini") {
    const d = await post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {}, { contents: [{ parts: [{ text: prompt }] }] });
    return d.candidates[0].content.parts[0].text;
  }
  const endpoint = {
    groq: "https://api.groq.com/openai/v1/chat/completions",
    mistral: "https://api.mistral.ai/v1/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
  }[provider];
  const d = await post(endpoint, { authorization: `Bearer ${key}` },
    { model, messages: [{ role: "user", content: prompt }], temperature: 0.7 });
  return d.choices[0].message.content;
}

async function generateJson(prompt) {
  const tried = [];
  for (const [provider, model] of CASCADE) {
    for (const key of keysFor(provider)) {
      try {
        let text = await callModel(provider, model, key, prompt);
        text = String(text).trim()
          .replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim();
        return { data: JSON.parse(text), via: `${provider}/${model}` };
      } catch (error) {
        tried.push(`${provider}/${model}: ${String(error.message).slice(0, 60)}`);
      }
    }
  }
  throw new Error("no free model answered:\n  " + tried.join("\n  "));
}

/* --------------------------------------------------------------- checking */

const words = (t) => String(t || "").trim().split(/\s+/).filter(Boolean).length;
const sentences = (t) => String(t || "").split(/[.!?]+(?:\s|$)/).filter((s) => s.trim()).length;

/** field path, what it is, minimum words, minimum sentences */
const CHECKS = [
  ["copy.hero.subheadline", "hero subheadline", 20, 2],
  ["copy.formSubtext", "form subtext", 8, 2],
  ["copy.cta.body", "final call to action", 20, 2],
  ["copy.privacyLine", "privacy line", 8, 2],
  ["copy.services.body", "services intro", 12, 2],
  ["copy.gallery.body", "gallery intro", 12, 2],
  ["copy.serviceAreas.body", "service areas intro", 12, 2],
  ["copy.blog.body", "blog intro", 12, 2],
  ["copy.process.body", "process intro", 12, 2],
  ["copy.founder.para1", "founder paragraph 1", 25, 2],
  ["copy.founder.para2", "founder paragraph 2", 25, 2],
];

const dig = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

/**
 * The prompt shows the model real sentences so it can see the target length.
 * The first time it did that, the model returned them verbatim, which would
 * have shipped identical roofing copy on every site. Length alone is therefore
 * not enough of a check: this looks for any run of five words lifted straight
 * out of an example.
 */
const EXAMPLE_TEXT = [
  // roofing set
  "Owner-led crews, honest estimates, and a clean job site. Get a free inspection from a roofer who actually climbs up there.",
  "Book a free inspection today. We will tell you the truth about your roof, even if the truth is that you do not need us yet.",
  "He started the company after years of watching homeowners get burned by storm chasers who blow into town, slap on a roof and disappear. He built it to be the opposite: local, accountable, and up on the roof himself for every estimate.",
  // dental set
  "Evening appointments, prices agreed before anything starts, and a dentist who explains what they are doing. Book a check-up with someone who will not talk you into work you do not need.",
  "Book your first appointment today. If your teeth are fine we will tell you so and send you home, because we would rather have you back in six months than sell you something now.",
  "She set the practice up after years of watching patients put off a check-up because they were scared of the bill more than the drill. Everything here is built around removing that: the price is agreed first, the plan is explained in plain words, and nothing starts until you say so.",
].join(" ");

const COMMON = new Set(("a an and are as at be but by can do for from get have i if in is it its me my no not of on or our so that the their them then there they this to us was we what when will with you your").split(" "));

function stolenPhrase(value) {
  const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const source = norm(EXAMPLE_TEXT);
  const grams = new Set();
  const N = 6;   // five caught 'we will tell you so', which is just English
  for (let i = 0; i + N <= source.length; i++) grams.add(source.slice(i, i + N).join(" "));
  const theirs = norm(value);
  for (let i = 0; i + N <= theirs.length; i++) {
    const window = theirs.slice(i, i + N);
    // A run made entirely of function words is a coincidence of English, not a
    // lift. Only flag it when real content words came across with it.
    if (window.filter((w) => !COMMON.has(w)).length < 2) continue;
    const g = window.join(" ");
    if (grams.has(g)) return g;
  }
  return null;
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const arg = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i > -1 && args[i + 1] ? args[i + 1] : fallback;
  };

  const lead = {
    business_name: arg("business", "Halloway Roofing"),
    trade: arg("trade", "roofing contractor"),
    town: arg("town", "Stockport"),
    areas: arg("town", "Stockport"),
    website_status: "OUTDATED",
  };

  const { corePrompt, sectionsPrompt, expandShortCopy, slopFound } = extractFromBuilder(
    ["corePrompt", "sectionsPrompt", "ownerBlock", "lengthExample", "expandShortCopy",
     "setAtPath", "slopFound"]);

  console.log(`checking copy length for a ${lead.trade} in ${lead.town}\n`);

  const [core, sections] = await Promise.all([
    generateJson(corePrompt(lead)),
    generateJson(sectionsPrompt(lead)),
  ]);
  console.log(`core copy via     ${core.via}`);
  console.log(`section copy via  ${sections.via}\n`);

  // Same shallow merge the builder does, enough for the fields we check.
  const merged = { ...core.data, ...sections.data,
    copy: { ...(core.data.copy || {}), ...(sections.data.copy || {}) } };

  // The builder does not ship what the model first returns: anything too short
  // gets asked for again. Running that here means this test measures the page
  // the owner would actually receive.
  const rescue = await expandShortCopy(merged, lead);
  if (rescue.asked) {
    console.log(`second pass asked for ${rescue.asked.length} short field(s), ` +
      `improved ${rescue.expanded}` + (rescue.error ? ` (failed: ${rescue.error})` : ""));
    console.log();
  }

  let failed = 0;
  console.log("field                     words  sent  result");
  console.log("-".repeat(64));
  const stolen = [];
  for (const [path, label, minWords, minSentences] of CHECKS) {
    const value = dig(merged, path);
    const w = words(value), s = sentences(value);
    const lifted = stolenPhrase(value);
    const ok = w >= minWords && s >= minSentences && !lifted;
    if (!ok) failed++;
    if (lifted) stolen.push([label, lifted]);
    console.log(
      `${label.padEnd(24)} ${String(w).padStart(5)} ${String(s).padStart(5)}  ` +
      (value == null ? "MISSING"
        : lifted ? "COPIED THE EXAMPLE"
        : ok ? "ok" : `short (wants ${minWords}w ${minSentences}s)`));
  }
  if (stolen.length) {
    console.log("\ncopied straight from the example prompt:");
    for (const [label, phrase] of stolen) console.log(`  ${label}: "...${phrase}..."`);
  }

  const slop = slopFound(merged);
  console.log("-".repeat(64));
  console.log(slop.length
    ? `slop phrases found: ${slop.join(", ")}`
    : "slop check: clean");
  if (slop.length) failed++;

  const areas = merged.service_areas || [];
  console.log("-".repeat(64));
  console.log(`service areas returned: ${areas.length} ${areas.length >= 6 ? "ok" : "short (wants 6 to 8)"}`);
  if (areas.length) console.log(`  ${areas.join(", ")}`);
  if (areas.length < 6) failed++;

  const total = Object.values(merged.copy || {})
    .reduce((sum, v) => sum + (typeof v === "string" ? words(v)
      : typeof v === "object" && v ? Object.values(v).reduce((a, x) => a + words(x), 0) : 0), 0);
  console.log(`\ntotal words across copy fields: ${total}`);
  console.log(failed ? `\n${failed} field(s) still too short` : "\nevery field met its minimum");

  console.log("\n--- what the hero and closing actually say ---");
  console.log("hero:  " + dig(merged, "copy.hero.subheadline"));
  console.log("close: " + dig(merged, "copy.cta.body"));
  return failed ? 1 : 0;
}

main().then((code) => process.exit(code)).catch((error) => {
  console.error("\n" + error.message);
  process.exit(2);
});
