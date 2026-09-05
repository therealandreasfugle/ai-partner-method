"""
Instagram profile + posts scraper via Apify.

Uses the official Apify Instagram Scraper actor (apify/instagram-scraper) to
pull a creator's profile data, recent posts, captions, and engagement.
Saves to ./dossiers/<handle>/instagram.json.

Cost: ~$0.50-$2.00 per scrape depending on post volume.
Requires: APIFY_TOKEN in .env.

Usage:
    python scripts/instagram_scrape.py @creator_handle
    python scripts/instagram_scrape.py @creator_handle --posts 30
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

try:
    from apify_client import ApifyClient
except ImportError:
    print("Error: apify-client not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)


APIFY_ACTOR_ID = "apify/instagram-scraper"  # official Apify actor
DEFAULT_POST_LIMIT = 20
OUTPUT_ROOT = Path("./dossiers")


@dataclass
class Post:
    post_id: str = ""
    url: str = ""
    type: str = ""  # "Image" | "Video" | "Sidecar"
    caption: str = ""
    timestamp: str = ""
    likes: int = 0
    comments_count: int = 0
    video_view_count: int = 0
    video_url: str = ""  # for transcription later
    hashtags: list[str] = field(default_factory=list)
    mentions: list[str] = field(default_factory=list)
    top_comments: list[dict] = field(default_factory=list)


@dataclass
class Profile:
    handle: str = ""
    full_name: str = ""
    bio: str = ""
    external_url: str = ""
    followers: int = 0
    follows: int = 0
    posts_count: int = 0
    is_verified: bool = False
    is_business: bool = False
    profile_pic_url: str = ""


def normalise_handle(raw: str) -> str:
    h = raw.strip().lstrip("@")
    if h.startswith("http"):
        parts = h.rstrip("/").split("/")
        for p in reversed(parts):
            if p and not p.startswith("http"):
                return p
    return h


def run_apify_scrape(handle: str, post_limit: int, token: str) -> dict:
    client = ApifyClient(token)
    run_input = {
        "directUrls": [f"https://www.instagram.com/{handle}/"],
        "resultsType": "details",
        "resultsLimit": post_limit,
        "addParentData": True,
        "searchType": "user",
    }
    print(f"[Instagram] Calling Apify actor '{APIFY_ACTOR_ID}'...")
    run = client.actor(APIFY_ACTOR_ID).call(run_input=run_input)
    if not run:
        raise RuntimeError("Apify run returned no result")

    dataset_id = run.get("defaultDatasetId")
    if not dataset_id:
        raise RuntimeError("Apify run has no dataset")

    items = list(client.dataset(dataset_id).iterate_items())
    return {"items": items, "run_id": run.get("id", "")}


def parse_profile(raw_items: list[dict], handle: str) -> Profile:
    """The first item from instagram-scraper usually contains profile data."""
    profile_data = {}
    for item in raw_items:
        if item.get("username", "").lower() == handle.lower():
            profile_data = item
            break
    if not profile_data and raw_items:
        # Fallback: scrape pulls profile fields onto each post item
        profile_data = raw_items[0]

    return Profile(
        handle=handle,
        full_name=profile_data.get("fullName", "") or profile_data.get("ownerFullName", ""),
        bio=profile_data.get("biography", "") or "",
        external_url=profile_data.get("externalUrl", "") or "",
        followers=profile_data.get("followersCount", 0) or 0,
        follows=profile_data.get("followsCount", 0) or 0,
        posts_count=profile_data.get("postsCount", 0) or 0,
        is_verified=bool(profile_data.get("verified", False)),
        is_business=bool(profile_data.get("isBusinessAccount", False)),
        profile_pic_url=profile_data.get("profilePicUrl", "") or "",
    )


def parse_posts(raw_items: list[dict]) -> list[Post]:
    posts: list[Post] = []
    for item in raw_items:
        # Skip the profile-only row if any
        if not item.get("shortCode") and not item.get("id"):
            continue

        top_comments = []
        for c in (item.get("latestComments") or [])[:10]:
            top_comments.append(
                {
                    "owner": c.get("ownerUsername", ""),
                    "text": (c.get("text") or "").strip(),
                    "likes": c.get("likesCount", 0) or 0,
                }
            )

        posts.append(
            Post(
                post_id=item.get("shortCode", "") or item.get("id", ""),
                url=item.get("url", "")
                or (f"https://www.instagram.com/p/{item.get('shortCode')}/" if item.get("shortCode") else ""),
                type=item.get("type", ""),
                caption=(item.get("caption") or "").strip(),
                timestamp=item.get("timestamp", ""),
                likes=item.get("likesCount", 0) or 0,
                comments_count=item.get("commentsCount", 0) or 0,
                video_view_count=item.get("videoViewCount", 0) or 0,
                video_url=item.get("videoUrl", "") or "",
                hashtags=list(item.get("hashtags", []) or []),
                mentions=list(item.get("mentions", []) or []),
                top_comments=top_comments,
            )
        )
    return posts


def save_output(handle: str, profile: Profile, posts: list[Post], run_id: str) -> Path:
    out_dir = OUTPUT_ROOT / handle
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "instagram.json"

    payload = {
        "platform": "instagram",
        "handle": handle,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "apify_run_id": run_id,
        "profile": asdict(profile),
        "post_count": len(posts),
        "posts": [asdict(p) for p in posts],
    }
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("handle", help="Instagram handle (@handle or handle)")
    parser.add_argument(
        "--posts",
        type=int,
        default=DEFAULT_POST_LIMIT,
        help=f"How many recent posts to scrape (default: {DEFAULT_POST_LIMIT})",
    )
    args = parser.parse_args()

    handle = normalise_handle(args.handle)
    if not handle:
        print("Error: empty handle.", file=sys.stderr)
        return 2

    token = os.getenv("APIFY_TOKEN")
    if not token:
        print(
            "Error: APIFY_TOKEN not set in .env. "
            "Get one free at https://console.apify.com/account/integrations",
            file=sys.stderr,
        )
        return 2

    print(f"[Instagram] Scraping @{handle} (up to {args.posts} posts)...")
    print(f"[Instagram] ⚠️  This will cost ~$0.50-$2.00 in Apify credits.")

    try:
        result = run_apify_scrape(handle, args.posts, token)
    except Exception as e:
        print(f"[Instagram] Scrape failed: {e}", file=sys.stderr)
        return 1

    items = result.get("items", [])
    if not items:
        print(f"[Instagram] No data returned for @{handle}. Account may be private or not exist.")
        return 1

    profile = parse_profile(items, handle)
    posts = parse_posts(items)

    print(f"[Instagram] Profile: {profile.full_name} — {profile.followers:,} followers, {len(posts)} posts pulled")

    out_path = save_output(handle, profile, posts, result.get("run_id", ""))
    print(f"[Instagram] Saved → {out_path}")

    video_posts = [p for p in posts if p.video_url]
    if video_posts:
        print(
            f"\n[Instagram] {len(video_posts)} reels have downloadable video URLs. "
            f"To transcribe top reels: python scripts/instagram_transcribe.py {handle} --top 5"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
