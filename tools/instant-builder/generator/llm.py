"""
llm.py

Free-only LLM access for the site generator, routed through the local OmniRoute
gateway so a rate limit or outage on one provider does not stop a build.

MONEY RULE: this module never touches a paid key. It talks to OmniRoute on
localhost, which is deliberately run from the home directory so it cannot pick
up the project .env containing paid Anthropic and OpenAI keys. The direct
fallbacks use GROQ_API_KEY and GEMINI_API_KEY, both free tier.

Two gotchas are baked in because both cost real debugging time:
  - OmniRoute streams by default. Without "stream": false the body comes back as
    SSE `data:` chunks and json.loads fails at character 0.
  - Groq sits behind Cloudflare, which rejects Python's default user agent with
    an opaque `error code: 1010`. Every request here sends a browser UA.
"""

import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

OMNIROUTE_URL = "http://localhost:20128/v1/chat/completions"
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)

# Tried in order until one returns parseable JSON. OmniRoute's auto/ combos
# already fail over between providers internally, so they lead; the named
# models are the backstop if the gateway itself is down.
MODEL_CASCADE = [
    ("omniroute", "auto/best-free"),
    ("omniroute", "gemini/gemini-2.5-flash"),
    ("omniroute", "auto/fast"),
    ("groq", "qwen/qwen3.8-27b"),
    ("gemini", "gemini-2.5-flash"),
]


class LLMError(RuntimeError):
    pass


def _load_env():
    """Reads free keys from the Agentic Workflows .env without importing it."""
    env_path = Path(os.environ.get("LLM_ENV", Path.home() / ".env"))
    if not env_path.is_file():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        # Only free providers are ever pulled into the process environment.
        if key in ("GROQ_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY"):
            os.environ.setdefault(key, value.strip().strip('"').strip("'"))


_load_env()


def _post(url, payload, headers, timeout):
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={**headers, "User-Agent": BROWSER_UA, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read())


def _call_openai_shaped(url, model, prompt, api_key, timeout, temperature):
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "stream": False,
    }
    headers = {"Authorization": f"Bearer {api_key}"}
    data = _post(url, payload, headers, timeout)
    return data["choices"][0]["message"]["content"] or ""


def _call_gemini(model, prompt, api_key, timeout, temperature):
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}"
        f":generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": temperature,
        },
    }
    data = _post(url, payload, {}, timeout)
    return data["candidates"][0]["content"]["parts"][0]["text"] or ""


def _strip_fences(text):
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1] if "\n" in cleaned else cleaned
        cleaned = cleaned.removeprefix("json").strip()
        if cleaned.endswith("```"):
            cleaned = cleaned[: cleaned.rfind("```")]
    return cleaned.strip()


def generate_json(prompt, timeout=120, temperature=0.5, verbose=True):
    """
    Runs the prompt through the cascade and returns (parsed_json, model_used).

    Raises LLMError only when every provider fails, so a single provider being
    rate limited is invisible to the caller.
    """
    attempts = []
    for provider, model in MODEL_CASCADE:
        started = time.time()
        try:
            if provider == "omniroute":
                raw = _call_openai_shaped(
                    OMNIROUTE_URL, model, prompt, "local", timeout, temperature
                )
            elif provider == "groq":
                key = os.environ.get("GROQ_API_KEY")
                if not key:
                    raise LLMError("GROQ_API_KEY not set")
                raw = _call_openai_shaped(
                    "https://api.groq.com/openai/v1/chat/completions",
                    model, prompt, key, timeout, temperature,
                )
            elif provider == "gemini":
                key = os.environ.get("GEMINI_API_KEY")
                if not key:
                    raise LLMError("GEMINI_API_KEY not set")
                raw = _call_gemini(model, prompt, key, timeout, temperature)
            else:
                continue

            parsed = json.loads(_strip_fences(raw))
            elapsed = time.time() - started
            if verbose:
                print(f"  generated via {provider}/{model} in {elapsed:.1f}s")
            return parsed, f"{provider}/{model}"

        except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError,
                KeyError, TimeoutError, LLMError, OSError) as error:
            detail = str(error)
            if isinstance(error, urllib.error.HTTPError):
                try:
                    detail = f"{error.code} {error.read()[:160].decode(errors='replace')}"
                except Exception:
                    detail = str(error.code)
            attempts.append(f"{provider}/{model}: {detail[:200]}")
            if verbose:
                print(f"  {provider}/{model} failed, trying next: {detail[:120]}")
            continue

    raise LLMError("every free model failed:\n  " + "\n  ".join(attempts))
