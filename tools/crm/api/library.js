// Templates and saved views: the two small stores that stop you retyping.
//
//   GET    /api/library                 { templates, views }
//   POST   /api/library?kind=template   { id?, name, subject, body }
//   POST   /api/library?kind=view       { id?, name, filters }
//   DELETE /api/library?kind=view&id=3
//
// Both are tiny and read on nearly every page load, so they share one endpoint
// rather than costing two round trips.

import { isAuthed } from "./_auth.js";

export const config = { runtime: "edge" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function store() {
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

const TABLE = { template: "templates", view: "saved_views" };

export default async function handler(req) {
  const authSecret = (process.env.AUTH_SECRET || "").trim();
  /* Fail closed. This used to read "if a secret is configured, check it", so
   clearing or mistyping AUTH_SECRET would silently open the endpoint to
   anyone instead of raising an error. */
  if (!authSecret || !(await isAuthed(req))) return json({ ok: false, login: true }, 401);

  const db = store();
  if (!db) return json({ ok: false, error: "Storage is not configured." }, 503);
  const rest = (path, init) => fetch(db.url + "/rest/v1/" + path, {
    ...init, headers: { ...db.headers, ...(init && init.headers) },
    signal: AbortSignal.timeout(8000),
  });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const table = TABLE[kind];

  try {
    if (req.method === "GET") {
      const [t, v] = await Promise.all([
        rest("templates?select=*&order=id.asc"),
        rest("saved_views?select=*&order=id.asc"),
      ]);
      return json({
        ok: true,
        templates: t.ok ? await t.json() : [],
        views: v.ok ? await v.json() : [],
      });
    }

    if (!table) return json({ ok: false, error: "Unknown kind." }, 400);

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return json({ ok: false, error: "Which one?" }, 400);
      const res = await rest(`${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) return json({ ok: false, error: "Could not delete." }, 502);
      return json({ ok: true });
    }

    if (req.method !== "POST") return json({ ok: false, error: "GET, POST or DELETE." }, 405);
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim().slice(0, 120);
    if (!name) return json({ ok: false, error: "It needs a name." }, 400);

    const row = kind === "template"
      ? {
          name,
          subject: String(body.subject || "").trim().slice(0, 200),
          body: String(body.body || "").trim().slice(0, 5000),
        }
      : { name, filters: body.filters && typeof body.filters === "object" ? body.filters : {} };

    if (kind === "template" && (!row.subject || !row.body)) {
      return json({ ok: false, error: "A template needs a subject and a body." }, 400);
    }

    if (body.id) {
      const res = await rest(`${table}?id=eq.${parseInt(body.id, 10)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      if (!res.ok) return json({ ok: false, error: "Could not save." }, 502);
      return json({ ok: true, saved: (await res.json())[0] });
    }
    const res = await rest(table, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify([row]),
    });
    if (!res.ok) return json({ ok: false, error: "Could not save." }, 502);
    return json({ ok: true, saved: (await res.json())[0] });
  } catch (err) {
    return json({ ok: false, error: "Storage did not answer." }, 502);
  }
}
