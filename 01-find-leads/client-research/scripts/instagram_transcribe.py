"""
Whisper transcription for Instagram reels.

Reads ./dossiers/<handle>/instagram.json, picks the top reels by engagement,
downloads their audio from the Apify-supplied video URL, sends to Whisper,
and updates the JSON with a "transcript" field on each post.

Cost: $0.006 per minute of audio. Most reels are <60s so ~$0.01 per reel.
Requires: OPENAI_API_KEY in .env, ffmpeg installed.

Usage:
    python scripts/instagram_transcribe.py @handle               # transcribe all video posts
    python scripts/instagram_transcribe.py @handle --top 5       # only top 5 by likes
    python scripts/instagram_transcribe.py @handle --estimate    # print cost, don't run
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)


OUTPUT_ROOT = Path("./dossiers")
WHISPER_MODEL = "whisper-1"
WHISPER_PRICE_PER_MIN_USD = 0.006
WHISPER_MAX_BYTES = 24 * 1024 * 1024


def normalise_handle(raw: str) -> str:
    return raw.strip().lstrip("@")


def load_data(handle: str) -> dict:
    path = OUTPUT_ROOT / handle / "instagram.json"
    if not path.exists():
        print(
            f"Error: {path} not found. Run instagram_scrape.py first:\n"
            f"  python scripts/instagram_scrape.py @{handle}",
            file=sys.stderr,
        )
        sys.exit(2)
    return json.loads(path.read_text())


def save_data(handle: str, data: dict) -> None:
    path = OUTPUT_ROOT / handle / "instagram.json"
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def pick_targets(posts: list[dict], top_n: int | None) -> list[dict]:
    """Posts with a video URL and no transcript yet, sorted by engagement."""
    targets = [
        p for p in posts
        if p.get("video_url") and not p.get("transcript")
    ]
    targets.sort(
        key=lambda p: (p.get("likes", 0) + p.get("video_view_count", 0)),
        reverse=True,
    )
    if top_n:
        return targets[:top_n]
    return targets


def estimate_cost(posts: list[dict]) -> tuple[float, float]:
    """Rough estimate — IG doesn't always give duration, assume avg 45s per reel."""
    avg_seconds_per_reel = 45
    total_seconds = len(posts) * avg_seconds_per_reel
    minutes = total_seconds / 60
    return total_seconds, minutes * WHISPER_PRICE_PER_MIN_USD


def download_video(url: str, dest: Path) -> Path | None:
    """Download the reel video file from the Apify-supplied CDN URL."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        r = requests.get(url, stream=True, timeout=60)
        r.raise_for_status()
        with dest.open("wb") as f:
            for chunk in r.iter_content(chunk_size=1 << 16):
                f.write(chunk)
        return dest if dest.exists() and dest.stat().st_size > 0 else None
    except Exception as e:
        print(f"  [download error] {type(e).__name__}: {e}", file=sys.stderr)
        return None


def extract_audio(video_path: Path) -> Path | None:
    """Use ffmpeg to extract mono mp3 audio from the downloaded video."""
    audio_path = video_path.with_suffix(".mp3")
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(video_path),
        "-vn",  # no video
        "-ac", "1",  # mono
        "-b:a", "64k",
        str(audio_path),
    ]
    try:
        subprocess.run(cmd, check=True)
        return audio_path if audio_path.exists() else None
    except subprocess.CalledProcessError as e:
        print(f"  [ffmpeg error] {e}", file=sys.stderr)
        return None


def transcribe_audio(client: OpenAI, audio_path: Path) -> str:
    with audio_path.open("rb") as f:
        resp = client.audio.transcriptions.create(
            model=WHISPER_MODEL,
            file=f,
            response_format="text",
        )
    return str(resp).strip()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("handle", help="Instagram handle (@handle or handle)")
    parser.add_argument("--top", type=int, default=0, help="Only transcribe top N by engagement (0 = all)")
    parser.add_argument("--estimate", action="store_true", help="Print cost and exit")
    args = parser.parse_args()

    handle = normalise_handle(args.handle)
    data = load_data(handle)
    posts = data.get("posts", [])
    targets = pick_targets(posts, args.top if args.top > 0 else None)

    if not targets:
        print(f"[whisper] No untranscribed video posts for @{handle}. Nothing to do.")
        return 0

    total_secs, cost = estimate_cost(targets)
    print(f"[whisper] {len(targets)} reels to transcribe")
    print(f"[whisper] Estimated audio: ~{total_secs/60:.1f} min")
    print(f"[whisper] Estimated cost: ~${cost:.2f} USD (rough — IG doesn't expose duration)")

    if args.estimate:
        return 0

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not set in .env.", file=sys.stderr)
        return 2

    client = OpenAI(api_key=api_key)
    work_dir = OUTPUT_ROOT / handle / ".video_tmp"
    work_dir.mkdir(parents=True, exist_ok=True)

    post_by_id = {p["post_id"]: p for p in posts}
    stats = {"ok": 0, "error": 0}

    try:
        for i, p in enumerate(targets, 1):
            pid = p["post_id"]
            caption_preview = (p.get("caption") or "")[:60].replace("\n", " ")
            print(f"  [{i}/{len(targets)}] {pid} — {caption_preview}")

            video_path = work_dir / f"{pid}.mp4"
            if not download_video(p["video_url"], video_path):
                stats["error"] += 1
                print("    FAIL (video download)", file=sys.stderr)
                continue

            audio_path = extract_audio(video_path)
            video_path.unlink(missing_ok=True)
            if not audio_path:
                stats["error"] += 1
                print("    FAIL (audio extract)", file=sys.stderr)
                continue

            try:
                if audio_path.stat().st_size > WHISPER_MAX_BYTES:
                    stats["error"] += 1
                    print("    SKIP (audio >25MB, very long reel — manual split needed)", file=sys.stderr)
                    continue
                text = transcribe_audio(client, audio_path)
                post_by_id[pid]["transcript"] = text
                post_by_id[pid]["transcript_source"] = "whisper"
                stats["ok"] += 1
                print(f"    OK ({len(text):,} chars)")
                save_data(handle, data)  # persist after every transcription
            finally:
                audio_path.unlink(missing_ok=True)
    finally:
        if work_dir.exists():
            try:
                # Best-effort cleanup
                for f in work_dir.glob("*"):
                    f.unlink(missing_ok=True)
                work_dir.rmdir()
            except OSError:
                pass

    data["last_transcribed_at"] = datetime.now(timezone.utc).isoformat()
    save_data(handle, data)
    print(f"\n[whisper] Done. ok={stats['ok']} error={stats['error']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
