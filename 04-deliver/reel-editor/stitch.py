#!/usr/bin/env python3
"""Join clips into one video, in the order given. Sizes and frame rates are
matched to the FIRST clip automatically.

    python stitch.py take1.mp4 take2.mp4 take3.mp4 -o full.mp4
"""
import argparse
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib"))
from cutter import run, has_audio, probe_duration  # noqa: E402


def probe_video(path):
    p = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
             "stream=width,height,r_frame_rate", "-of", "json", path])
    s = json.loads(p.stdout)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    fps = float(num) / float(den or 1)
    return int(s["width"]), int(s["height"]), fps


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("clips", nargs="+", help="clips in the order they should play")
    ap.add_argument("-o", "--output", default="stitched.mp4")
    args = ap.parse_args()

    for c in args.clips:
        if not os.path.exists(c):
            sys.exit("No such file: %s" % c)
    if len(args.clips) < 2:
        sys.exit("Give at least two clips to stitch.")

    w, h, fps = probe_video(args.clips[0])
    fps = min(max(fps, 10), 60)
    silent = [c for c in args.clips if not has_audio(c)]

    parts, inputs = [], []
    for i, c in enumerate(args.clips):
        inputs += ["-i", c]
        parts.append(
            "[%d:v]scale=%d:%d:force_original_aspect_ratio=decrease,"
            "pad=%d:%d:(ow-iw)/2:(oh-ih)/2,fps=%g,setsar=1,format=yuv420p[v%d];"
            % (i, w, h, w, h, fps, i))
        if c in silent:
            parts.append("anullsrc=r=48000:cl=stereo,atrim=0:%.3f[a%d];"
                         % (probe_duration(c), i))
        else:
            parts.append("[%d:a]aresample=48000,aformat=channel_layouts=stereo[a%d];" % (i, i))
    chain = "".join("[v%d][a%d]" % (i, i) for i in range(len(args.clips)))
    parts.append("%sconcat=n=%d:v=1:a=1[v][a]" % (chain, len(args.clips)))

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write("".join(parts))
        spath = f.name
    try:
        run(["ffmpeg", "-y", *inputs, "-filter_complex_script", spath,
             "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18",
             "-preset", "medium", "-c:a", "aac", "-b:a", "192k",
             "-movflags", "+faststart", args.output])
    finally:
        os.unlink(spath)
    print("Wrote %s (%d clips at %dx%d %.3g fps)" % (args.output, len(args.clips), w, h, fps))


if __name__ == "__main__":
    main()
