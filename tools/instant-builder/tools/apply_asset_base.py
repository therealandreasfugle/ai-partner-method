#!/usr/bin/env python3
"""
apply_asset_base.py

One-shot codemod for the preview app: prefixes every per-client image path with
the runtime asset base `A` so a single deployed bundle can serve a different
photo set per client preview.

Rewrites three call shapes and nothing else:
    1. JSX attribute      src="/hero-image.webp"     -> src={A + "/hero-image.webp"}
    2. Template literal    `/work/${p.filename}`     -> A + `/work/${p.filename}`
    3. Plain JS string     el.src = '/logo.svg'      -> el.src = A + '/logo.svg'

Only paths under CLIENT_PATHS are touched. Shared chrome (/patterns, /platforms,
/badges, /favicon.svg) is identical for every client and is deliberately left
alone. Idempotent: a path already preceded by `A + ` is skipped.

Run from anywhere; prints a per-file summary. Verify with `npm run build` and a
browser check afterwards.
"""

import os
import re
import sys
from pathlib import Path

APP = Path(os.environ.get("PREVIEW_APP", Path(__file__).resolve().parents[1] / "preview-app"))
SRC = APP / "src"

# Per-client image paths only. Anything not matching these stays untouched.
CLIENT_PATHS = r"(?:hero-image-mobile\.webp|hero-image\.webp|owner\.webp|logo\.webp|logo\.svg|work/[^\"'`]*|sections/[^\"'`]*)"

JSX_ATTR = re.compile(
    r'\b(src|srcSet|poster)=(["\'])(/' + CLIENT_PATHS + r')\2'
)
TEMPLATE_LIT = re.compile(
    r'(?<!A \+ )`(/(?:work|sections)/[^`]*)`'
)
PLAIN_STRING = re.compile(
    r'(?<!A \+ )(?<![\w.])(["\'])(/' + CLIENT_PATHS + r')\1'
)

IMPORT_LINE = "import {{ A }} from '{rel}/config/asset-base'\n"


def rel_import(path: Path) -> str:
    """Relative import prefix from a file in src/** back to src/."""
    depth = len(path.relative_to(SRC).parts) - 1
    return "." if depth == 0 else "/".join([".."] * depth)


def add_import(text: str, path: Path) -> str:
    if "config/asset-base" in text:
        return text
    line = IMPORT_LINE.format(rel=rel_import(path))
    lines = text.splitlines(keepends=True)
    last_import = -1
    for i, l in enumerate(lines):
        if l.startswith("import "):
            last_import = i
    if last_import == -1:
        return line + text
    lines.insert(last_import + 1, line)
    return "".join(lines)


def main() -> int:
    if not SRC.is_dir():
        print(f"error: {SRC} not found", file=sys.stderr)
        return 1

    total = 0
    for path in sorted(SRC.rglob("*.jsx")) + sorted(SRC.rglob("*.js")):
        if "config/brand-dna" in str(path) or path.name == "asset-base.js":
            continue
        original = path.read_text()

        text, n1 = JSX_ATTR.subn(lambda m: f'{m.group(1)}={{A + {m.group(2)}{m.group(3)}{m.group(2)}}}', original)
        text, n2 = TEMPLATE_LIT.subn(lambda m: f'A + `{m.group(1)}`', text)
        text, n3 = PLAIN_STRING.subn(lambda m: f'A + {m.group(1)}{m.group(2)}{m.group(1)}', text)

        changed = n1 + n2 + n3
        if not changed:
            continue
        text = add_import(text, path)
        path.write_text(text)
        total += changed
        print(f"  {path.relative_to(SRC)}: {changed} ({n1} jsx, {n2} template, {n3} string)")

    print(f"total rewrites: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
