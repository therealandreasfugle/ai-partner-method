# AIPM Reel Editor

Cut the dead air out of your talking videos automatically. You record, this removes the
silences, the "um"s and "uh"s, and the words you accidentally said twice, then hands you
back a tighter clip. It also stitches multiple clips into one video.

Built to be driven by Claude Code: open this folder in Claude Code and just say
"edit my clip" (see CLAUDE.md). You can also run everything yourself from the terminal.

## What you need (one-time setup)

1. Python 3.10 or newer: https://www.python.org/downloads/
2. ffmpeg (the tool that actually cuts video):
   - Mac: `brew install ffmpeg`
   - Windows: `winget install ffmpeg` (or download from ffmpeg.org and add to PATH)
3. The transcriber:

```
pip install -r requirements.txt
```

The first time you edit a clip it downloads a speech model (a few hundred MB, one time).

## Edit a clip

```
python edit.py my_clip.mp4
```

That is it. You get:
- `my_clip_edited.mp4` - the tightened video
- `my_clip_report.json` - every cut it made, with timestamps and the reason

It removes, by default:
- silences longer than 0.7s (leaves natural breathing room around them)
- filler words: um, uh, umm, uhh, erm, er, mhm, hmm
- immediately repeated words ("I I think", "the the plan"), keeping the second one

## Useful options

```
python edit.py my_clip.mp4 -o final.mp4      write to a specific file
python edit.py my_clip.mp4 --dry-run         show what WOULD be cut, touch nothing
python edit.py my_clip.mp4 --aggressive      tighter: cuts silences over 0.45s
python edit.py my_clip.mp4 --silence 1.0     only cut silences longer than 1s
python edit.py my_clip.mp4 --fillers "um,uh,like,you know"   your own filler list
python edit.py my_clip.mp4 --model medium    better transcription, slower (default: small)
python edit.py my_clip.mp4 --keep-fillers    only cut silences, leave words alone
```

## Stitch clips together

```
python stitch.py intro.mp4 part2.mp4 outro.mp4 -o full_video.mp4
```

Clips can have different sizes and frame rates; everything gets matched to the first clip.
Order matters: they are joined in the order you list them.

## The normal workflow

1. Record your takes on your phone.
2. `python stitch.py take1.mp4 take2.mp4 take3.mp4 -o raw.mp4`
3. `python edit.py raw.mp4 --dry-run` and read what it wants to cut.
4. `python edit.py raw.mp4 -o final.mp4`
5. Watch final.mp4 before posting. The tool is good, your eyes are the final check.

## Troubleshooting

- "ffmpeg not found": install ffmpeg (step 2 above) and reopen your terminal.
- First run is slow: it is downloading the speech model. Only happens once.
- It cut a word it should not have: raise `--silence`, or use `--keep-fillers`, or edit
  the filler list. The report file shows exactly why every cut happened.
- A clip has no speech (b-roll): edit only trims leading/trailing silence, that is expected.

Your original files are never touched. Every output is a new file.
