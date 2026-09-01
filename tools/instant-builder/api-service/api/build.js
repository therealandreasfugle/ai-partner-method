/**
 * /api/build
 *
 * Builds one client's site from scraped lead data and stores it, so a button in
 * the CRM can do the whole job with no script running on anybody's machine.
 *
 * This is the JavaScript port of generator/generate_site.py. The Python version
 * still exists for batch runs from a laptop; this one exists because a hosted
 * button cannot reach a laptop. The prompts, the validation rules and the
 * safety rules are deliberately identical in both.
 *
 * POST { lead: {...}, send?: boolean }
 *   -> { slug, siteUrl, proposalUrl, emailed }
 *
 * FREE MODELS ONLY. Groq first, Gemini as fallback. No paid provider is read.
 */

const SITE_BASE = process.env.SITE_BASE || "https://aipm-instant-site.vercel.app";
const PROPOSAL_BASE = process.env.PROPOSAL_BASE || "https://aipm-instant-proposal.vercel.app";
/* The address the CRM sends from. It is the one domain that is fully set up,
   and it is what appears on screen when the send is done in front of a room. */
const DEMO_SEND_DOMAIN = process.env.DEMO_SEND_DOMAIN || "settoku.app";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/* ---------------------------------------------------------------- constants */

const LEGAL_SUFFIXES = [
  "incorporated", "corporation", "limited", "ltd", "ltd.", "inc", "inc.",
  "llc", "l.l.c.", "llp", "plc", "pty", "pty.", "co.", "company",
  "gmbh", "bv", "nv", "srl", "sa", "ag",
];

/**
 * Trade to photo set. Ordered most specific first.
 *
 * The catch-all is `retail` rather than `roofing`: a pet groomer, dentist or
 * accountant landing on roofing photos is obviously wrong, whereas the retail
 * set is neutral enough to pass for most service businesses. Falling back to a
 * trade-specific set was a real bug, not a cosmetic one.
 */
// Order is load-bearing: the first pattern that matches wins, so the narrow
// trades sit above the broad ones. Written against the 68 real categories in
// the lead sheet, and every one of them was checked by hand against this list.
// Traps that are deliberately avoided:
//   "garage" would send a garage door supplier to the car photos
//   "electric" under plumbing would put an electrician in a bathroom
//   "contractor" above plumbing would send an HVAC contractor to a building site
//   "law" would match "lawn care", so it is bounded
//   "pet" would match "carpet", so cleaning is tested first and pet is bounded
//   "dent" would match "independent", so it needs the whole word
const TRADE_PATTERNS = [
  ["roofing", /roof|slate|gutter|chimney|fascia|soffit|cladding|shingle/i],
  ["motorcycle", /motorcycle|motorbike|scooter|moped|\batv\b|quad bike|powersport/i],
  ["auto", /auto|car detail|vehicle|mechanic|body ?shop|tyre|tire|windscreen|windshield|\btruck\b|trailer|towing|car leasing|\brv\b|diesel engine|motor ?home|caravan dealer/i],
  // HVAC ahead of plumbing and with its own bucket: it has its own template
  // and its own photo needs, and left inside plumbing an air conditioning
  // firm was being sold a plumber's website.
  ["hvac", /hvac|air ?condition|\bac repair\b|ventilat|furnace|ductwork|climate control|refrigerat|chiller/i],
  ["plumbing", /plumb|boiler|heating|drain|bathroom|septic|water heater|gas engineer|central heating/i],
  ["energy", /solar|photovoltaic|ev charg|heat pump|insulation|renewable|energy efficien|battery storage|energy suppl|gas compan|\bcoal\b|solid fuel|fuel suppl|oil suppl/i],
  ["tattoo", /tattoo|piercing|body art/i],
  ["care", /home care|senior care|elderly care|caregiv|care home|assisted living|nursing home|in.home care|home health|live.in care|mobility (aid|equipment)|hearing aid/i],
  // Split out of "health" on 2026-08-12. One shared set meant a dentist's
  // page carried a photo of a massage, which an owner spots instantly.
  // Dental first, then hands-on wellness, then general medical.
  ["dental", /dentist|dental|orthodont|denture|endodont|periodont|hygienist|implant|invisalign|braces|teeth whit/i],
  ["wellness", /chiroprac|physio|massage|osteopath|acupunc|podiat|reflexolog|sports therap|wellness|\bspa\b|beauty clinic|aesthetic/i],
  ["health", /medical|clinic|optic|health|therapist|therapy|pharmac|mammograph|nursing agency|contact lens|x.?ray|radiolog|doctor|\bgp\b|veterinar|\bvet\b/i],
  ["beauty", /salon|barber|hairdress|\bhair\b|nail|beauty|lash|brow|aesthetic|tanning|makeup|waxing/i],
  ["arts", /music (school|lesson|instructor|teacher|college|conservator)|dance (school|class|studio|instructor|company|hall)|art (school|studio|gallery|class|centre|center|dealer|museum)|musical instrument|drama school|\bacting\b|choir|ballet|pottery|craft (school|workshop)/i],
  ["fitness", /\bgym\b|fitness|martial|jiu|karate|boxing|yoga|pilates|crossfit|self defen|parkour|personal train/i],
  ["laundry", /laundr|dry clean|launderette|tailor|alteration|seamstress|garment|ironing/i],
  ["professional", /\blaw\b|law firm|lawyer|legal|solicitor|attorney|account|\btax\b|bookkeep|financial|insurance|notary|architect|surveyor|life coach|business coach|recruit|consultant|consulting|logistics|currency exchange|money transfer|telecom|bureau de change/i],
  ["property", /estate agent|real estate|realtor|letting agent|lettings|property management|mortgage|conveyanc|apartment rental|holiday rental|property rental/i],
  ["education", /tutor|tuition|driving (school|instructor|test)|nursery|childcare|child care|day ?care|preschool|kindergarten|academy|language school|training cent/i],
  ["photography", /photograph|photo studio|videograph|photo ?booth|video production|video editing|film production|portrait studio|photo agency/i],
  ["food", /restaurant|cafe|coffee|bakery|baker\b|\bbar\b|\bpub\b|takeaway|take.?out|food truck|\bdeli\b|pizzer|pizza|diner|bistro|cater|brewery|winery|distiller|butcher|grocer/i],
  ["events", /wedding|event plan|party hire|party rental|party plan|\bdj\b|banquet|venue hire|marquee|balloon|event manage|costume/i],
  ["hospitality", /hotel|motel|hostel|bed and breakfast|guest ?house|holiday let|campsite|caravan park|\binn\b|resort/i],
  ["travel", /travel agen|tour agen|tour operator|sightseeing|excursion|safari|cruise|whale watching|tourist inform|\btours?\b/i],
  ["transport", /taxi|minicab|private hire|chauffeur|limousine|\blimo\b|coach (company|hire|charter)|bus (company|charter|service|tour)|airport transfer|shuttle|school bus|ambulance/i],
  ["funeral", /funeral|crematori|undertaker|cremation|memorial service|casket|coffin/i],
  ["farm", /\bfarm|agricultur|equestrian|stable|livestock|dairy|poultry|orchard|vineyard|apiar|horse (riding|boarding|breed|train|rental)|\btractor\b|egg suppl|agistment|bonsai|plant nursery/i],
  ["grounds", /landscap|lawn|garden|\btree\b|arborist|hedge|turf|paving|patio|pressure wash|power wash|grounds/i],
  ["leisure", /golf|bowling|arcade|escape room|climbing|paintball|laser tag|shooting range|archery|ski (school|rental|club|repair)|surf school|trampoline|adventure park|go.?kart|amusement|snooker|pool hall|karaoke|casino|nightclub/i],
  ["marine", /\bboat|marine|yacht|marina|sailing|kayak|canoe|scuba|dive (shop|club|centre|center)|fishing charter|jet ski|watercraft/i],
  ["pool", /\bpool\b|swimming pool|hot tub|jacuzzi/i],
  ["cleaning", /clean|janitor|\bmaid\b|pest control|hygiene|sanit|housekeep/i],
  ["pet", /\bpet\b|groom|\bdog\b|\bcat\b|veterin|kennel|cattery|animal/i],
  ["removals", /removal|moving company|movers|man and van|junk|rubbish|waste|skip hire|hauling|courier|self storage|storage unit|relocat|recycl|\bscrap\b/i],
  ["security", /locksmith|alarm|cctv|surveillance|security system|access control|fire protection|fire extinguisher/i],
  ["repair", /appliance|computer repair|laptop repair|phone repair|mobile repair|screen repair|electronics repair|printer repair|small engine|mower repair|watch repair|shoe repair|luggage repair|clock|washing machine|dishwasher|fridge|freezer|oven repair|tumble dryer|white goods|sewing machine|lamp repair|vacuum repair/i],
  ["metalwork", /weld|metal fabricat|fabricat|machining|machinist|\bsteel\b|foundry|blacksmith|sheet metal|\bcnc\b|metal work|metal suppl|metal finish|metal polish|engineering works/i],
  ["stone", /stonemason|stone mason|\bstone\b|granite|marble|quartz|worktop|monument|headstone|stone carv|stone cut/i],
  ["interiors", /furniture|upholster|interior design|fitted wardrobe|kitchen fitter|kitchen showroom|curtain|blinds\b|carpet (suppl|fitter|install|manufactur|wholesal)|\brug\b|mattress|sofa|cabinet maker|awning/i],
  ["glass", /glazier|glazing|\bglass\b|window install|window suppl|window tint|window film|conservatory|double glaz/i],
  ["signage", /sign shop|signage|sign ?writer|printing|print shop|printer|embroidery|banner|vinyl wrap|screen print|engraving/i],
  ["tech", /it support|it services|computer|software|web design|web develop|marketing|digital agency|\bseo\b|managed service|network|cyber|app develop/i],
  ["trades", /contractor|construct|builder|building|handy|paint|carpent|joiner|electric|fenc|excavat|renovat|remodel|garage ?door|home improvement|materials|gravel|restoration|utility|flooring|tiler|scaffold|driveway|decking|tool (rental|hire)|plant hire|equipment suppl|industrial|machinery|abrasive|bearing suppl|pipe suppl|packaging|concrete|sandblast|retaining wall|welding suppl/i],
  ["retail", /florist|flower|boutique|\bshop\b|\bstore\b|\bmarket\b|gift|jewel|antique|\bbook|\btoy|bicycle|\bbike\b/i],
];
// Neutral fallback: a friendly owner, a counter, a handshake. Nothing that reads
// as one trade. Falling back to the florist set put flowers on junk removal.
const FALLBACK_TRADE_SET = "local";

// Trades that travel to the customer need the job address. Everyone else needs
// to know roughly where the customer is, and nothing more.
const ADDRESS_LABEL = {
  motorcycle: "Town or area",
  marine: "Town or area",
  farm: "Property address",
  glass: "Property address",
  interiors: "Property address",
  stone: "Property address",
  arts: "Town or area",
  leisure: "Town or area",
  travel: "Town or area",
  transport: "Pick-up address",
  funeral: "Town or area",
  metalwork: "Town or area",
  roofing: "Property address", plumbing: "Property address", trades: "Property address",
  grounds: "Property address", cleaning: "Property address", energy: "Property address",
  pool: "Property address", removals: "Property address", security: "Property address",
  repair: "Property address", care: "Property address", events: "Event address",
  auto: "Town or area", health: "Town or area", fitness: "Town or area",
  beauty: "Town or area", professional: "Town or area", pet: "Town or area",
  retail: "Town or area", food: "Town or area", tattoo: "Town or area",
  laundry: "Town or area", property: "Town or area", education: "Town or area",
  photography: "Town or area", hospitality: "Town or area", signage: "Town or area",
  tech: "Town or area", local: "Town or area",
};

const PALETTE = {
  primary: "#1E3A5F", primary_dark: "#15293F", primary_slate: "#2C4660",
  accent: "#E8821E", accent_light: "#F4A94C", accent_dark: "#C26A12",
  neutral: "#F5F3EF", neutral_dim: "#E4E0D8", silver: "#9AA3AD", ink: "#1A1F26",
};

const TYPOGRAPHY = {
  heading: "Oswald",
  body: "Plus Jakarta Sans",
  headingFontUrl: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap",
  bodyFontUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
};

// Identity of the template's baseline client, scrubbed from every build.
const BASELINE_TOKENS = {
  "Ashworth Roofing": "COMPANY",
  "Ashworth": "SHORTNAME",
  "Greater Manchester": "REGION",
  "Manchester": "TOWN",
  "0161 496 0142": "PHONE",
  "ashworthroofing.co.uk": "DOMAIN",
};

/* ------------------------------------------------------------------ helpers */

function displayName(raw) {
  let name = String(raw || "").replace(/\s+/g, " ").trim().replace(/^[\s,\-&]+|[\s,\-&]+$/g, "");
  if (!name) return "";
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of LEGAL_SUFFIXES) {
      const pattern = new RegExp("[\\s,]+" + suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
      const candidate = name.replace(pattern, "").replace(/^[\s,\-&]+|[\s,\-&]+$/g, "");
      if (candidate && candidate.toLowerCase() !== name.toLowerCase() && candidate.length > 2) {
        name = candidate;
        changed = true;
        break;
      }
    }
  }
  return name.replace(/^[\s,.\-&]+|[\s,.\-&]+$/g, "") || String(raw || "").trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .toLowerCase().replace(/-{2,}/g, "-") || "site";
}

/**
 * The business NAME counts as evidence, not just the scraped category.
 * "Summit Roofing" filed under the generic category "Contractor" is obviously a
 * roofer, and should get roofing photos rather than the neutral fallback.
 */
function tradeSetFor(trade, businessName) {
  const text = (String(trade || "") + " " + String(businessName || "")).toLowerCase();
  for (const [key, pattern] of TRADE_PATTERNS) if (pattern.test(text)) return key;
  return FALLBACK_TRADE_SET;
}

/**
 * Compares two secrets without leaking their contents through timing. Length is
 * compared first and separately, which is safe: the length of a shared secret is
 * not the part worth hiding.
 */
function timingSafeEqual(given, expected) {
  const a = String(given == null ? "" : given);
  const b = String(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Strips characters Brett bans everywhere, absorbing spaces around dashes. */
function scrub(value) {
  if (typeof value === "string") {
    return value
      .replace(/\s*[—–]\s*/g, ", ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
  }
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = scrub(v);
    return out;
  }
  return value;
}

function deepMerge(base, incoming) {
  for (const [key, value] of Object.entries(incoming || {})) {
    if (value && typeof value === "object" && !Array.isArray(value) &&
        base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
      deepMerge(base[key], value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

/**
 * Thins out em dashes and en dashes rather than banning them.
 *
 * A dash used once in a paragraph is good writing. Used in every other
 * sentence it is the clearest tell that a machine wrote the page, and the free
 * models reach for one constantly. So there is a budget: a few across the
 * whole site, only in real prose, and everything past that becomes a comma.
 *
 * Headlines, buttons and labels never keep one. They are short, they are the
 * first thing read, and a dash in them always looks like filler.
 *
 * This also used to be enforced by throwing the whole generated site away and
 * building another, which was the single biggest cause of a build failing: one
 * punctuation mark, twenty seconds of work discarded, and on a bad run an
 * error in front of an audience.
 */
const DASH_BUDGET = 3;      // kept dashes allowed across one site
const DASH_MIN_PROSE = 70;  // shorter than this is a headline or a label

function easeDashes(config) {
  const DASHES = /[\u2014\u2013]/;
  let kept = 0;

  const tidy = (text) => text
    .replace(/,\s*,+/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*([.!?;:])/g, "$1")
    .replace(/,\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const fix = (text) => {
    if (!DASHES.test(text)) return text;

    // A range is read aloud as "to", whatever the budget says.
    let out = text.replace(/(\d)\s*[\u2014\u2013]\s*(\d)/g, "$1 to $2");
    if (!DASHES.test(out)) return tidy(out);

    const isProse = out.length >= DASH_MIN_PROSE;
    let allowance = isProse && kept < DASH_BUDGET ? 1 : 0;
    if (allowance) kept++;

    out = out.replace(/\s*[\u2014\u2013]\s*/g, () => {
      if (allowance > 0) { allowance--; return "\u2014"; }
      return ", ";
    });
    return tidy(out);
  };

  const walk = (value) => {
    if (typeof value === "string") return fix(value);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === "object") {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = walk(v);
      return out;
    }
    return value;
  };

  return walk(config);
}

function deleak(value, replacements) {
  if (typeof value === "string") {
    let out = value;
    for (const [token, key] of Object.entries(BASELINE_TOKENS)) {
      if (out.includes(token)) out = out.split(token).join(replacements[key] || "");
    }
    return out;
  }
  if (Array.isArray(value)) return value.map((v) => deleak(v, replacements));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = deleak(v, replacements);
    return out;
  }
  return value;
}

/* --------------------------------------------------------------------- LLM */

/** Mistral's free tier. OpenAI-shaped, so this is Groq's caller with a different host. */
async function callMistral(prompt, key, model) {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "User-Agent": BROWSER_UA,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    }),
  });
  if (!response.ok) throw new Error(`${response.status}: ${(await response.text()).slice(0, 90)}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGroq(prompt, key, model) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // Groq sits behind Cloudflare, which rejects unusual agents with an
      // opaque "error code: 1010".
      "User-Agent": BROWSER_UA,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    }),
  });
  if (!response.ok) throw new Error(`${response.status}: ${(await response.text()).slice(0, 90)}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt, key, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.5 },
    }),
  });
  if (!response.ok) throw new Error(`${response.status}: ${(await response.text()).slice(0, 90)}`);
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callOpenRouter(prompt, key, model) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    }),
  });
  if (!response.ok) throw new Error(`${response.status}: ${(await response.text()).slice(0, 90)}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Every key we hold for a provider, not just one.
 *
 * This is the half of the protection that was missing. Several models across
 * several providers stops one PROVIDER going down from breaking a build, but a
 * single exhausted key still burned that whole provider. Free tiers are capped
 * per key, so more keys is the only thing that actually raises the ceiling.
 *
 *   GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3 ...
 *   GEMINI_API_KEY, GEMINI_API_KEY_2 ...
 *   OPENROUTER_API_KEY, OPENROUTER_API_KEY_2 ...
 */
function keysFor(provider) {
  const base = { groq: "GROQ_API_KEY", gemini: "GEMINI_API_KEY", openrouter: "OPENROUTER_API_KEY", mistral: "MISTRAL_API_KEY" }[provider];
  const keys = [];
  if (process.env[base]) keys.push(process.env[base]);
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`${base}_${i}`];
    if (k) keys.push(k);
  }
  return keys;
}

const MODEL_CASCADE = [
  ["groq", "llama-3.3-70b-versatile"],
  ["groq", "llama-3.1-8b-instant"],
  ["gemini", "gemini-2.5-flash"],
  ["gemini", "gemini-2.5-flash-lite"],
  ["mistral", "mistral-small-latest"],
  ["mistral", "open-mistral-nemo"],
  ["openrouter", "openai/gpt-oss-20b:free"],
  ["openrouter", "google/gemma-4-31b-it:free"],
  ["openrouter", "nvidia/nemotron-3-super-120b-a12b:free"],
  ["openrouter", "openrouter/free"],
];

const CALLERS = {
  groq: callGroq, gemini: callGemini, openrouter: callOpenRouter, mistral: callMistral,
};

/**
 * Tries every key against every model until one returns usable JSON.
 *
 * The starting key rotates per call so load spreads across keys instead of
 * always hammering the first one until it dies.
 */
let keyCursor = 0;

async function generateJson(prompt) {
  const attempts = [];
  keyCursor += 1;

  for (const [provider, model] of MODEL_CASCADE) {
    const keys = keysFor(provider);
    if (!keys.length) { attempts.push(`${provider}: no key`); continue; }

    for (let offset = 0; offset < keys.length; offset++) {
      const index = (keyCursor + offset) % keys.length;
      try {
        let text = await CALLERS[provider](prompt, keys[index], model);
        text = String(text).trim().replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim();
        return JSON.parse(text);
      } catch (error) {
        attempts.push(`${provider}/${model}#${index + 1}: ${String(error.message).slice(0, 70)}`);
      }
    }
  }
  throw new Error("every free key on every model failed: " + attempts.join(" | "));
}

/* ----------------------------------------------------------------- prompts */

function ownerBlock(lead) {
  return `WE HAVE NOT SPOKEN TO THIS OWNER. Everything below came from their
public Google listing, so do NOT write anything as if they said it, and do not
invent quotes, opinions or history.

  Their current web presence: ${lead.website_status || "unknown"}

Work from what is typically true for a ${lead.trade} in ${lead.town}: the jobs of
that trade worth the most, what customers of that trade normally worry about
before booking, and why people pick one over another. Write it as our confident
view of what this business should be saying, not as a report of what they said.`;
}

/**
 * The house copywriting standard, lifted from the skills Brett actually uses:
 * Ogilvy on promise and specificity, the conversion-copywriting skill on
 * structure and CTAs, and stop-slop on the tells that make writing read as
 * machine-made. It sits in front of both prompts so the model is briefed the
 * same way a copywriter would be, rather than being told "write good copy".
 *
 * The blunt "avoid X" lists are here because free models default to every one
 * of them. Naming the failure is what stops it.
 */
const COPY_DOCTRINE = `HOW TO WRITE THIS, THE HOUSE STANDARD

ONE PROMISE, DELIVERED FULLY
  Every section makes ONE promise and earns it. A promise is a specific benefit
  the customer receives, never a slogan and never a feature. "Your roof stops
  leaking this week" is a promise. "Quality workmanship" is noise. Most websites
  promise nothing at all, which is why they sell nothing.

FACTS SELL, ADJECTIVES DO NOT
  Praise words prove nothing: great, amazing, leading, trusted, professional,
  premium, exceptional, dedicated, passionate. Cut every one and put a concrete
  fact in its place. What you do, in what order, to what standard, by when.
  The more specific the copy, the more it sells. Assume the reader is clever
  and is only asking one thing: what do I get, and can I believe you.

WRITE TO ONE PERSON
  Speak to the customer as "you", about their problem, from their side of it.
  Never "our company prides itself". They do not care about the company yet.
  Name who this is for and where they are, so the right reader knows it is them.

SENTENCES
  Vary the length. Some short. Then one that runs a little longer because it is
  carrying a real detail the reader needs. Every word earns its place, and if
  you could cut a fifth of it and lose nothing, you have not written it yet.

THINGS THAT MAKE COPY READ AS MACHINE-WRITTEN. NEVER DO THESE.
  - Throat clearing: "Here's the thing", "It turns out", "The truth is",
    "At the end of the day", "In today's world".
  - The reversal: "not just X, but Y" and "this isn't about X, it's about Y".
    Say the thing you mean and stop.
  - Hedging: "it is worth noting", "it is important to remember", "there are a
    number of ways", "we understand that".
  - Adverbs and softeners: really, truly, deeply, simply, basically, seamlessly,
    effortlessly, incredibly.
  - Passive voice that hides who acted. Somebody did it, say who.
  - Objects doing human things. "The system allows you to book" is "You book".
  - Three-item lists of abstractions. Quality, service, value is not a sentence.

CALLS TO ACTION
  Verb first, and name what happens next. "Book a free survey", "Get your quote
  today". Never "Submit", "Learn more", "Click here", "Get started".

HARD RULES
  - Any example inside this spec shows LENGTH AND SHAPE ONLY. Never reuse its
    words. If a sentence you write could sit on the example business's own
    website, it is wrong, delete it and write theirs. Examples are a ruler, not
    a script.
  - Never invent reviews, testimonials, customer names, ratings, years in
    business, number of jobs, awards or statistics. You do not know them.
  - No em dashes, no en dashes, no emoji, no curly quotes. Plain ASCII only.
  - British plain English, how a tradesperson actually speaks.
  - Every headline must be specific to this trade and town, never generic.`;


/**
 * BRAND EXTRACTION
 *
 * Pulls a business's brand off their existing website: their colours, their
 * logo and their photographs. Times every step, so the cost of adding this to
 * a build is a measured number rather than a guess.
 *
 * No API keys and no paid services: it is one page fetch and at most two
 * stylesheets. The whole point is that it is cheap enough to run on every lead
 * that has a site worth reading.
 */

const BRAND_UA =
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
function brand_isNeutral([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max > 238 && min > 238) return true;            // white
  if (max < 34) return true;                          // black
  return max - min < 26;                              // grey
}

function brand_toRgb(value) {
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

const brand_hex = ([r, g, b]) =>
  "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");

async function brand_get(url, ms = 8000) {
  const stop = AbortSignal.timeout(ms);
  const res = await fetch(url, { headers: { "user-agent": BRAND_UA }, signal: stop, redirect: "follow" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.text();
}

async function readBrand(site) {
  const t0 = Date.now();
  const timing = {};
  const url = site.startsWith("http") ? site : "https://" + site;
  const origin = new URL(url).origin;

  let html;
  try {
    html = await brand_get(url);
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
      const rgb = brand_toRgb(raw);
      if (!rgb || brand_isNeutral(rgb)) continue;
      const key = brand_hex(rgb);
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
    try { tally(await brand_get(sheet, 6000), 1); } catch { /* a missing sheet is not fatal */ }
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



/**
 * The form's qualifying questions and the chat assistant's answers.
 *
 * Built in code rather than asked for from the model. Asking for them made
 * every generation longer and pushed the whole build past its time limit, and
 * they are formulaic anyway: what the customer wants, how soon, and when to
 * ring them. The services the model DID write carry the trade-specific part.
 *
 * Nothing here invents a price, an opening time or a policy. Where a real
 * answer depends on facts we were never given, it says how they will find out,
 * which is both honest and the thing that gets the phone to ring.
 */
function askingQuestions(config, lead) {
  const services = (config.services || []).map((s) => s.name).filter(Boolean);
  const questions = [];

  if (services.length >= 2) {
    questions.push({ label: "What do you need?", options: services.slice(0, 5) });
  }
  questions.push({
    label: "How soon do you need it?",
    options: ["As soon as possible", "This week", "This month", "Just planning"],
  });
  questions.push({
    label: "Best time to call you",
    options: ["Morning", "Afternoon", "Evening", "Any time"],
  });
  return questions.slice(0, 3);
}

function chatAnswers(config, lead) {
  const town = (config._display && config._display.town) || lead.town || "your area";
  const phone = (config._display && config._display.phone) || lead.phone || "";
  const services = (config.services || []).map((s) => s.name).filter(Boolean);
  const trade = String(lead.trade || "work").toLowerCase();
  const callThem = phone
    ? `The quickest way is a quick call on ${phone}.`
    : "Leave your number in the form and we will come straight back to you.";

  return [
    {
      ask: "How much does it cost?",
      match: ["price", "cost", "how much", "quote", "charge", "fee", "rate"],
      answer: `It depends on the job, so we will not guess at it. Tell us what you need and we will give you a straight figure with no obligation. ${callThem}`,
    },
    {
      ask: "What are your opening hours?",
      match: ["open", "hours", "time", "when", "closed", "today"],
      answer: `Our hours are on our Google listing, which is always the version that is up to date. ${callThem}`,
    },
    {
      ask: services.length
        ? `Do you do ${services[0].toLowerCase()}?`
        : `What ${trade} work do you do?`,
      match: ["do you do", "service", "offer", "can you", "help with"],
      answer: services.length
        ? `Yes. We cover ${services.slice(0, 4).join(", ")}. Tell us what you are after and we will confirm we are the right people for it.`
        : `We cover most ${trade} work. Tell us what you need and we will say honestly whether it is something we do.`,
    },
    {
      ask: `Do you cover ${town}?`,
      match: ["where", "area", "cover", "come to", "travel", "based", "local"],
      answer: `Yes, ${town} is right in our patch, and we cover the surrounding areas too. Tell us where you are and we will confirm.`,
    },
  ];
}

/**
 * Which of the template library's designs each trade gets.
 *
 * Every one of these was built for its own industry, so a dentist stops being
 * handed a roofer's dark trade site. The keys are the trade buckets from
 * TRADE_PATTERNS; anything not named here falls back to the Summit build,
 * which is the right answer for the trades that make up most of the list.
 *
 * The library lives at TEMPLATE_BASE and reads the client's config from the
 * same store this builder writes to.
 */
const TEMPLATE_BASE = process.env.TEMPLATE_BASE || "https://aipm-templates.vercel.app";

const TRADE_TEMPLATES = {
  hvac: "hvac-management",
  plumbing: "plumbing-services",

  /* The muscle trades, added 2026-08-21. These six used to fall through to the
     Summit build, which is the right character for them but is the one site in
     the estate without the opt-in card and the assistant on it. An electrician
     was getting a visibly different page from every other lead in the same
     batch. Plumbing is the closest match among the templates that carry the
     kit: dark, direct, built around an urgent call-out and a quote.
     If Summit is ever fitted with the kit, these should go back to it. */
  trades: "plumbing-services",
  /* Roofing deliberately has NO entry: it falls through to the Summit build,
     which was designed for roofers and carries its own enquiry form and its
     own assistant. An earlier note here claimed Summit had neither, which was
     simply wrong: it does, under its own class names, and its chat is the one
     the templates copied in the first place. */
  repair: "plumbing-services",
  metalwork: "plumbing-services",
  stone: "plumbing-services",
  glass: "plumbing-services",
  energy: "hvac-management",
  grounds: "landscaping-services",
  dental: "dental-practice",
  wellness: "med-spa",
  beauty: "med-spa",
  tattoo: "med-spa",
  health: "wellness-center",
  care: "wellness-center",
  fitness: "wellness-center",
  pet: "wellness-center",
  auto: "auto-detailing",
  motorcycle: "auto-detailing",
  food: "coffee-shop",
  hospitality: "boutique-hotel",
  events: "boutique-hotel",
  leisure: "boutique-hotel",
  travel: "travel-agency",
  property: "real-estate-agency",
  professional: "real-estate-agency",   // solicitors and accountants want gravitas
  education: "natural-skincare",        // nurseries and childcare: warm, not corporate
  tech: "ai-consulting",
  photography: "creative-portfolio",
  arts: "creative-portfolio",
  retail: "product-showcase",

  /* Moved off the Summit build 2026-08-13. Summit is heavy, dark and built for
     muscle trades, which is right for a roofer and wrong for these: a funeral
     director needs restraint, a pool company sells a garden, a sign maker is
     selling design work. Each of these reads better in a design already built
     for that feeling. */
  funeral: "real-estate-agency",     // sober, gold on grey, the only one with gravitas
  interiors: "boutique-hotel",       // interiors is design-led, so an editorial build suits it
  pool: "landscaping-services",      // a pool is sold the same way a garden is
  farm: "landscaping-services",      // outdoor, green, open air
  transport: "auto-detailing",       // vehicles, and it is already the vehicle design
  removals: "auto-detailing",
  marine: "auto-detailing",          // boatyards sell servicing, same shape as a garage
  cleaning: "natural-skincare",      // cleaning sells fresh and spotless, not grit
  laundry: "natural-skincare",
  security: "ai-consulting",         // alarms and cameras are a technical, protective sell
  signage: "creative-portfolio",     // sign makers are selling design
};

/** The site URL for a build, and the template it will be dressed in. */
function templateFor(trade) {
  const name = TRADE_TEMPLATES[trade];
  return name ? { name, base: `${TEMPLATE_BASE}/templates/${name}/` } : null;
}

/**
 * Worked examples of the LENGTH the long copy fields need.
 *
 * Telling a model "24 to 34 words" does not work: it writes two four-word
 * sentences and calls it done. Showing it a real sentence of the right size
 * does work. The catch is that a roofing example handed to a roofer comes back
 * almost verbatim, so every roofer's site would carry the same lines.
 *
 * So there are two sets and we hand over the one that does NOT match the trade
 * being written. A dentist's sentences are useless to copy onto a roofing site,
 * which leaves the model with the length and none of the words.
 */
const LENGTH_EXAMPLES = {
  roofing: {
    trade: "roofer",
    sub: "Owner-led crews, honest estimates, and a clean job site. Get a free inspection from a roofer who actually climbs up there.",
    cta: "Book a free inspection today. We will tell you the truth about your roof, even if the truth is that you do not need us yet.",
    founder: "He started the company after years of watching homeowners get burned by storm chasers who blow into town, slap on a roof and disappear. He built it to be the opposite: local, accountable, and up on the roof himself for every estimate.",
  },
  dental: {
    trade: "dentist",
    sub: "Evening appointments, prices agreed before anything starts, and a dentist who explains what they are doing. Book a check-up with someone who will not talk you into work you do not need.",
    cta: "Book your first appointment today. If your teeth are fine we will tell you so and send you home, because we would rather have you back in six months than sell you something now.",
    founder: "She set the practice up after years of watching patients put off a check-up because they were scared of the bill more than the drill. Everything here is built around removing that: the price is agreed first, the plan is explained in plain words, and nothing starts until you say so.",
  },
};

/** The example set furthest from what we are writing, so nothing is copyable. */
function lengthExample(lead) {
  const trade = String(lead.trade || "").toLowerCase();
  const dentalish = /dent|ortho|hygien|smile|teeth|clinic|medical|doctor|vet/.test(trade);
  return dentalish ? LENGTH_EXAMPLES.roofing : LENGTH_EXAMPLES.dental;
}

function corePrompt(lead) {
  const eg = lengthExample(lead);
  return `You are writing the copy for a local business website. Return ONLY valid JSON.

THE BUSINESS
  Name: ${lead.business_name}
  Trade: ${lead.trade}
  Main town: ${lead.town}

${ownerBlock(lead)}

${COPY_DOCTRINE}

RETURN EXACTLY THIS JSON SHAPE, no extra keys, no commentary:
{
  "meta": { "title": "under 60 chars, business name plus trade plus town",
            "description": "under 155 chars" },
  "company": { "name": "${lead.business_name}", "shortName": "one or two words",
               "tagline": "under 8 words, concrete not fluffy",
               "description": "2 sentences about what they do and who for",
               "serviceRegion": "the area covered" },
  "copy": {
    "hero": { "eyebrow": "SHORT UPPERCASE AREA LINE",
              "headline": "under 12 words, ALL CAPS. A PROMISE ABOUT THE CUSTOMER'S LIFE, NOT A LIST OF SERVICES. 'A ROOF THAT OUTLASTS THE NEXT STORM' not 'ROOF REPAIRS AND INSTALLATIONS'",
              "subheadline": "2 sentences, 28 to 36 words. A ${eg.trade}'s, shown ONLY so you can see the length: '${eg.sub}' You write for a ${lead.trade}, so none of those words apply. The FIRST sentence must name THREE specific things this business does or gives, not two. The SECOND is one promise the customer can picture. Vague verbs like provide, offer, deliver a range of, are a fail",
              "imageAlt": "describes the hero photo" },
    "heroTrustChips": ["3 short proof chips, 2 to 4 words each"],
    "trustClaims": ["4 short claims, 3 to 6 words each"],
    "formHeader": "under 6 words",
    "formSubtext": "EXACTLY 2 short sentences: what to tell us, then what we do next",
    "buttonText": "under 4 words", "footerCta": "1 sentence",
    "cta": { "label": "SHORT UPPERCASE", "heading": "under 10 words",
             "body": "2 sentences, 28 to 34 words. A ${eg.trade}'s, shown ONLY for length: '${eg.cta}' Yours is about ${lead.trade} work and shares no phrasing with it. Ask for the enquiry, then GIVE SOMETHING UP: name the case where they should not buy, or what you will tell them for free. Without that second half it reads like every other website" },
    "founder": { "label": "SHORT UPPERCASE", "heading": "under 10 words",
                 "para1": "3 sentences, 50 to 65 words. A ${eg.trade}'s, shown ONLY for length: '${eg.founder}' Write the equivalent for a ${lead.trade}, sharing no phrasing with it. Name the thing customers of this trade get burned by, then how this business is built the other way round. Never invent a name, a number of years, or history you were not given",
                 "para2": "3 sentences, 45 to 60 words. What the customer actually gets, in the same register: who turns up, what they will not do to you, what happens when something goes wrong. Concrete things, never adjectives",
                 "vision": "1 sentence", "mission": "1 sentence" }
  },
  "services": [ { "slug": "kebab-case", "name": "2 to 4 words", "body": "2 sentences" } ],
  "why_choose_us": ["6 items, each one short sentence"],
  "process_steps": [ { "n": 1, "title": "2 to 3 words", "body": "1 sentence" } ],
  "faq": [ { "q": "a real question this trade gets asked", "a": "2 to 3 sentences" } ],
  "special_offers": [ { "label": "under 5 words", "description": "1 sentence, no invented discounts" } ],
  "previous_projects": [ { "alt": "describes a typical job photo", "category": "1 to 2 words" } ]
}

COUNTS: exactly 4 services, 6 why_choose_us, 4 process_steps, 6 faq,
2 special_offers, 4 previous_projects, 3 heroTrustChips, 4 trustClaims.

LENGTH MATTERS. Where a field asks for 2 sentences, write 2 real sentences.
One clipped line in every slot makes a finished page look like a draft, and the
owner reads that as us not bothering. Say the second thing you would say if you
were stood in their yard explaining it.`;
}

function sectionsPrompt(lead) {
  return `You are writing section headings and secondary page copy for a local
business website. Return ONLY valid JSON.

  Business: ${lead.business_name}
  Trade: ${lead.trade}
  Town: ${lead.town}
  Areas covered: ${lead.areas || lead.town}

${COPY_DOCTRINE}
  - If this business is not a roofer, the words roof, slate, gutter and chimney
    must not appear anywhere.

EVERY HEADING IS A SENTENCE SOMEONE WOULD SAY, NEVER A LABEL.
A label names the section. A heading says something. Asking for "under 8 words"
produced "Roofing Services", "Roofing Gallery", "Roofing Questions", which read
like a sitemap and make the whole page feel automated. Write what the section
argues, in the owner's voice, about THIS town and THIS trade.

  services   NOT "Roofing Services"      -> "Roofing done right the first time"
  whyChoose  NOT "Why Choose Us"         -> "The roofer your neighbour told you about"
  gallery    NOT "Roofing Gallery"       -> "Roofs we are proud to put our name on"
  reviews    NOT "Our Reviews"           -> "${lead.town} talks, we listen"
  faq        NOT "Roofing Questions"     -> "The things people ask us most"
  offers     NOT "Roofing Offers"        -> "Free drone roof inspection"
  blog       NOT "Roofing Tips"          -> "Straight talk from the roof"
  serviceAreas NOT "Roofing ${lead.town}" -> "Roofing across the whole valley"

Those examples are a roofer's. Write the equivalent for a ${lead.trade}. Never
reuse the example wording, and never open a heading with the trade name.

RETURN EXACTLY THIS SHAPE:
{
  "copy": {
    "submitButton": "under 4 words",
    "privacyLine": "EXACTLY 2 short sentences of reassurance about their details",
    "mobileCallLabel": "under 3 words", "copyright": "the business name",
    "services": { "heading": "under 8 words", "body": "2 sentences" },
    "whyChoose": { "label": "SHORT UPPERCASE", "heading": "under 9 words" },
    "gallery": { "heading": "under 9 words", "body": "2 sentences" },
    "process": { "body": "2 sentences", "badgeText": "2 to 3 words" },
    "offers": { "heading": "under 8 words", "detail": "1 sentence" },
    "reviews": { "heading": "under 7 words" },
    "faq": { "label": "SHORT UPPERCASE", "heading": "under 8 words" },
    "blog": { "label": "SHORT UPPERCASE", "heading": "under 8 words", "body": "2 sentences" },
    "serviceAreas": { "heading": "trade plus area, under 8 words", "body": "2 sentences" },
    "serviceAreaCard": { "heading": "under 7 words", "body": "1 sentence" }
  },
  "service_areas": ["6 to 8 REAL towns, villages or districts near ${lead.town} that a ${lead.trade} there would genuinely cover. Real place names only, nearest first, and include ${lead.town} itself"],
  "blog_posts": [ { "slug": "kebab-case", "title": "a useful article title",
                    "category": "1 to 2 words", "excerpt": "1 sentence",
                    "body": "3 short paragraphs separated by \\n\\n" } ],
  "pages": {
    "about": { "heroLabel": "About plus business name", "heroHeadline": "under 10 words",
               "storyHeading": "under 7 words", "storyClosing": "1 sentence",
               "crewHeading": "under 7 words", "crewBody": "2 sentences",
               "crewCaption": "1 short caption", "valuesIntro": "1 sentence",
               "values": [ { "title": "2 to 3 words", "text": "1 sentence" } ] },
    "serviceAreas": { "mapHeading": "under 7 words", "mapBody": "1 sentence",
                      "citiesFallback": "1 short sentence", "readyHeading": "under 7 words",
                      "readyBody": "1 sentence",
                      "coverageHighlights": [ { "title": "an area name", "body": "1 sentence" } ] }
  }
}

COUNTS: exactly 2 blog_posts, 3 pages.about.values, 3 coverageHighlights.`;
}

/* ------------------------------------------------------------ deterministic */

function composeConfig(lead, generated) {
  const config = { ...generated };
  const trade = tradeSetFor(lead.trade, lead.business_name);
  const slug = slugify(displayName(lead.business_name));

  // Shared photo set rather than a per-client copy: nothing can be written to
  // disk from a serverless function, and the photos are identical per trade.
  config.assets = { base: `/trades/${trade}` };
  config.palette = PALETTE;
  config.typography = TYPOGRAPHY;

  // Whose address the enquiry form should ask for. A roofer needs to know which
  // house to go to; a gym asking a new member for their "property address" reads
  // as a form built for somebody else's business. Decided here rather than by
  // the model, because it is a fact about the trade, not a judgement.
  config.copy = { ...(config.copy || {}), addressLabel: ADDRESS_LABEL[trade] || "Town or area" };

  const phone = String(lead.phone || "").trim();
  config.contact = {
    phone,
    phoneTelLink: phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "",
    email: String(lead.email || "").trim(),
    googleMapsUrl: lead.google_maps_url || null,
    mapsEmbedUrl: null,
  };

  const street = String(lead.address || "").trim();
  const town = String(lead.town || "").trim();
  const postcode = String(lead.postal_code || "").trim();
  const parts = street ? [street] : [];
  for (const extra of [town, postcode]) {
    if (extra && !street.toLowerCase().includes(extra.toLowerCase())) parts.push(extra);
  }
  config.address = {
    street, city: town, state: String(lead.region || ""), zip: postcode,
    full: parts.join(", ") || town, lat: null, lng: null,
  };

  // A scraped listing gives us one town, so left alone this section renders a
  // single tile and reads like the page ran out of content. The model returns a
  // list of real neighbouring places; anything it gives us is merged after the
  // town we know is right, deduped, and capped at what the grid lays out cleanly.
  const knownAreas = String(lead.areas || town).split(/[,\n/]+/)
    .map((a) => a.trim()).filter(Boolean);
  const modelAreas = Array.isArray(config.service_areas)
    ? config.service_areas.map((a) => String(a || "").trim()).filter(Boolean)
    : [];
  const seenAreas = new Set();
  config.serviceAreas = [...knownAreas, ...modelAreas]
    .filter((area) => {
      const key = area.toLowerCase();
      if (seenAreas.has(key)) return false;
      seenAreas.add(key);
      return true;
    })
    .slice(0, 9);
  delete config.service_areas;

  // No owner name on 99% of scraped listings, so never depend on one.
  const shortName = (config.company && config.company.shortName) || displayName(lead.business_name);
  // The founder badge shows their real Google rating when we have one, because
  // that is a true number about them and the strongest thing to put there. With
  // no rating it carries the trade instead. It is never a made up "15 years",
  // which is a claim they could check and we would be wrong about.
  const badgeRating = Number(lead.rating || 0);
  const hasBadgeRating = badgeRating > 0 && badgeRating <= 5;
  config.team = {
    founder: {
      name: shortName, displayName: shortName, title: shortName,
      yearsExp: hasBadgeRating ? badgeRating.toFixed(1) : "",
      expLabel: hasBadgeRating
        ? `rated by ${parseInt(lead.reviews || 0, 10) || "your"} customers`
        : `${String(lead.trade || "work").toLowerCase()} in ${town || "your area"}`,
    },
    founders: [],
  };

  const rating = Number(lead.rating || 0);
  const count = parseInt(lead.reviews || 0, 10) || 0;
  config.reviews = {
    rating: rating > 0 && rating <= 5 ? rating : 0,
    googleCount: count, facebookCount: 0, totalReviewCount: count,
    googleLabel: "Google", facebookLabel: "Facebook",
    googleStat: rating && count ? `${rating.toFixed(1)} from ${count} reviews` : "",
    // Their real Google numbers, shown once. Never an invented Facebook count:
    // a fake review total is a claim about their business, not a placeholder.
    facebookStat: rating && count ? `${count} reviews` : "",
    items: [],   // never fabricated
  };

  if (lead.facebook || lead.instagram) {
    config.social = { facebook: lead.facebook || null, facebookReviews: null };
  }

  // Each photo set ships exactly four work images, so the list is trimmed to
  // four and the filenames assigned by position. The model is asked for four but
  // has returned six, and the extras came through with no filename at all, which
  // rendered as a request for "work/undefined" and a 404 on the page.
  config.previous_projects = (config.previous_projects || [])
    .slice(0, 4)
    .map((project, index) => ({ ...project, filename: `project-${index + 1}.webp` }));

  // Badge images we do not ship. Any value here renders as a broken image.
  config.trust_badges = [];
  config.press_logos = [];
  config.credit = { agency: lead.agency_name || "", url: null };

  return { config, slug, trade };
}

function addDisplayFields(config, lead) {
  const rating = Number(config.reviews?.rating || 0);
  const count = Number(config.reviews?.totalReviewCount || 0);
  config._display = {
    name: displayName(config.company?.name || lead.business_name),
    town: String(lead.town || ""),
    phone: String(lead.phone || ""),
    address: config.address?.full || "",
    streetOnly: String(lead.address || ""),
    postcode: String(lead.postal_code || ""),
    mapsUrl: String(lead.google_maps_url || ""),
    websiteStatus: String(lead.website_status || ""),
    website: String(lead.website || ""),
    facebook: String(lead.facebook || ""),
    instagram: String(lead.instagram || ""),
    reviewLine: rating && count ? `${rating.toFixed(1)} from ${count} Google reviews` : "",
  };
  return config;
}

/* ------------------------------------------------------- copy length rescue */

/**
 * The fields a visitor actually reads, and the shortest they may be.
 *
 * These are the ones that made the early sites feel empty. Everything else on
 * the page is a heading or a label, where short is correct.
 */
const MIN_COPY = [
  ["copy.hero.subheadline", 20, "the line under the big headline"],
  ["copy.cta.body", 20, "the closing paragraph above the last form"],
  ["copy.founder.para1", 25, "the first paragraph of the owner's story"],
  ["copy.founder.para2", 25, "the second paragraph of the owner's story"],
  ["copy.services.body", 12, "the line under the services heading"],
  ["copy.gallery.body", 12, "the line under the gallery heading"],
  ["copy.serviceAreas.body", 12, "the line under the areas heading"],
];

const atPath = (obj, path) =>
  path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

function setAtPath(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const parent = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
  parent[last] = value;
}

const countWords = (t) => String(t || "").trim().split(/\s+/).filter(Boolean).length;

/**
 * The phrases the doctrine bans, as patterns, so a page can be measured rather
 * than eyeballed. Telling a model not to write "we pride ourselves" works most
 * of the time; this catches the rest before an owner reads it.
 */
const SLOP = [
  [/\bnot just\b[^.]{0,40}\bbut\b/i, "the 'not just X but Y' reversal"],
  [/\bthis is ?n[o']t about\b/i, "the 'this isn't about X' reversal"],
  [/\bwe pride ourselves\b/i, "we pride ourselves"],
  [/\bhere'?s the thing\b/i, "here's the thing"],
  [/\bat the end of the day\b/i, "at the end of the day"],
  [/\bin today'?s (world|market|climate)\b/i, "in today's world"],
  [/\bit is worth noting\b|\bit'?s worth noting\b/i, "it's worth noting"],
  [/\bwe understand that\b/i, "we understand that"],
  [/\b(unparalleled|unrivalled|world[- ]class|cutting[- ]edge|state[- ]of[- ]the[- ]art)\b/i,
    "empty superlative"],
  [/\b(seamless(ly)?|effortless(ly)?|hassle[- ]free)\b/i, "seamless/effortless"],
  [/\bquality,? service,? and value\b/i, "quality, service and value"],
  [/\bstrive to\b|\bstriving to\b/i, "strive to"],
];

/** Every slop phrase found anywhere in the page copy. */
function slopFound(config) {
  const text = JSON.stringify(config.copy || {}) + JSON.stringify(config.services || []) +
    JSON.stringify(config.why_choose_us || []) + JSON.stringify(config.faq || []);
  return SLOP.filter(([pattern]) => pattern.test(text)).map(([, name]) => name);
}

/**
 * Asks again for any field that came back too short.
 *
 * Prompting alone could not carry this. Told to write 28 to 36 words, a free
 * model writes 14 and stops, and it varies by trade and by which model in the
 * cascade answered, so a roofer would come out full and a florist thin. That is
 * exactly the kind of thing that belongs in code rather than in a hope.
 *
 * One extra call, only when something is short, naming the offending fields and
 * quoting what they said back at them. If the retry is still short we keep
 * whichever version is longer, so this can improve the page but never damage it.
 */
async function expandShortCopy(config, lead) {
  /** Which phrase from the ban list, if any, is sitting in this string. */
  const slopIn = (text) => {
    const hit = SLOP.find(([pattern]) => pattern.test(String(text || "")));
    return hit ? hit[1] : null;
  };

  const bad = MIN_COPY
    .map(([path, min, what]) => {
      const text = atPath(config, path);
      const tooShort = countWords(text) < min;
      const slop = slopIn(text);
      return { path, min, what, text, tooShort, slop };
    })
    .filter((f) => f.tooShort || f.slop);
  if (!bad.length) return { expanded: 0, fields: [] };

  const asks = bad.map((f) => {
    const fault = f.tooShort
      ? `only ${countWords(f.text)} words, needs at least ${f.min}`
      : `contains "${f.slop}", which is banned`;
    return `  "${f.path}": currently "${String(f.text || "").trim()}" (${fault}). This is ${f.what}.`;
  }).join("\n");

  const prompt = `You wrote copy for ${lead.business_name}, a ${lead.trade} in ${lead.town}.
Some of it is not good enough to put in front of the owner.

${asks}

Rewrite ONLY those fields. Keep the meaning and the voice. Where it is too
short, do not pad with adjectives: add the SECOND real thing you would say out
loud about it, a specific detail of the work, what the customer gets, or what
you will not do to them. Where a banned phrase is flagged, say the same thing
plainly without it.

${COPY_DOCTRINE}

Return ONLY a JSON object whose keys are exactly the paths listed above, and
whose values are the rewritten strings. No commentary.`;

  let reply;
  try {
    reply = await generateJson(prompt);
  } catch (error) {
    // The page is still shippable with short copy, so a failure here is not
    // worth failing the whole build over.
    return { expanded: 0, fields: [], error: String(error.message).slice(0, 120) };
  }

  const fixed = [];
  for (const field of bad) {
    const candidate = reply[field.path];
    if (typeof candidate !== "string" || !candidate.trim()) continue;

    // Take the rewrite only when it is genuinely better. For a short field that
    // means longer; for a slop field it means the phrase is actually gone and
    // nothing was lost. A retry that fails both is a worse answer, not a new
    // one, so the original stands.
    const better = field.tooShort
      ? countWords(candidate) > countWords(field.text)
      : !slopIn(candidate) && countWords(candidate) >= countWords(field.text) * 0.8;
    if (!better) continue;

    setAtPath(config, field.path, candidate.trim());
    fixed.push(field.path);
  }
  return { expanded: fixed.length, fields: fixed, asked: bad.map((f) => f.path) };
}

/** Refuses to ship anything broken, exactly as the Python version does. */
function checkOutput(config, lead) {
  const problems = [];
  const blob = JSON.stringify(config);

  /* Dashes are no longer a reason to throw a site away. easeDashes has already
     thinned them to a small budget before this runs, so the only thing worth
     failing on is a page that came back riddled with them anyway, which means
     the thinning did not run at all. */
  const dashCount = (blob.match(/[—–]/g) || []).length;
  if (dashCount > DASH_BUDGET) {
    problems.push(`dashes not thinned: ${dashCount} present`);
  }

  // The demo client is a roofer in Manchester, so "Manchester" is one of the
  // tokens this guard hunts for. That made every genuine Manchester business
  // fail: their own town read as the demo client bleeding through, and a UK
  // webinar would have rejected every site on stage. A token is only a leak
  // when it is NOT part of this lead's own identity.
  const own = [lead.business_name, lead.town, lead.region, lead.address]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  for (const token of Object.keys(BASELINE_TOKENS)) {
    const needle = token.toLowerCase();
    if (own.includes(needle)) continue;
    if (blob.toLowerCase().includes(needle)) {
      problems.push(`baseline identity leaked: ${token}`);
    }
  }
  if (tradeSetFor(lead.trade, lead.business_name) !== "roofing") {
    const ownName = String(lead.business_name || "").toLowerCase();
    /* Only words that can mean nothing but roofing.

       "slate" and "chimney" used to be on this list and were rejecting honest
       copy: a tiler lays slate, a stonemason rebuilds a chimney, a flooring
       firm sells slate. The site was thrown away and rebuilt over a word that
       was correct for the trade. The three left cannot be innocent. */
    for (const word of ["roofing", "roofer", "re-roof"]) {
      // A roofing word inside the business's own name is not a leak.
      if (ownName.includes(word)) continue;
      if (new RegExp("\\b" + word, "i").test(blob)) {
        problems.push(`roofing language on a ${lead.trade} site: '${word}'`);
        break;
      }
    }
  }
  for (const [key, expected] of [["services", 4], ["why_choose_us", 6], ["faq", 6], ["process_steps", 4]]) {
    if ((config[key] || []).length < expected) {
      problems.push(`${key}: expected ${expected}, got ${(config[key] || []).length}`);
    }
  }
  if (!config.company?.name) problems.push("company.name missing");
  if (config.reviews?.items?.length) problems.push("reviews were fabricated");
  if (config.trust_badges?.length) problems.push("trust_badges must be empty");
  return problems;
}


/**
 * A slug that cannot quietly overwrite a different business.
 *
 * The slug was the business name and nothing else, so "Smith Plumbing" in
 * Oldham and "Smith Plumbing" in Leeds produced the same one. The second build
 * did not create a duplicate, it replaced the first: its site, its proposal
 * and its record. Silent data loss, and the link already emailed to the first
 * business would then show the second business's page.
 *
 * The name alone is still used whenever it is free or already belongs to this
 * same business, so every link ever sent keeps working. The town is only added
 * when the name is genuinely taken by somebody else.
 */
async function uniqueSlug(base, lead) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return base;

  const sameBusiness = (row) => {
    const cfg = row.config || {};
    const display = cfg._display || {};
    const town = String(display.town || "").trim().toLowerCase();
    const phone = String(display.phone || "").replace(/[^\d]/g, "");
    const myTown = String(lead.town || "").trim().toLowerCase();
    const myPhone = String(lead.phone || "").replace(/[^\d]/g, "");
    // Same phone is the same business wherever it says it is. Same town and
    // same name is the same business too.
    if (myPhone && phone) return myPhone === phone;
    return !!myTown && myTown === town;
  };

  try {
    const res = await fetch(
      `${url}/rest/v1/sites?slug=eq.${encodeURIComponent(base)}&select=slug,config&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return base;
    const rows = await res.json();
    if (!rows.length) return base;          // nobody has it
    if (sameBusiness(rows[0])) return base; // it is this same business again

    // Taken by somebody else, so say where this one is.
    const town = slugify(String(lead.town || "").trim());
    const withTown = town ? `${base}-${town}` : `${base}-2`;

    const second = await fetch(
      `${url}/rest/v1/sites?slug=eq.${encodeURIComponent(withTown)}&select=slug,config&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(4000) }
    );
    if (second.ok) {
      const also = await second.json();
      // Two of the same name in the same town: rare, but it must still not
      // overwrite, so the phone number breaks the tie.
      if (also.length && !sameBusiness(also[0])) {
        const tail = String(lead.phone || "").replace(/[^\d]/g, "").slice(-4);
        return tail ? `${withTown}-${tail}` : `${withTown}-2`;
      }
    }
    return withTown;
  } catch {
    /* If the check cannot run, the old behaviour stands rather than inventing
       a slug that later builds will not agree with. */
    return base;
  }
}

/* ---------------------------------------------------------------- storage */

async function storeSite(slug, business, config, email) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase env not configured");
  const response = await fetch(`${url}/rest/v1/sites`, {
    method: "POST",
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([{ slug, business, config, email: email || null }]),
  });
  if (!response.ok) throw new Error(`store ${response.status}: ${(await response.text()).slice(0, 200)}`);
}

/* -------------------------------------------------------------------- email */

/**
 * The observation line, mirroring the proposal's ladder. Turns a real fact from
 * the scrape into an argument, or returns "" rather than something weak.
 */
function observationLine(config) {
  const display = config._display || {};
  const town = display.town || "";
  const where = town ? ` in ${town}` : " in your area";
  const status = (display.websiteStatus || "").toLowerCase();
  const rating = Number(config.reviews?.rating || 0);
  const count = Number(config.reviews?.totalReviewCount || 0);

  if (status.includes("no website") || status === "none") {
    return `You do not have a website yet, so when somebody${where} searches for what you do, they find whoever does.`;
  }
  if (rating >= 4 && count >= 10) {
    return `You are on ${rating.toFixed(1)} stars from ${count} Google reviews${where}. The people who find you already trust you. The question is how many never find you at all.`;
  }
  if (rating >= 4 && count > 0) {
    return `You are on ${rating.toFixed(1)} stars, but from only ${count} ${count === 1 ? "review" : "reviews"}. The businesses booked solid${where} are not better than you, they just have more proof.`;
  }
  if (count === 0) {
    return `You have no Google reviews yet, and that is quietly costing you work${where}.`;
  }
  return town ? `Somebody${where} is searching for what you do today.` : "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/**
 * The outreach email, and the short version for SMS or a DM.
 *
 * Plain text, one link, no images, no tracking.
 *
 * TWO kinds of variation, and both matter:
 *   1. Wording. At 100 sends a day, identical emails get reported. Every line
 *      rotates, keyed off the business, so no two leads read the same.
 *   2. ANGLE. Every local business is bombarded by people selling websites. An
 *      email that opens "I built you a website" is filed with the rest before
 *      it is read. So most angles below lead on a growth problem the owner
 *      already feels (lost enquiries, slow replies, wasted reviews, competitors
 *      taking the work) and treat the site as the proof, not the pitch.
 *
 * The link always points at the PROPOSAL, not the site. The site is embedded in
 * the proposal, so that page shows the work AND what it costs, in one click.
 */

const SUBJECTS = [
  "could you let me know by EOD?", "quick one, when you get a sec",
  "is this alright?", "had a look at this for you", "wanted to run this past you",
  "does this look right to you?", "worth a look?", "two minutes?",
  "thought of you", "have you got a minute?", "what do you reckon?",
  "before I forget", "let me know what you think", "sending this over",
  "put this together for you", "any thoughts?", "one for you",
  "meant to send this earlier", "when you get five minutes", "does this work?",
  "am I right here?", "worth your time?", "your call on this one",
  "have a look at this", "curious what you think", "small thing",
  "not urgent, but worth a look", "quick favour", "this any use to you?",
  "tell me if I'm wrong here", "had this on my list for you",
  "would this be useful?", "let me know either way", "when you have a minute",
  "something I put together", "does this make sense?", "checking with you first",
  "wanted your opinion", "quick sanity check", "you might want to see this",
  "does this look about right?", "sorry, one more thing", "just this one",
  "worth trying?", "shout if this is no good", "thought this might help",
  "for whenever you get a chance", "is this something you'd want?",
  "no rush on this", "keen to hear what you think", "hope this is useful",
  "spotted something", "one thing worth checking", "if you get a spare minute",
  "would value your take", "made a start on this", "quick thought",
  "does this land?", "worth ten seconds?", "wanted to check something",
  "having a look at this", "let me know if I'm off",
];

/**
 * Each angle is a different reason the owner is losing work. The website is
 * mentioned in only two of them, on purpose.
 */
function angles(business, town, where, rating, count, noSite) {
  const list = [];
  const here = town ? ` in ${town}` : "";

  list.push({
    key: "speed",
    hook: `Someone fills in a form for ${business} at 8pm. What happens?`,
    cost: `For most places, nothing till morning. By then they've rung two other people.`,
  });

  list.push({
    key: "leak",
    hook: `You're probably losing more work to slow replies than to price.`,
    cost: `The enquiry sits, they book someone else, and it just looks like a quiet week.`,
  });

  if (rating >= 4 && count >= 10) {
    list.push({
      key: "reviews",
      hook: `${count} reviews at ${rating.toFixed(1)} stars. That's the hard part done.`,
      // Every cost line has to name what it actually costs them. This one used
      // to stop at "how few people see it", which states a fact and leaves the
      // reader to work out why it matters. They ring someone else: say that.
      cost: `Trouble is most people searching never scroll far enough to find you, so they ring whoever came up first.`,
    });
    list.push({
      key: "reputation",
      hook: `You've got a better reputation than the lot outranking you${where}.`,
      cost: `Being the best in town is worth nothing if you're the third name they see.`,
    });
  }

  list.push({
    key: "repeat",
    hook: `Your old customers are the cheapest work you'll ever get.`,
    cost: `No follow up, no review asked for, no reason for them to send a mate your way.`,
  });

  list.push({
    key: "cost",
    hook: `How many separate tools are you paying for every month?`,
    cost: `Website here, booking there, something for email. It adds up and none of it talks.`,
  });

  list.push({
    key: "consistency",
    hook: `How different is a good month from a bad one for ${business}?`,
    cost: `If it swings hard, that's not marketing. That's nothing running underneath.`,
  });

  list.push({
    key: "competitor",
    hook: `The ones booked solid${where} aren't better at the job than you.`,
    cost: `They're just easier to find in the five seconds before someone picks.`,
  });

  if (noSite) {
    list.push({
      key: "nosite",
      hook: `Went looking for ${business} and there's no website to land on.`,
      cost: `So everyone searching${where} right now lands on a competitor instead.`,
    });
  } else {
    list.push({
      key: "site",
      hook: `Had a look at how ${business} shows up online.`,
      cost: `Most people searching for what you do are seeing someone else first.`,
    });
  }

  return list;
}


/**
 * Deterministic variation. Picks one item from a list using a seed string, so
 * the same business always reads the same email but two businesses rarely read
 * the same one. At a hundred sends a day identical copy gets reported, and a
 * random pick would change the wording every time the same lead was rebuilt.
 */
function rotate(list, seed) {
  if (!list || !list.length) return "";
  // FNV-1a with a final avalanche. A plain multiply-and-add hash clustered
  // badly on short lists: five real business names landed on two of four
  // options, so a third of the copy never shipped.
  let hash = 0x811c9dc5;
  const text = String(seed || "");
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b) >>> 0;
  hash ^= hash >>> 13;
  return list[(hash >>> 0) % list.length];
}

const SYSTEM_LINES = [
  "It's not just the site. Enquiries get chased, finished jobs turn into reviews, one bill instead of four.",
  "One system instead of four subscriptions, and it chases every enquiry for you.",
  "Website, follow up and reviews in one thing, so it's one bill and it actually joins up.",
  "Every enquiry gets chased till it books or says no. Every finished job asks for a review.",
];

const HONESTY = [
  "Built it off your Google listing, so some of it'll be wrong. Tell me what.",
  "Details came off Google. Shout if anything's out of date.",
  "It's all from your Google listing, so tell me what I got wrong.",
];

/**
 * Every close asks for a ONE WORD reply, and asks for it explicitly.
 *
 * Two reasons, and they point the same way. A one word ask is the smallest
 * commitment a busy owner can make, so more of them make it. And a reply is the
 * strongest signal a mailbox provider can see: it is the one thing that cannot
 * be faked at scale, so it is what builds a young sending domain faster than
 * anything else. The conversion goal and the deliverability goal are the same
 * goal here, which is why every close names the word it wants back.
 */
const CLOSES = [
  'Worth a look? Yes or no is fine.',
  'One word back, "yes" or "no".',
  'Reply "yes" if you want it set up properly. "No" and I\'ll leave it.',
  'Worth two minutes? Just say yes or no.',
  '"Keen" or "nope", either does the job.',
  'Yes or no and I\'ll know either way.',
];

/**
 * The whole sentence becomes the link, so it is impossible to skim past. It
 * also carries the "I built you one" meaning on its own: that used to be a
 * separate sentence directly above, which meant every email said it twice.
 */
const LINK_SENTENCES = [
  "So I built you a new site to show what I mean, have a look",
  "Easier to show you, so I built the site already, here it is",
  "I built you a site with the follow up wired into it, it's here",
  "So I built it rather than explain it, the site's here",
];

function composeEmail(config, siteUrl, proposalUrl, agency) {
  const display = config._display || {};
  const business = display.name || config.company.name;
  const town = display.town || "";
  const where = town ? ` in ${town}` : " near you";
  const status = (display.websiteStatus || "").toLowerCase();
  const rating = Number(config.reviews?.rating || 0);
  const count = Number(config.reviews?.totalReviewCount || 0);
  const noSite = status.includes("no website") || status === "none";

  const sender = (process.env.SENDER_NAME || "Dan").trim();
  const company = (agency || "").trim();
  const senderPhone = (process.env.SENDER_PHONE || "").trim();
  const senderSite = (process.env.SENDER_SITE || "").trim();

  const seed = business + town;
  const subject = rotate(SUBJECTS, seed);
  const angle = rotate(angles(business, town, where, rating, count, noSite), seed + "a");
  const system = rotate(SYSTEM_LINES, seed + "s");
  const honesty = rotate(HONESTY, seed + "h");
  const close = rotate(CLOSES, seed + "x");
  const linkText = rotate(LINK_SENTENCES, seed + "l");
  const optOut = "Say the word and I won't message again.";

  // Proof of a real person WITHOUT a hyperlink. A bare domain in a sentence
  // reads as an aside, adds no second link for a filter to weigh, and lets
  // anyone suspicious go and check for themselves.
  const proof = senderSite
    ? `If you want to check I'm a real person and not a bot, my site is ${senderSite}.`
    : "";

  const sigLines = [sender, company, senderPhone].filter(Boolean);

  const text = [
    "Hi,", "", angle.hook, "", angle.cost, "",
    `${linkText}: ${proposalUrl}`, "", system, "", honesty, "", close, "",
    ...(proof ? [proof, ""] : []),
    ...sigLines, "", "Sent from my iPhone", "", optOut,
  ].join("\n");

  const para = (t) => `<p style="margin:0 0 14px">${escapeHtml(t)}</p>`;
  // The whole sentence is the link, so it is impossible to miss. A two word
  // anchor gets skimmed straight past.
  const linkHtml =
    `<p style="margin:0 0 14px"><a href="${escapeHtml(proposalUrl)}">` +
    `${escapeHtml(linkText)}</a>.</p>`;
  const sigHtml = sigLines.map((l) => `<div>${escapeHtml(l)}</div>`).join("");

  const html =
    `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;` +
    `font-size:15px;line-height:1.6;color:#222">` +
    para("Hi,") + para(angle.hook) + para(angle.cost) + linkHtml +
    para(system) + para(honesty) + para(close) +
    (proof ? para(proof) : "") +
    `<p style="margin:0 0 14px">${sigHtml}</p>` +
    para("Sent from my iPhone") + para(optOut) +
    `</div>`;

  // The DM and SMS version carries the same one word ask. It is the whole point
  // of the message, so it cannot be the thing that gets trimmed for length.
  const shortMessage = [
    angle.hook, angle.cost, `${linkText}: ${proposalUrl}`,
    honesty, close, `- ${sender}`,
  ].filter(Boolean).join("\n\n");

  return { subject, html, text, shortMessage, angle: angle.key };
}

/**
 * The sender pool.
 *
 * Cold outreach at volume needs several sending identities: a new domain that
 * suddenly sends 100 emails a day gets filtered, so each one is warmed by
 * starting on a low daily cap and raising it over weeks. Multiple accounts also
 * mean one domain getting burned does not stop the others.
 *
 * Configure with numbered env vars, as many as you like:
 *   RESEND_KEY_1   RESEND_FROM_1   RESEND_CAP_1
 *   RESEND_KEY_2   RESEND_FROM_2   RESEND_CAP_2
 *
 * The single RESEND_API_KEY / RESEND_FROM pair still works and becomes pool
 * entry one, so nothing breaks by adding this.
 */
/**
 * Daily allowance for an account, ramped if it is still warming up.
 *
 * A brand new sending domain has no reputation. Going straight to a hundred
 * cold emails a day from one is the fastest way to land permanently in spam,
 * and the damage is not undoable: the domain is spent. So an account may
 * declare RESEND_START_n as the date it started sending, and its allowance
 * climbs from five a day to its configured cap over about a fortnight.
 *
 * No start date means no ramp, which is right for an address that already has
 * history behind it.
 */
function warmedCap(cap, startDate) {
  if (!startDate) return cap;
  const started = Date.parse(startDate + "T00:00:00Z");
  if (Number.isNaN(started)) return cap;
  const days = Math.floor((Date.now() - started) / 86400000);
  if (days < 0) return 0;
  // Three on day one, then two more each day. Straight line, not a curve.
  // Compounding growth looks gentle for a week and then leaps: 22% a day was
  // still adding fifty in a single jump near the end. Adding two a day is a
  // change a mailbox provider never has to react to. Full ceiling lands around
  // week seven, which is the price of not gambling the domains.
  return Math.max(1, Math.min(cap, 3 + 2 * days));
}

function senderPool(settings = {}) {
  const pool = [];
  for (let i = 1; i <= 8; i++) {
    const key = process.env[`RESEND_KEY_${i}`];
    const from = process.env[`RESEND_FROM_${i}`];
    if (key && from) {
      const label = `pool-${i}`;
      const saved = settings[label] || {};
      // Switched off from the CRM means out of the rotation entirely.
      if (saved.enabled === false) continue;
      const cap = saved.daily_cap !== undefined && saved.daily_cap !== null
        ? Number(saved.daily_cap)
        : parseInt(process.env[`RESEND_CAP_${i}`] || "50", 10);
      const start = saved.warm_start !== undefined
        ? saved.warm_start
        : process.env[`RESEND_START_${i}`];
      pool.push({
        key, from,
        replyTo: process.env[`RESEND_REPLY_TO_${i}`] || null,
        cap: warmedCap(cap, start),
        label,
      });
    }
  }
  if (!pool.length && process.env.RESEND_API_KEY) {
    pool.push({
      key: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM || "Your Business <you@yourdomain.com>",
      replyTo: process.env.RESEND_REPLY_TO || null,
      cap: parseInt(process.env.RESEND_CAP || "100", 10),
      label: "default",
    });
  }
  return pool;
}

/**
 * How many each account has already sent today, read from our own log rather
 * than from Resend, so the count survives switching provider and needs no
 * extra API permission.
 */
async function todaysCounts() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return {};
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  try {
    const response = await fetch(
      `${url}/rest/v1/emails?select=sender&status=eq.sent&sent_at=gte.${since.toISOString()}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!response.ok) return {};
    const rows = await response.json();
    return rows.reduce((acc, r) => {
      const k = r.sender || "default";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

/**
 * Settings saved from the CRM, which override the environment.
 *
 * The KEYS always come from the environment and are never editable from a web
 * page. Only the things worth tuning week to week live here: whether an account
 * is sending at all, its daily ceiling, and the date its warm up started.
 * A failed read returns nothing and the environment values stand, so a database
 * blip can never silently stop the outreach.
 */
async function savedSenderSettings() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return {};
  try {
    const response = await fetch(`${url}/rest/v1/outreach_settings?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) return {};
    const rows = await response.json();
    return Object.fromEntries(rows.map((r) => [r.sender_key, r]));
  } catch {
    return {};
  }
}

/** The account with the most headroom today. Null when every cap is used up. */
/**
 * @param preferDomain  Send from this domain when it still has room today.
 *   The CRM's per-lead Send is the button pressed in front of an audience, and
 *   a rotation that lands on an unrelated domain puts a stranger's address on
 *   screen mid demo. Bulk outreach keeps rotating, since spreading volume is
 *   the whole point there. A capped-out preference falls back to the pool
 *   rather than failing the send.
 */
async function pickSender(preferDomain) {
  const [settings, counts] = await Promise.all([savedSenderSettings(), todaysCounts()]);
  const pool = senderPool(settings);
  if (!pool.length) return null;
  // Sends are logged under the full from address so the CRM can group them by
  // domain. Older rows were logged under the pool label, so both are counted:
  // reading only one of them made every account look unused, and the first
  // account in the pool took every send while the others stayed cold.
  const withRoom = pool
    .map((p) => ({ ...p, used: (counts[p.from] || 0) + (counts[p.label] || 0) }))
    .filter((p) => p.used < p.cap)
    .sort((a, b) => a.used / a.cap - b.used / b.cap);

  if (preferDomain) {
    const wanted = String(preferDomain).toLowerCase();
    const named = withRoom.find(
      (p) => String(p.from || "").toLowerCase().includes(wanted)
    );
    if (named) return named;
  }
  return withRoom[0] || null;
}

/** One recipient per call. No bcc, no batching, so a mistake cannot fan out. */
async function sendEmail(message, toEmail, preferDomain) {
  if (!toEmail || !toEmail.includes("@")) {
    return { status: "no valid recipient", sent: false };
  }
  if (!(await hasMailServer(toEmail))) {
    return { status: "that address cannot receive mail, so nothing was sent", sent: false };
  }
  const account = await pickSender(preferDomain);
  if (!account) {
    return { status: "every sending account has hit its daily cap", sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${account.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: account.from,
      to: [toEmail],
      reply_to: account.replyTo || undefined,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    return { status: `HTTP ${response.status}: ${body.slice(0, 140)}`, sent: false, sender: account.label };
  }
  let id = null;
  try { id = JSON.parse(body).id; } catch { /* optional */ }
  return { status: "sent", sent: true, id, sender: account.label, from: account.from };
}

/**
 * Does this address have any chance of being deliverable?
 *
 * Scraped addresses include typos and placeholders: "gmail.ca" for gmail.com,
 * and domains that never had a mail server. Every one of those is a guaranteed
 * bounce, and a bounce rate above about 2% is the fastest way to wreck a young
 * sending domain. Since all three senders are still warming, one careless batch
 * can undo weeks.
 *
 * Checked over DNS-over-HTTPS rather than node's dns module so it runs in any
 * runtime and needs no key. A lookup that fails for network reasons returns
 * true: a DNS wobble must not block every send.
 */
async function hasMailServer(email) {
  const address = String(email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(address)) return false;
  const domain = address.split("@").pop().toLowerCase();
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!response.ok) return true;
    const data = await response.json();
    if (Array.isArray(data.Answer) && data.Answer.some((a) => a.type === 15)) return true;
    // No MX is not always fatal: a domain with an A record can still accept
    // mail. Only treat it as dead when there is nothing at all to deliver to.
    const fallback = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!fallback.ok) return true;
    const aRecords = await fallback.json();
    return Array.isArray(aRecords.Answer) && aRecords.Answer.length > 0;
  } catch (error) {
    return true;
  }
}

/**
 * Every business the finder turns up is saved, built or not.
 *
 * Without this a run only existed in the page that made it: refresh and the
 * leads were gone, along with their phone numbers. Keyed on the slug so
 * rebuilding the same business updates its row rather than duplicating it.
 */
async function saveFoundLead(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    /* The row comes back so the permanent lead code can be handed to the CRM.
       lead_code is deliberately not sent: the database assigns one on first
       insert and the upsert leaves it alone afterwards, so a rebuild can never
       change a lead's identity. */
    const res = await fetch(`${url}/rest/v1/found_leads`, {
      method: "POST",
      headers: {
        apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) return null;
    const saved = await res.json();
    return saved && saved[0] ? saved[0] : null;
  } catch (error) {
    // Never fail a build because the record could not be filed.
    return null;
  }
}

/** Every send is recorded so the CRM can show it without anyone opening Resend. */
async function logEmail(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/emails`, {
    method: "POST",
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      "Content-Type": "application/json", Prefer: "return=minimal",
    },
    body: JSON.stringify([row]),
  }).catch(() => { /* a logging failure must never fail the build */ });
}

/**
 * The site as it was actually built, straight out of storage.
 *
 * Send used to rebuild the whole thing from scratch before mailing it, which
 * cost another twenty seconds of silence and, worse, rewrote the site the
 * person was looking at: same slug, freshly generated copy. On a live demo the
 * audience would watch the page change under them. Reading the stored config
 * back means the email points at exactly what was shown.
 */
async function loadSite(slug) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase env not configured");
  const response = await fetch(
    `${url}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}&select=slug,business,config,email&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!response.ok) throw new Error(`load ${response.status}`);
  const rows = await response.json();
  return rows[0] || null;
}

/**
 * Flip one lead to emailed without touching the rest of its record.
 *
 * It used to write the recipient's address onto the lead as well, which was
 * wrong: on a webinar you point the first send at your own inbox so the room
 * can watch it land, and that quietly replaced the real business's email with
 * yours. The address a message went to belongs on the email log, which already
 * records it, not on the business.
 */
async function markEmailed(slug) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/found_leads?slug=eq.${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: {
        apikey: key, Authorization: `Bearer ${key}`,
        "Content-Type": "application/json", Prefer: "return=minimal",
      },
      body: JSON.stringify({ emailed: true }),
    });
  } catch {
    // The send already happened. A bookkeeping failure must not report it failed.
  }
}

/* ------------------------------------------------------------------ handler */

export default async function handler(request, response) {
  // The browser sends an OPTIONS preflight before any cross-origin POST with a
  // JSON content type. Answering it with 405 makes the browser abort the whole
  // request as "Failed to fetch", which is what the CRM button was hitting.
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, x-build-secret");
  if (request.method === "OPTIONS") return response.status(204).end();

  if (request.method !== "POST") {
    return response.status(405).json({ error: "POST only" });
  }
  // Fail closed, both ways. This endpoint spends free LLM quota and can send
  // mail from the Resend accounts, so an unauthenticated caller could exhaust
  // the quota and burn the sending domains. A missing secret is a broken
  // deployment, not permission to serve everyone.
  const secret = process.env.BUILD_SECRET;
  if (!secret) {
    return response.status(503).json({ error: "builder is not configured" });
  }
  if (!timingSafeEqual(request.headers["x-build-secret"], secret)) {
    return response.status(401).json({ error: "unauthorised" });
  }

  /* ------------------------------------------------------- send what exists
     Mail a site that has already been built. No model call, no rebuild: the
     stored config is read back and the same email is composed from it, so what
     lands in the inbox links to the page that is open on screen. Roughly a
     second instead of twenty. */
  if (request.body && request.body.sendOnly === true) {
    const slug = String(request.body.slug || "").trim();
    const to = String(request.body.email || request.body.to || "").trim();
    if (!slug) return response.status(400).json({ error: "which site? no slug given" });
    if (!to) return response.status(400).json({ error: "no email address to send to" });

    let stored;
    try {
      stored = await loadSite(slug);
    } catch (error) {
      return response.status(502).json({ error: `could not read the site: ${error.message}` });
    }
    if (!stored || !stored.config) {
      return response.status(404).json({ error: "that site has not been built yet" });
    }

    const config = stored.config;
    const siteUrl = (config._demo && config._demo.siteUrl) || `${SITE_BASE}/?site=${slug}`;
    const proposalUrl = `${PROPOSAL_BASE}/proposal.html?site=${slug}`;
    const agency = (request.body.lead && request.body.lead.agency_name) ||
      process.env.AGENCY_NAME || "Jumpsky Ltd";
    const message = composeEmail(config, siteUrl, proposalUrl, agency);

    const delivery = await sendEmail(message, to, DEMO_SEND_DOMAIN);
    await logEmail({
      slug, business: stored.business || (config.company && config.company.name) || slug,
      to_email: to, subject: message.subject,
      body_html: message.html, body_text: message.text,
      site_url: siteUrl, proposal_url: proposalUrl,
      status: delivery.sent ? "sent" : "failed",
      sender: delivery.from || delivery.sender || null,
      provider_id: delivery.id || null,
      error: delivery.sent ? null : String(delivery.status).slice(0, 300),
    });
    if (delivery.sent) await markEmailed(slug);

    return response.status(200).json({
      slug, siteUrl, proposalUrl,
      business: stored.business || slug,
      emailed: delivery.sent,
      emailStatus: delivery.status,
      // Resend's id for this message, so the CRM can watch it be opened.
      emailId: delivery.id || null,
      subject: message.subject,
      emailHtml: message.html,
      emailText: message.text,
    });
  }

  const lead = (request.body && request.body.lead) || request.body || {};
  const normalised = {
    business_name: displayName(lead.business || lead.business_name || ""),
    trade: lead.category || lead.trade || "local business",
    town: lead.city || lead.town || "",
    areas: lead.areas || lead.city || lead.town || "",
    phone: lead.phone || "", email: lead.email || "",
    address: lead.address || "", postal_code: lead.postal_code || "",
    region: lead.region || "", google_maps_url: lead.google_maps_url || "",
    rating: lead.rating || "", reviews: lead.reviews || "",
    website: lead.website || "", website_status: lead.website_status || "",
    facebook: lead.facebook || "", instagram: lead.instagram || "",
    // Whose name goes in the site footer and the email sign off.
    agency_name: lead.agency_name || process.env.AGENCY_NAME || "Jumpsky Ltd",
  };

  if (!normalised.business_name) {
    return response.status(400).json({ error: "lead has no business name" });
  }

  /* One full attempt at a site: generate, rescue anything too short, clean it,
     then judge it. Returns the problems rather than throwing so the caller can
     decide whether to try again. */
  async function attemptBuild() {
    const [core, sections] = await Promise.all([
      generateJson(corePrompt(normalised)),
      generateJson(sectionsPrompt(normalised)),
    ]);

    const merged = deepMerge(scrub(core), scrub(sections));
    let { config, slug, trade } = composeConfig(normalised, merged);

    // Runs before deleak so anything it writes goes through the same scrub for
    // baseline-client names as the rest of the copy.
    const rescue = await expandShortCopy(config, normalised);

    config = deleak(config, {
      COMPANY: config.company.name,
      SHORTNAME: config.company.shortName || config.company.name,
      REGION: config.company.serviceRegion || normalised.town,
      TOWN: normalised.town,
      PHONE: normalised.phone,
      DOMAIN: `${slug}.example`,
    });

    /* Runs last, so anything the rescue pass or deleak introduced is cleaned
       too. checkOutput still tests for dashes afterwards: it is the net that
       proves this worked, not the thing doing the work. */
    config = easeDashes(config);

    return { config, slug, trade, rescue, problems: checkOutput(config, normalised) };
  }

  try {
    /* The quality gate is right to throw away weak copy, but giving up on the
       first refusal was wrong: the model is not deterministic, so the same
       lead that fails once usually passes on the next go. Failing outright in
       front of an audience to save fifteen seconds is a bad trade. */
    let attempt = await attemptBuild();
    let retried = false;
    let firstProblems = null;
    if (attempt.problems.length) {
      retried = true;
      // Kept so the reason a build needed a second go is countable later,
      // rather than being guessed at from how often it happens.
      firstProblems = attempt.problems.slice(0, 6);
      // The first was rejected, so the second stands whether it passes or not.
      attempt = await attemptBuild();
    }

    const { config: built, slug: baseSlug, trade, rescue } = attempt;
    let config = built;

    /* Resolved against what is already stored, so a business can never take
       over another one's site by sharing its name. */
    const slug = await uniqueSlug(baseSlug, normalised);

    if (attempt.problems.length) {
      return response.status(422).json({
        error: "generated site rejected", problems: attempt.problems, attempts: retried ? 2 : 1,
      });
    }

    config._generated = {
      lane: "free-api", source: "scrape", at: new Date().toISOString(),
      ...(retried ? { retried: true, retriedBecause: firstProblems } : {}),
      // Recorded so a thin page can be traced later: which fields came back
      // short and whether the second ask actually fixed them.
      ...(rescue.asked ? { shortCopy: rescue.asked, expanded: rescue.fields } : {}),
      // Not fatal, the page still sells, but worth being able to count how
      // often the doctrine is being ignored.
      ...(slopFound(config).length ? { slop: slopFound(config) } : {}),
    };
    config._demo = { proposalUrl: `${PROPOSAL_BASE}/proposal.html?site=${slug}` };
    addDisplayFields(config, normalised);

    /* The design this trade should be wearing. A dentist gets the clinical
       dental build, a hotel the editorial one, and anything without a template
       of its own stays on the Summit build, which suits the trades that make up
       most of the list. Recorded on the config so the page can say which
       design it is and so a bad match can be traced later. */
    const template = templateFor(trade);
    if (template) config._template = template.name;

    /* Which photo set dresses the page.
       A template ships its own photographs, and they are the wrong trade the
       moment it is reused: a barber was getting a med spa's treatment rooms
       because the med spa design suited him. The library has a set per trade,
       so the design stays and the pictures change. */
    config.photos = {
      set: trade,
      base: `${SITE_BASE}/trades/${trade}`,
    };

    /* What the form asks and what the assistant can answer. Written in code so
       they cost nothing and are identical in shape to the approved templates. */
    config.formQuestions = askingQuestions(config, normalised);
    config.chatAnswers = chatAnswers(config, normalised);

    /* Their brand, read off the site they already have. Costs about a second
       and a half and no API calls, so it runs for every lead with a site worth
       reading. A lead with no site, or a dead one, keeps the generated palette
       and the stock photography, which is the right answer for them anyway.
       Never allowed to fail a build: a site in our colours beats no site. */
    /* Whatever happens here is recorded on the config, including the reason it
       did not happen. Swallowed silently, a site that quietly stops picking up
       brands looks identical to one that never had the feature. */
    config._brandRead = { attempted: false };
    if (normalised.website && !/^(none|social)$/i.test(normalised.website_status || "")) {
      config._brandRead = { attempted: true, site: normalised.website };
      try {
        const brand = await readBrand(normalised.website);
        config._brandRead.ok = brand.ok;
        config._brandRead.ms = brand.ms;
        if (!brand.ok) config._brandRead.why = brand.why;
        if (brand.ok) {
          const trusted = (brand.colours || []).filter((c) => c.confident);
          config._brandRead.found = (brand.colours || []).length;
          config._brandRead.trusted = trusted.length;
          config.brand = {
            source: brand.origin,
            // Only colours we saw enough times to believe. A wrong brand colour
            // is worse than a good generated one.
            colours: trusted.map((c) => c.value),
            logo: brand.logo || null,
            photos: brand.photos || [],
            readMs: brand.ms,
          };
        }
      } catch (error) {
        config._brandRead.threw = String(error && error.message).slice(0, 120);
      }
    } else {
      config._brandRead.why = normalised.website
        ? "status " + normalised.website_status
        : "no website on the lead";
    }

    /* Worked out before the config is stored, because the proposal reads the
       config to decide what to embed. Left to reconstruct the URL itself, the
       proposal guessed the old preview app and showed a different site than
       the one the CRM linked to. */
    const siteUrl = template
      ? `${template.base}?site=${slug}`
      : `${SITE_BASE}/?site=${slug}`;
    config._demo.siteUrl = siteUrl;

    await storeSite(slug, config.company.name, config, normalised.email);
    const proposalUrl = `${PROPOSAL_BASE}/proposal.html?site=${slug}`;
    const message = composeEmail(config, siteUrl, proposalUrl, normalised.agency_name);

    // Sending is opt in per request. A build never emails anybody by accident.
    let delivery = { status: "not requested", sent: false };
    const wantsSend = request.body && request.body.send === true;
    if (wantsSend) {
      // Same address as the send-only path: both are the CRM's button.
      delivery = await sendEmail(message, normalised.email, DEMO_SEND_DOMAIN);
      await logEmail({
        slug, business: config.company.name, to_email: normalised.email,
        subject: message.subject, body_html: message.html, body_text: message.text,
        site_url: siteUrl, proposal_url: proposalUrl,
        status: delivery.sent ? "sent" : "failed",
        // The full from address, not the pool label. The CRM groups
        // deliverability by sending domain, and "pool-2" has no domain in it.
        sender: delivery.from || delivery.sender || null,
        provider_id: delivery.id || null,
        error: delivery.sent ? null : String(delivery.status).slice(0, 300),
      });
    }

    // File the business itself, so the CRM can list it after a refresh.
    const filed = await saveFoundLead({
      slug,
      business: config.company.name,
      category: normalised.trade || null,
      city: normalised.town || null,
      address: lead.address || null,
      phone: normalised.phone || null,
      email: normalised.email || null,
      website: lead.website || null,
      rating: Number(lead.rating) || null,
      reviews: parseInt(lead.reviews, 10) || null,
      google_maps_url: lead.google_maps_url || null,
      /* Every other way to reach them. Roughly half of Google Maps listings
         carry no email at all, and those were being filed as a dead end even
         though the scrape already had a phone number and their Facebook page.
         A lead with no inbox is still a phone call, a text or a DM. */
      facebook: normalised.facebook || null,
      instagram: normalised.instagram || null,
      linkedin: lead.linkedin || null,
      website_status: normalised.website_status || null,
      // The pitch trimmed for a text or a DM, kept whether or not they have an
      // email, so the CRM never has to ask the builder for it a second time.
      short_message: message.shortMessage || null,
      site_url: siteUrl,
      proposal_url: proposalUrl,
      subject: message.subject || null,
      // What was actually sent when there was an address to send to, and the
      // DM version only when there was not. Storing the DM copy against an
      // emailed lead made the CRM's record disagree with the inbox.
      email_body: (normalised.email ? message.text : message.shortMessage) || null,
      emailed: !!delivery.sent,
    });

    return response.status(200).json({
      slug, siteUrl, proposalUrl,
      // The lead's permanent code. The slug can change if a business is
      // renamed; this never does.
      leadCode: filed ? filed.lead_code : null,
      business: config.company.name,
      emailed: delivery.sent,
      emailStatus: delivery.status,
      // Resend's id for this message, so the CRM can watch it be opened.
      emailId: delivery.id || null,
      subject: message.subject,
      // For leads with no email: the same pitch, short enough to paste into a
      // text, an Instagram DM or Messenger.
      shortMessage: message.shortMessage,
      // The actual email, both parts of it. The CRM used to preview the DM
      // version and call it the email draft, so what Brett read on screen was
      // never what landed in the inbox: different wording, and the link pasted
      // as raw text instead of being a link. Showing a draft that does not match
      // the send is worse than showing no draft at all.
      emailHtml: message.html,
      emailText: message.text,
      angle: message.angle,
      hasEmail: Boolean(normalised.email),
    });
  } catch (error) {
    return response.status(500).json({ error: String(error.message || error).slice(0, 300) });
  }
}
