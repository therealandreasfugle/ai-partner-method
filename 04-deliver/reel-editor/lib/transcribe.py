"""Speech to word timestamps via faster-whisper (downloads the model on first run)."""
import sys

# Nudges whisper to actually write the fillers down instead of cleaning them up,
# which is exactly backwards from every other use of whisper.
FILLER_PROMPT = "Um, uh, erm, you know, I mean, so, like."


def transcribe(path, model_size="small"):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("faster-whisper is missing. Run: pip install -r requirements.txt")
    print("Transcribing with whisper '%s' (first run downloads the model)..." % model_size)
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _info = model.transcribe(path, word_timestamps=True, vad_filter=True,
                                       initial_prompt=FILLER_PROMPT)
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append({"word": w.word.strip(), "start": float(w.start),
                          "end": float(w.end)})
    return words
