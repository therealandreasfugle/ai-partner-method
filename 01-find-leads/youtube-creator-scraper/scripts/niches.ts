/**
 * Niche definitions — edit this file to scrape your own niches.
 *
 * Each niche has:
 *   - id              : short slug used in the CSV filename (kebab-case)
 *   - name            : human-readable name written into the niche column
 *   - youtube_queries : list of YouTube search queries to run.
 *                       More queries = more coverage = more Apify credit used.
 *                       Start with 2-4 queries per niche.
 *
 * Tips for good queries:
 *   - Imagine what your *ideal lead* would type into YouTube
 *   - Mix "how to" educational queries with "I made $X doing Y" success queries
 *   - Avoid generic one-word queries — they pull random noise
 *
 * Each query costs roughly $0.10 — $0.30 of Apify credit depending on results.
 * Apify gives $5/mo free, so plan for ~15-40 queries per month on the free plan.
 */

export interface Niche {
  id: string;
  name: string;
  youtube_queries: string[];
}

export const NICHES: Niche[] = [

  // ── EXAMPLE: replace these with your own niches ─────────────────────────────

  {
    id: "ai-automation-agency",
    name: "AI Automation Agency",
    youtube_queries: [
      "how to start an AI automation agency",
      "AI agency client acquisition strategy",
      "n8n workflow automation tutorial",
      "how I built a 6 figure AI agency",
    ],
  },

  {
    id: "real-estate-wholesaling",
    name: "Real Estate Wholesaling",
    youtube_queries: [
      "how to start wholesaling real estate with no money",
      "real estate wholesaling step by step",
      "how I made my first wholesale deal",
      "wholesaling real estate cold calling tips",
    ],
  },

  {
    id: "amazon-fba",
    name: "Amazon FBA",
    youtube_queries: [
      "how to start amazon fba in 2025",
      "amazon fba product research strategy",
      "how I scaled my amazon fba business",
      "amazon fba mistakes to avoid for beginners",
    ],
  },

];
