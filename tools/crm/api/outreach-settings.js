// Authenticated proxy to the outreach settings.
//
// Same reasoning as api/instant.js: the builder's shared secret cannot live in
// crm.html, because that file is served to anyone who loads the page and is
// copied verbatim by every student who clones this repo. So the page talks to
// this endpoint, which checks the CRM session cookie and adds the secret from
// its own environment.
//
// GET  -> the sending accounts and their current settings
// POST -> { sender_key, enabled?, daily_cap?, warm_start? }
import { isAuthed } from "./_auth.js";

export const config = { runtime: "edge" };

const DEFAULT_URL = "https://aipm-instant-api.vercel.app/api/settings";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async function handler(request) {
  if (!(await isAuthed(request))) {
    return json({ error: "sign in first", login: true }, 401);
  }

  const secret = process.env.INSTANT_BUILD_SECRET;
  if (!secret) return json({ error: "the builder is not configured yet" }, 503);

  const url = process.env.INSTANT_SETTINGS_URL || DEFAULT_URL;
  const options = {
    method: request.method === "POST" ? "POST" : "GET",
    headers: { "content-type": "application/json", "x-build-secret": secret },
  };
  if (request.method === "POST") {
    options.body = await request.text();
  }

  let upstream;
  try {
    upstream = await fetch(url, options);
  } catch (error) {
    return json({ error: "could not reach the builder" }, 502);
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
