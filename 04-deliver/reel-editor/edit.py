#!/usr/bin/env python3
"""Tighten a talking clip: cut silences, filler words, and repeated words.

    python edit.py my_clip.mp4
    python edit.py my_clip.mp4 --dry-run
See README.md for all options. Originals are never modified.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib"))
from detect import build_cut_plan, DEFAULT_FILLERS  # noqa: E402
from cutter import probe_duration, render_keeps     # noqa: E402


def load_words_file(path):
    """Accept [{"word"|"text", "start"/"end" seconds | "startMs"/"endMs"}] json."""
    with open(path) as f:
        data = json.load(f)
    words = []
    for w in data:
        text = (w.get("word") or w.get("text") or "").strip()
        if not text:
            continue
        if "startMs" in w:
            words.append({"word": text, "start": w["startMs"] / 1000.0,
                          "end": w["endMs"] / 1000.0})
        else:
            words.append({"word": text, "start": float(w["start"]),
                          "end": float(w["end"])})
    return words


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", help="video file to edit")
    ap.add_argument("-o", "--output", help="output file (default: <name>_edited.mp4)")
    ap.add_argument("--dry-run", action="store_true", help="print the plan, cut nothing")
    ap.add_argument("--aggressive", action="store_true", help="cut silences over 0.45s")
    ap.add_argument("--silence", type=float, default=None,
                    help="cut silences longer than this many seconds (default 0.7)")
    ap.add_argument("--pad", type=float, default=0.15,
                    help="breathing room left around each silence cut (default 0.15)")
    ap.add_argument("--fillers", help="comma-separated filler list to use instead")
    ap.add_argument("--keep-fillers", action="store_true",
                    help="only cut silences, leave every word in")
    ap.add_argument("--model", default="small",
                    help="whisper model: tiny/small/medium (default small)")
    ap.add_argument("--words", help="reuse an existing word-timestamps json")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        sys.exit("No such file: %s" % args.input)
    silence = args.silence if args.silence is not None else (0.45 if args.aggressive else 0.7)
    out = args.output or os.path.splitext(args.input)[0] + "_edited.mp4"
    report_path = os.path.splitext(out)[0].replace("_edited", "") + "_report.json"
    fillers = ([f.strip() for f in args.fillers.split(",") if f.strip()]
               if args.fillers else None)

    duration = probe_duration(args.input)
    if args.words:
        words = load_words_file(args.words)
    else:
        from transcribe import transcribe
        words = transcribe(args.input, args.model)
    if not words:
        print("No speech found; will only trim leading/trailing silence if any.")

    plan = build_cut_plan(words, duration, silence_gap=silence, pad=args.pad,
                          fillers=fillers, cut_fillers=not args.keep_fillers)
    kept = sum(b - a for a, b in plan["keeps"])
    removed = duration - kept

    print("\n%d cuts, removing %.1fs of %.1fs (%.0f%%):" %
          (len(plan["cuts"]), removed, duration, 100 * removed / max(duration, 0.001)))
    for c in plan["cuts"]:
        print("  %7.2fs - %7.2fs  %s" % (c["start"], c["end"], c["reason"]))
    print("Result: %.1fs -> %.1fs" % (duration, kept))

    if args.dry_run:
        print("\nDry run: nothing rendered.")
        return
    if not plan["cuts"]:
        print("\nNothing to cut. No output written.")
        return
    if removed / max(duration, 0.001) > 0.6:
        print("\nWARNING: this would remove over 60%% of the clip. "
              "Check the transcription (try --model medium) or raise --silence. "
              "Rendering anyway since you did not use --dry-run.")

    with open(report_path, "w") as f:
        json.dump({"input": args.input, "output": out, "duration_before": duration,
                   "duration_after": kept, "settings": {"silence": silence,
                   "pad": args.pad, "keep_fillers": args.keep_fillers},
                   "cuts": plan["cuts"], "keeps": plan["keeps"]}, f, indent=2)
    render_keeps(args.input, plan["keeps"], out)
    print("\nWrote %s (%.1fs) and %s" % (out, probe_duration(out), report_path))


if __name__ == "__main__":
    main()
