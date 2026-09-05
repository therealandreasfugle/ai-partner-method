"""
Whisper fallback transcription for YouTube videos without free captions.

Reads ./dossiers/<handle>/youtube.json, finds videos without a transcript,
downloads their audio with yt-dlp, sends to OpenAI Whisper, and updates
the JSON in place.

Cost: $0.006 per minute of audio. A 10-min video = $0.06.
Requires: OPENAI_API_KEY in .env, ffmpeg installed.

Usage:
    python scripts/youtube_transcribe.py @handle                # transcribe all missing
    python scripts/youtube_transcribe.py @handle --top 5        # only top 5 by views
    python scripts/youtube_transcribe.py @handle --estimate     # print cost, don't run
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)


OUTPUT_ROOT = Path("./dossiers")
WHISPER_MODEL = "whisper-1"
WHISPER_PRICE_PER_MIN_USD = 0.006
WHISPER_MAX_BYTES = 24 * 1024 * 1024  # stay under 25 MB API limit
CHUNK_SECONDS = 600  # 10 minute chunks
AUDIO_BITRATE = "64k"  # mono speech is fine at 64 kbps


def normalise_handle(raw: str) -> str:
    return raw.strip().lstrip("@")


def load_data(handle: str) -> dict:
    path = OUTPUT_ROOT / handle / "youtube.json"
    if not path.exists():
        print(
            f"Error: {path} not found. Run youtube_scrape.py first:\n"
            f"  python scripts/youtube_scrape.py @{handle}",
            file=sys.stderr,
        )
        sys.exit(2)
    return json.loads(path.read_text())


def save_data(handle: str, data: dict) -> None:
    path = OUTPUT_ROOT / handle / "youtube.json"
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def filter_missing(videos: list[dict], top_n: int | None) -> list[dict]:
    """Pick videos that need transcription, sorted by views."""
    needs = [v for v in videos if not v.get("transcript")]
    needs.sort(key=lambda v: v.get("views", 0), reverse=True)
    if top_n:
        return needs[:top_n]
    return needs


def estimate_cost(videos: list[dict]) -> tuple[int, float]:
    total_secs = sum(int(v.get("duration_secs") or 0) for v in videos)
    minutes = total_secs / 60
    return total_secs, minutes * WHISPER_PRICE_PER_MIN_USD


def download_audio(video_id: str, dest_dir: Path) -> Path | None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    base = dest_dir / video_id
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "format": "bestaudio/best",
        "outtmpl": str(base) + ".%(ext)s",
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": AUDIO_BITRATE.rstrip("k"),
            }
        ],
        "postprocessor_args": ["-ac", "1"],  # mono
        "retries": 5,
        "fragment_retries": 5,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
    except Exception as e:
        print(f"  [download error] {type(e).__name__}: {e}", file=sys.stderr)
        return None

    out = base.with_suffix(".mp3")
    return out if out.exists() else None


def split_audio(src: Path, chunk_dir: Path) -> list[Path]:
    chunk_dir.mkdir(parents=True, exist_ok=True)
    pattern = chunk_dir / f"{src.stem}_%03d.mp3"
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(src),
        "-f", "segment",
        "-segment_time", str(CHUNK_SECONDS),
        "-c", "copy",
        str(pattern),
    ]
    subprocess.run(cmd, check=True)
    return sorted(chunk_dir.glob(f"{src.stem}_*.mp3"))


def transcribe_file(client: OpenAI, audio_path: Path) -> str:
    with audio_path.open("rb") as f:
        resp = client.audio.transcriptions.create(
            model=WHISPER_MODEL,
            file=f,
            response_format="text",
        )
    return str(resp).strip()


def transcribe_video(client: OpenAI, video_id: str, audio_dir: Path) -> tuple[str, str]:
    """Returns (transcript_text, status)."""
    audio_path = audio_dir / f"{video_id}.mp3"
    if audio_path.exists():
        audio_path.unlink()

    downloaded = download_audio(video_id, audio_dir)
    if not downloaded:
        return "", "error:DownloadFailed"

    try:
        size = downloaded.stat().st_size
        if size <= WHISPER_MAX_BYTES:
            text = transcribe_file(client, downloaded)
        else:
            chunk_dir = audio_dir / f"{video_id}_chunks"
            try:
                chunks = split_audio(downloaded, chunk_dir)
                pieces = [transcribe_file(client, ch) for ch in chunks]
                text = " ".join(pieces).strip()
            finally:
                if chunk_dir.exists():
                    shutil.rmtree(chunk_dir, ignore_errors=True)
        return text, "ok" if text else "no_transcript"
    except Exception as e:
        return "", f"error:{type(e).__name__}"
    finally:
        if downloaded and downloaded.exists():
            try:
                downloaded.unlink()
            except OSError:
                pass


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("handle", help="YouTube handle (@handle or handle)")
    parser.add_argument("--top", type=int, default=0, help="Only transcribe top N missing by views (0 = all)")
    parser.add_argument("--estimate", action="store_true", help="Print cost and exit")
    args = parser.parse_args()

    handle = normalise_handle(args.handle)
    data = load_data(handle)
    videos = data.get("videos", [])
    missing = filter_missing(videos, args.top if args.top > 0 else None)

    if not missing:
        print(f"[whisper] All videos for @{handle} already have transcripts. Nothing to do.")
        return 0

    total_secs, cost = estimate_cost(missing)
    print(f"[whisper] {len(missing)} videos need transcription")
    print(f"[whisper] Total audio: {total_secs/60:.1f} minutes")
    print(f"[whisper] Estimated cost: ${cost:.2f} USD")

    if args.estimate:
        return 0

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not set in .env. Add it and try again.", file=sys.stderr)
        return 2

    if cost > 1.0:
        confirm = input(f"Spend ~${cost:.2f}? [y/N]: ").strip().lower()
        if confirm != "y":
            print("Aborted.")
            return 0

    client = OpenAI(api_key=api_key)
    audio_dir = OUTPUT_ROOT / handle / ".audio_tmp"

    stats = {"ok": 0, "error": 0}
    video_by_id = {v["video_id"]: v for v in videos}

    for i, v in enumerate(missing, 1):
        vid = v["video_id"]
        title = (v.get("title") or "")[:50]
        print(f"  [{i}/{len(missing)}] {vid} — {title}")

        text, status = transcribe_video(client, vid, audio_dir)
        if status == "ok":
            video_by_id[vid]["transcript"] = text
            video_by_id[vid]["transcript_source"] = "whisper"
            stats["ok"] += 1
            print(f"    OK ({len(text):,} chars)")
            save_data(handle, data)  # save after each so a crash doesn't lose progress
        else:
            stats["error"] += 1
            print(f"    FAIL ({status})", file=sys.stderr)

    # Clean up audio cache
    if audio_dir.exists():
        shutil.rmtree(audio_dir, ignore_errors=True)

    data["last_transcribed_at"] = datetime.now(timezone.utc).isoformat()
    save_data(handle, data)

    print(f"\n[whisper] Done. ok={stats['ok']} error={stats['error']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
