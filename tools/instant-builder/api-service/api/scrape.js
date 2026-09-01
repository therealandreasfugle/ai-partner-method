/**
 * /api/scrape
 *
 * Finds real businesses on Google Maps so the whole run can happen from the
 * CRM, with no laptop and no terminal involved.
 *
 *   POST { town, trade, count }  -> { runId, datasetId, t }   starts the scrape
 *   GET  ?runId=..&t=..          -> { status, leads }         polls it
 *
 * Two calls rather than one because a Maps scrape takes a minute or more and a
 * serverless function is killed long before that. Starting the run returns in
 * about a second, and the page polls until it finishes, which also means the
 * audience sees progress instead of a spinner that looks hung.
 *
 * Apify bills per place. Each token carries $5 of free credit a month, so the
 * pool is rotated and any token with nothing left is skipped, which keeps a run
 * from failing halfway through a live demo because one account ran dry.
 */

const ACTOR = "compass~crawler-google-places";

function timingSafeEqual(given, expected) {
  const a = String(given == null ? "" : given);
  const b = String(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Every configured Apify token, in order. Never sent to the browser. */
function tokens() {
  const list = [];
  if (process.env.APIFY_TOKEN) list.push(process.env.APIFY_TOKEN);
  for (let i = 2; i <= 12; i++) {
    const t = process.env[`APIFY_TOKEN_${i}`];
    if (t) list.push(t);
  }
  return list;
}

/** How much of this month's free credit is left on a token. */
async function creditLeft(token) {
  try {
    const response = await fetch("https://api.apify.com/v2/users/me/limits", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return 0;
    const data = (await response.json()).data || {};
    const used = (data.current || {}).monthlyUsageUsd || 0;
    const cap = (data.limits || {}).maxMonthlyUsageUsd || 0;
    return cap - used;
  } catch {
    return 0;
  }
}

/** A row the builder can use, from whatever shape Maps gave back. */
function toLead(place) {
  const emails = Array.isArray(place.emails) ? place.emails.filter(Boolean) : [];

  /* The actor returns socials as arrays when scrapeContacts is on, and we were
     throwing them away, so every lead arrived with a bare facebook.com link
     that went nowhere useful. Their actual page is worth having: it is often
     the only web presence a business without a site has, and it is where the
     photographs of their work are. */
  const first = (list) => (Array.isArray(list) ? list.filter(Boolean)[0] || "" : "");
  const facebook = first(place.facebooks) || first(place.facebook);
  const instagram = first(place.instagrams) || first(place.instagram);

  const website = place.website || "";
  /* A business whose only presence is a Facebook page is a different pitch
     from one with no presence at all, and different again from one with a real
     site. The builder's opening line depends on knowing which. */
  const status = website ? "has website" : (facebook || instagram ? "SOCIAL" : "NONE");

  return {
    business: place.title || "",
    category: place.categoryName || "",
    city: place.city || place.neighborhood || "",
    address: place.address || "",
    postal_code: place.postalCode || "",
    phone: place.phone || "",
    email: emails[0] || "",
    website,
    website_status: status,
    facebook,
    instagram,
    linkedin: first(place.linkedIns),
    rating: place.totalScore || 0,
    reviews: place.reviewsCount || 0,
    google_maps_url: place.url || "",
  };
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, x-build-secret");
  if (request.method === "OPTIONS") return response.status(204).end();

  const secret = process.env.BUILD_SECRET;
  if (!secret) return response.status(503).json({ error: "not configured" });
  if (!timingSafeEqual(request.headers["x-build-secret"], secret)) {
    return response.status(401).json({ error: "unauthorised" });
  }

  const pool = tokens();
  if (!pool.length) {
    return response.status(503).json({ error: "no Apify token is configured" });
  }

  /* ---------------------------------------------------------------- poll */
  if (request.method === "GET") {
    const runId = String(request.query.runId || "");
    const index = parseInt(request.query.t || "0", 10);
    const token = pool[index];
    if (!runId || !token) return response.status(400).json({ error: "unknown run" });

    const runResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!runResponse.ok) return response.status(502).json({ error: "could not read the run" });
    const run = (await runResponse.json()).data || {};

    if (run.status === "RUNNING" || run.status === "READY") {
      return response.status(200).json({ status: "running" });
    }
    if (run.status !== "SUCCEEDED") {
      return response.status(200).json({ status: "failed", detail: run.status });
    }

    const items = await fetch(
      `https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?clean=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!items.ok) return response.status(502).json({ error: "could not read the results" });
    const places = await items.json();
    const leads = (Array.isArray(places) ? places : [])
      .map(toLead)
      .filter((l) => l.business);
    return response.status(200).json({ status: "done", leads });
  }

  /* --------------------------------------------------------------- start */
  const body = request.body || {};
  const town = String(body.town || "").trim();
  const trade = String(body.trade || "").trim();
  /* Google Maps happily returns Newcastle in Australia for a search meant for
     Newcastle upon Tyne, and the whole batch is then wrong.
     The field is free text now, so it arrives as a name ("United Kingdom"), a
     code ("gb"), or anything in between. The actor wants a two letter code, so
     the common names are mapped and anything else is passed through if it
     already looks like a code. Unrecognised means "let Google decide", which is
     the old behaviour and never worse than guessing wrong. */
  const COUNTRY_CODES = {
    "united kingdom": "gb", uk: "gb", britain: "gb", "great britain": "gb", england: "gb",
    scotland: "gb", wales: "gb", "northern ireland": "gb",
    "united states": "us", usa: "us", america: "us", "united states of america": "us",
    canada: "ca", australia: "au", ireland: "ie", eire: "ie", "new zealand": "nz",
    spain: "es", france: "fr", germany: "de", netherlands: "nl", holland: "nl",
    portugal: "pt", italy: "it", "south africa": "za", uae: "ae",
    "united arab emirates": "ae", dubai: "ae", singapore: "sg", mexico: "mx",
    brazil: "br", india: "in", poland: "pl", sweden: "se", norway: "no",
    denmark: "dk", belgium: "be", switzerland: "ch", austria: "at",
  };
  const asked = String(body.country || "").trim().toLowerCase();
  const country = COUNTRY_CODES[asked] || (/^[a-z]{2}$/.test(asked) ? asked : "");
  // Capped at 20. This runs in front of an audience and each place costs money.
  const count = Math.max(1, Math.min(20, parseInt(body.count, 10) || 5));
  if (!town || !trade) {
    return response.status(400).json({ error: "a town and a business type are both needed" });
  }

  // First token with credit left. Checked rather than assumed, because a run
  // that dies halfway through is worse than one that never starts.
  let chosen = -1;
  for (let i = 0; i < pool.length; i++) {
    if ((await creditLeft(pool[i])) > 0.2) { chosen = i; break; }
  }
  if (chosen === -1) {
    return response.status(503).json({ error: "every Apify token is out of free credit this month" });
  }

  /* The country has to be inside the location string, not beside it.
     The actor ignores countryCode when locationQuery is set, so asking for
     Didsbury in the United Kingdom returned Didsbury, Alberta and a batch of
     Canadian barbers. Naming the country in the query itself is what actually
     pins it, and countryCode is kept as a second hint. */
  const askedName = String(body.country || "").trim();
  const place = askedName && !/^[a-z]{2}$/i.test(askedName)
    ? `${town}, ${askedName}`
    : town;

  const input = {
    searchStringsArray: [trade],
    locationQuery: place,
    maxCrawledPlacesPerSearch: count,
    language: "en",
    skipClosedPlaces: true,
    scrapeContacts: true,
    ...(country ? { countryCode: country } : {}),
  };

  const started = await fetch(`https://api.apify.com/v2/acts/${ACTOR}/runs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${pool[chosen]}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!started.ok) {
    return response.status(502).json({ error: "could not start the scrape", detail: (await started.text()).slice(0, 160) });
  }
  const run = (await started.json()).data || {};
  return response.status(200).json({ runId: run.id, t: chosen });
}
