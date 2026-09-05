/**
 * YouTube Creator Scraper — Starter
 *
 * Scrapes YouTube for creators in your niche using Apify, applies quality
 * filters, extracts emails + Instagram handles from video descriptions, and
 * writes a CSV you can open in Sheets or import into your CRM.
 *
 * Quality gates (a creator must pass ALL):
 *   - subscribers between MIN_SUBS and MAX_SUBS (defaults: 500 — 500,000)
 *   - at least one video uploaded in the last RECENCY_DAYS (default: 30)
 *
 * Usage:
 *   npm run scrape                  — scrape every niche in niches.ts
 *   npm run scrape -- --niche=foo   — only the niche with id "foo"
 *
 * Output:
 *   leads/<niche-id>-<YYYY-MM-DD>.csv
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { NICHES, type Niche } from "./niches";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ─── Config ───────────────────────────────────────────────────────────────────

const APIFY_TOKEN     = process.env.APIFY_TOKEN ?? "";
const MIN_SUBS        = Number(process.env.MIN_SUBS ?? 500);
const MAX_SUBS        = Number(process.env.MAX_SUBS ?? 500_000);
const RECENCY_DAYS    = Number(process.env.RECENCY_DAYS ?? 30);
const RESULTS_PER_QRY = Number(process.env.RESULTS_PER_QUERY ?? 30);

// Apify YouTube search scraper.  Pinned by actor ID so the script doesn't
// break if the actor's slug changes upstream.  If this ever stops working,
// search the Apify Store for a YouTube search scraper and swap the ID here.
const YOUTUBE_ACTOR_ID = "h7sDV53CddomktSi5";

if (!APIFY_TOKEN) {
  console.error("✗ Missing APIFY_TOKEN.  Copy .env.example to .env and add your token.");
  console.error("  Get a free token at https://console.apify.com/account/integrations");
  process.exit(1);
}

// ─── Apify runner ─────────────────────────────────────────────────────────────

interface ApifyVideoItem {
  channelId?: string;
  channelUrl?: string;
  channelUsername?: string;
  channelName?: string;
  numberOfSubscribers?: number;
  date?: string;
  text?: string;
}

async function runActor(actorId: string, input: Record<string, unknown>): Promise<ApifyVideoItem[]> {
  const runRes = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!runRes.ok) {
    const err = await runRes.text();
    throw new Error(`Actor start failed: ${err}`);
  }

  const { data: run } = await runRes.json() as { data: { id: string } };
  process.stdout.write(`    → Run ${run.id} `);

  // Poll up to 15 minutes (90 × 10s)
  for (let i = 0; i < 90; i++) {
    await sleep(10_000);
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${run.id}?token=${APIFY_TOKEN}`);
    const { data: status } = await statusRes.json() as { data: { status: string } };

    if (status.status === "SUCCEEDED") { process.stdout.write("✓\n"); break; }
    if (status.status === "FAILED" || status.status === "ABORTED") {
      process.stdout.write("✗\n");
      throw new Error(`Run failed: ${status.status}`);
    }
    process.stdout.write(".");
  }

  const itemsRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${run.id}/dataset/items?token=${APIFY_TOKEN}&limit=1000`
  );
  return await itemsRes.json() as ApifyVideoItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function extractEmail(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (!match) return null;
  const email = match[0].toLowerCase();
  const skip = ["noreply", "no-reply", "donotreply", "example.com", "info@info"];
  if (skip.some(s => email.includes(s))) return null;
  return email;
}

function extractInstagramHandle(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/instagram\.com\/([A-Za-z0-9_.]{1,30})/);
  if (!match) return null;
  const username = match[1].replace(/\.*$/, "");
  if (["p", "explore", "reel", "stories"].includes(username)) return null;
  return `@${username}`;
}

function daysSince(timestamp: string | null | undefined): number {
  if (!timestamp) return 999;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 999;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── CSV writer ───────────────────────────────────────────────────────────────

interface Lead {
  niche: string;
  channel_name: string;
  channel_handle: string;
  channel_url: string;
  subscribers: number;
  email: string | null;
  instagram: string | null;
  last_video_date: string | null;
  description_excerpt: string;
}

function escapeCsvCell(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, "\"\"")}"`;
  }
  return s;
}

function writeCsv(leads: Lead[], outPath: string): void {
  const headers = [
    "niche", "channel_name", "channel_handle", "channel_url",
    "subscribers", "email", "instagram", "last_video_date", "description_excerpt",
  ];
  const rows = leads.map(l => [
    l.niche, l.channel_name, l.channel_handle, l.channel_url,
    l.subscribers, l.email, l.instagram, l.last_video_date,
    l.description_excerpt.slice(0, 200).replace(/\n/g, " "),
  ].map(escapeCsvCell).join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  fs.writeFileSync(outPath, csv);
}

// ─── YouTube scrape ───────────────────────────────────────────────────────────

interface ChannelAccum {
  channelId: string;
  channelName: string;
  channelUsername: string;
  channelUrl: string;
  subscribers: number;
  latestVideoDate: string | null;
  descriptions: string[];
}

async function scrapeNiche(niche: Niche): Promise<Lead[]> {
  console.log(`\n  [${niche.id}] ${niche.name}`);
  const channelAccum = new Map<string, ChannelAccum>();

  for (const query of niche.youtube_queries) {
    console.log(`    Query: "${query}"`);
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const items = await runActor(YOUTUBE_ACTOR_ID, {
        startUrls: [{ url: searchUrl }],
        maxResults: RESULTS_PER_QRY,
        proxy: { useApifyProxy: true },
      });

      for (const item of items) {
        const channelId = item.channelId ?? item.channelUrl;
        if (!channelId) continue;

        const existing = channelAccum.get(channelId);
        if (!existing) {
          channelAccum.set(channelId, {
            channelId,
            channelName: item.channelName ?? "",
            channelUsername: item.channelUsername ?? "",
            channelUrl: item.channelUrl ?? "",
            subscribers: item.numberOfSubscribers ?? 0,
            latestVideoDate: item.date ?? null,
            descriptions: item.text ? [item.text] : [],
          });
        } else {
          if (item.date && (!existing.latestVideoDate || new Date(item.date) > new Date(existing.latestVideoDate))) {
            existing.latestVideoDate = item.date;
          }
          if (item.text) existing.descriptions.push(item.text);
        }
      }
      console.log(`      → ${items.length} videos, ${channelAccum.size} unique channels so far`);
    } catch (err) {
      console.error(`    ✗ Query failed:`, err instanceof Error ? err.message : err);
    }
    await sleep(1500);
  }

  // Apply quality filters
  const leads: Lead[] = [];
  for (const acc of channelAccum.values()) {
    if (acc.subscribers < MIN_SUBS || acc.subscribers > MAX_SUBS) continue;
    if (daysSince(acc.latestVideoDate) > RECENCY_DAYS) continue;

    const allText = acc.descriptions.join("\n");
    const profileUrl = acc.channelUsername.startsWith("@")
      ? `https://www.youtube.com/${acc.channelUsername}`
      : acc.channelUrl || `https://www.youtube.com/channel/${acc.channelId}`;

    leads.push({
      niche: niche.name,
      channel_name: acc.channelName,
      channel_handle: acc.channelUsername || acc.channelId,
      channel_url: profileUrl,
      subscribers: acc.subscribers,
      email: extractEmail(allText),
      instagram: extractInstagramHandle(allText),
      last_video_date: acc.latestVideoDate,
      description_excerpt: acc.descriptions[0] ?? "",
    });
  }

  console.log(`    → ${channelAccum.size} scraped → ${leads.length} passed filters`);
  return leads;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const nicheArg = args.find(a => a.startsWith("--niche="))?.split("=")[1];

  const targetNiches = nicheArg
    ? NICHES.filter(n => n.id === nicheArg)
    : NICHES;

  if (targetNiches.length === 0) {
    console.error(`✗ No niche with id "${nicheArg}" found in scripts/niches.ts`);
    console.error(`  Available: ${NICHES.map(n => n.id).join(", ")}`);
    process.exit(1);
  }

  console.log("🎯  YouTube Creator Scraper");
  console.log("═".repeat(50));
  console.log(`Niches      : ${targetNiches.length}`);
  console.log(`Sub range   : ${MIN_SUBS.toLocaleString()} — ${MAX_SUBS.toLocaleString()}`);
  console.log(`Recency     : last ${RECENCY_DAYS} days`);
  console.log(`Started     : ${new Date().toISOString()}`);

  const today = new Date().toISOString().slice(0, 10);
  const leadsDir = path.resolve(process.cwd(), "leads");
  if (!fs.existsSync(leadsDir)) fs.mkdirSync(leadsDir, { recursive: true });

  let grandTotal = 0;
  for (const niche of targetNiches) {
    const leads = await scrapeNiche(niche);
    if (leads.length === 0) continue;

    const outPath = path.join(leadsDir, `${niche.id}-${today}.csv`);
    writeCsv(leads, outPath);
    console.log(`    💾 ${path.relative(process.cwd(), outPath)}`);
    grandTotal += leads.length;
  }

  console.log("\n" + "═".repeat(50));
  console.log(`✅  Done — ${grandTotal} qualified leads written to leads/`);
  console.log(`Completed   : ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
