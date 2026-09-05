"""
YouTube channel scraper for client research.

Scrapes a YouTube channel's recent videos using yt-dlp (free, no API key),
fetches free auto-captions via youtube-transcript-api, and pulls top comments.
Saves everything to ./dossiers/<handle>/youtube.json.

Whisper transcription for videos without captions is handled separately by
youtube_transcribe.py.

Usage:
    python scripts/youtube_scrape.py @creator_handle
    python scripts/youtube_scrape.py @creator_handle --videos 25
    python scripts/youtube_scrape.py @creator_handle --lookback-days 60
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)

try:
    from youtube_transcript_api import (
        YouTubeTranscriptApi,
        NoTranscriptFound,
        TranscriptsDisabled,
    )
except ImportError:
    print("Error: youtube-transcript-api not installed.", file=sys.stderr)
    sys.exit(1)


DEFAULT_VIDEO_LIMIT = 20
DEFAULT_LOOKBACK_DAYS = 90
TOP_VIDEOS_FOR_COMMENTS = 5
MAX_COMMENTS_PER_VIDEO = 30
OUTPUT_ROOT = Path("./dossiers")


@dataclass
class Video:
    platform: str = "youtube"
    video_id: str = ""
    title: str = ""
    url: str = ""
    channel: str = ""
    channel_handle: str = ""
    upload_date: str = ""
    duration_secs: int = 0
    duration_str: str = ""
    views: int = 0
    description: str = ""
    transcript: str = ""
    transcript_source: str = ""  # "captions" | "whisper" | ""
    comments: list[dict] = field(default_factory=list)


def normalise_handle(raw: str) -> str:
    """Accept @handle, handle, or full URL. Returns the bare handle."""
    h = raw.strip().lstrip("@")
    if h.startswith("http"):
        # https://youtube.com/@handle/videos
        parts = h.rstrip("/").split("/")
        for p in reversed(parts):
            if p.startswith("@"):
                return p.lstrip("@")
    return h


def parse_upload_date(date_str: str) -> datetime | None:
    if not date_str:
        return None
    s = str(date_str)
    if len(s) == 8 and s.isdigit():
        try:
            return datetime.strptime(s, "%Y%m%d")
        except ValueError:
            return None
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:19], fmt)
        except ValueError:
            continue
    return None


def format_duration(seconds: int) -> str:
    if not seconds:
        return "unknown"
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def fetch_transcript(video_id: str) -> str:
    """Try to fetch a free YouTube caption. Returns text or empty string."""
    if not video_id:
        return ""
    api = YouTubeTranscriptApi()
    try:
        result = api.fetch(video_id, languages=["en", "en-GB", "en-US"])
        return " ".join(s.text for s in result).strip()
    except (NoTranscriptFound, TranscriptsDisabled):
        pass
    except Exception:
        pass
    try:
        transcript_list = api.list(video_id)
        for t in transcript_list:
            result = t.fetch()
            return " ".join(s.text for s in result).strip()
    except Exception:
        return ""
    return ""


def fetch_comments(video_id: str, max_comments: int = MAX_COMMENTS_PER_VIDEO) -> list[dict]:
    if not video_id:
        return []
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "getcomments": True,
        "extractor_args": {"youtube": {"max_comments": [str(max_comments)]}},
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}", download=False
            )
            raw = info.get("comments") or []
            return [
                {
                    "author": c.get("author", ""),
                    "text": (c.get("text") or "").strip(),
                    "likes": c.get("like_count") or 0,
                }
                for c in raw[:max_comments]
                if (c.get("text") or "").strip()
            ]
    except Exception:
        return []


def scrape_channel(handle: str, video_limit: int, lookback_days: int) -> list[Video]:
    """List recent videos from a channel via yt-dlp."""
    url = f"https://www.youtube.com/@{handle}/videos"
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "playlistend": video_limit,
    }
    cutoff = datetime.utcnow() - timedelta(days=lookback_days)
    videos: list[Video] = []

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                return []
            entries = info.get("entries", []) or []

            for entry in entries:
                if not entry:
                    continue
                title = entry.get("title", "")
                if not title:
                    continue

                video_id = entry.get("id", "")
                upload_date = parse_upload_date(entry.get("upload_date", ""))

                if upload_date and upload_date < cutoff:
                    continue

                duration_secs = entry.get("duration") or 0

                videos.append(
                    Video(
                        video_id=video_id,
                        title=title,
                        url=f"https://www.youtube.com/watch?v={video_id}",
                        channel=entry.get("channel") or handle,
                        channel_handle=handle,
                        upload_date=upload_date.strftime("%Y-%m-%d") if upload_date else "unknown",
                        duration_secs=duration_secs,
                        duration_str=format_duration(duration_secs),
                        views=entry.get("view_count") or 0,
                        description=(entry.get("description") or "")[:500],
                    )
                )
        return videos
    except Exception as e:
        print(f"  [error] yt-dlp failed for @{handle}: {e}", file=sys.stderr)
        return []


def save_output(handle: str, videos: list[Video]) -> Path:
    out_dir = OUTPUT_ROOT / handle
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "youtube.json"

    payload = {
        "platform": "youtube",
        "handle": handle,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "video_count": len(videos),
        "videos": [asdict(v) for v in videos],
    }
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("handle", help="YouTube handle (@handle, handle, or channel URL)")
    parser.add_argument(
        "--videos",
        type=int,
        default=DEFAULT_VIDEO_LIMIT,
        help=f"How many recent videos to scrape (default: {DEFAULT_VIDEO_LIMIT})",
    )
    parser.add_argument(
        "--lookback-days",
        type=int,
        default=DEFAULT_LOOKBACK_DAYS,
        help=f"Only include videos uploaded within this many days (default: {DEFAULT_LOOKBACK_DAYS})",
    )
    parser.add_argument(
        "--top-comments",
        type=int,
        default=TOP_VIDEOS_FOR_COMMENTS,
        help=f"Fetch comments + transcripts for this many top videos (default: {TOP_VIDEOS_FOR_COMMENTS})",
    )
    args = parser.parse_args()

    handle = normalise_handle(args.handle)
    if not handle:
        print("Error: empty handle.", file=sys.stderr)
        return 2

    print(f"[YouTube] Scraping @{handle} (up to {args.videos} videos, last {args.lookback_days} days)...")
    videos = scrape_channel(handle, args.videos, args.lookback_days)
    if not videos:
        print(f"[YouTube] No videos found for @{handle}. Channel may not exist or has no recent uploads.")
        return 1

    print(f"[YouTube] Got {len(videos)} videos.")
    videos.sort(key=lambda v: v.views, reverse=True)
    top = videos[: args.top_comments]

    print(f"[YouTube] Fetching comments + transcripts for top {len(top)} videos...")
    for v in top:
        v.comments = fetch_comments(v.video_id)
        v.transcript = fetch_transcript(v.video_id)
        if v.transcript:
            v.transcript_source = "captions"
        status_t = f"{len(v.transcript):,} chars" if v.transcript else "no captions (use whisper later)"
        print(f"  {v.views:,}v — {v.title[:50]} — comments: {len(v.comments)} — transcript: {status_t}")

    out_path = save_output(handle, videos)
    print(f"\n[YouTube] Saved → {out_path}")

    missing_transcripts = [v for v in top if not v.transcript]
    if missing_transcripts:
        print(
            f"\n[YouTube] {len(missing_transcripts)} top videos lack free captions. "
            f"Run: python scripts/youtube_transcribe.py {handle} --top {args.top_comments}"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
