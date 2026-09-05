"""Decide what to cut: fillers, immediate repeats, long silences.

Input: words = [{"word": str, "start": float, "end": float}] in seconds, plus the
clip duration. Output: {"cuts": [...], "keeps": [[a, b], ...]} where keeps are the
time ranges of the final video, in order.
"""
import re

DEFAULT_FILLERS = {"um", "uh", "uhm", "umm", "uhh", "erm", "er", "mhm", "hmm", "ehm"}

MIN_CUT = 0.03      # ignore cuts shorter than this
MERGE_GAP = 0.02    # cuts closer than this merge into one
MIN_KEEP = 0.20     # drop keep-segments shorter than this
KEEP_JOIN = 0.12    # keeps separated by less than this join up


def norm(word):
    return re.sub(r"[^a-z']", "", word.lower())


def build_cut_plan(words, duration, silence_gap=0.7, pad=0.15, fillers=None,
                   repeat_window=0.6, cut_fillers=True):
    fillers = {norm(f) for f in (fillers if fillers is not None else DEFAULT_FILLERS)}
    words = sorted([w for w in words if w["word"].strip()], key=lambda w: w["start"])
    cuts = []

    if cut_fillers:
        for w in words:
            if norm(w["word"]) in fillers:
                cuts.append({"start": w["start"], "end": w["end"],
                             "reason": "filler '%s'" % w["word"].strip()})
        # immediate repeats: cut the first, keep the second (speech lands on the retake)
        for a, b in zip(words, words[1:]):
            na, nb = norm(a["word"]), norm(b["word"])
            if na and na == nb and (b["start"] - a["end"]) <= repeat_window:
                cuts.append({"start": a["start"], "end": a["end"],
                             "reason": "repeated '%s'" % a["word"].strip()})

    # silences: gaps between words, plus leading/trailing dead air
    if words:
        first, last = words[0], words[-1]
        if first["start"] > silence_gap:
            cuts.append({"start": 0.0, "end": max(0.0, first["start"] - pad),
                         "reason": "leading silence"})
        for a, b in zip(words, words[1:]):
            gap = b["start"] - a["end"]
            if gap > silence_gap:
                cuts.append({"start": a["end"] + pad, "end": b["start"] - pad,
                             "reason": "silence %.1fs" % gap})
        if duration - last["end"] > silence_gap:
            cuts.append({"start": min(duration, last["end"] + pad), "end": duration,
                         "reason": "trailing silence"})

    # tidy: drop slivers, sort, merge overlaps
    cuts = [c for c in cuts if c["end"] - c["start"] > MIN_CUT]
    cuts.sort(key=lambda c: c["start"])
    merged = []
    for c in cuts:
        if merged and c["start"] <= merged[-1]["end"] + MERGE_GAP:
            if c["end"] > merged[-1]["end"]:
                merged[-1]["end"] = c["end"]
                merged[-1]["reason"] += " + " + c["reason"]
        else:
            merged.append(dict(c))

    # keeps = everything that is not cut
    keeps, pos = [], 0.0
    for c in merged:
        if c["start"] - pos > KEEP_JOIN:
            keeps.append([pos, c["start"]])
        pos = max(pos, c["end"])
    if duration - pos > KEEP_JOIN:
        keeps.append([pos, duration])
    keeps = [k for k in keeps if k[1] - k[0] >= MIN_KEEP]
    return {"cuts": merged, "keeps": keeps}
