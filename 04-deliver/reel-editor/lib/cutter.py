"""ffmpeg plumbing: probe duration, render the kept ranges into one clip."""
import json
import os
import subprocess
import tempfile


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        tail = (p.stderr or "").strip().splitlines()[-12:]
        raise RuntimeError("%s failed:\n%s" % (os.path.basename(cmd[0]), "\n".join(tail)))
    return p


def probe_duration(path):
    p = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "json", path])
    return float(json.loads(p.stdout)["format"]["duration"])


def has_audio(path):
    p = run(["ffprobe", "-v", "error", "-select_streams", "a",
             "-show_entries", "stream=index", "-of", "json", path])
    return bool(json.loads(p.stdout).get("streams"))


def render_keeps(inp, keeps, outp):
    """One re-encode pass: select only the kept time ranges, video and audio in sync."""
    sel = "+".join("between(t,%.3f,%.3f)" % (a, b) for a, b in keeps)
    if has_audio(inp):
        script = ("[0:v]select='%s',setpts=N/FRAME_RATE/TB[v];"
                  "[0:a]aselect='%s',asetpts=N/SR/TB[a]") % (sel, sel)
        maps = ["-map", "[v]", "-map", "[a]"]
    else:
        script = "[0:v]select='%s',setpts=N/FRAME_RATE/TB[v]" % sel
        maps = ["-map", "[v]"]
    # filter goes in a temp file so huge cut lists never hit the shell arg limit
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write(script)
        spath = f.name
    try:
        run(["ffmpeg", "-y", "-i", inp, "-filter_complex_script", spath, *maps,
             "-c:v", "libx264", "-crf", "18", "-preset", "medium",
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", outp])
    finally:
        os.unlink(spath)
