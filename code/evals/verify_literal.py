#!/usr/bin/env python3
"""Check that an LLM extraction never invents text.

Input: the original text and the model output as JSON:
  {"slices": [{"label": "...", "text": "...", "marks": [{"label": "...", "text": "..."}]}]}

Rules checked without any model:
  1. every slice is a literal substring of the original
  2. slices joined in order rebuild the whole original (nothing dropped)
  3. every mark is a literal substring of its own slice
  4. every label belongs to the allowed list

Usage: verify_literal.py original.txt output.json
Exit code 0 when everything passes, 1 otherwise.
"""
import json
import re
import sys
import unicodedata

LABELS = {"company", "context", "responsibilities", "hard_skills", "experience",
          "team", "contract", "salary", "tools", "rest"}

QUOTES = str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'"})


def norm(s):
    """Models straighten quotes and collapse spaces while copying: undo that before comparing."""
    return re.sub(r"\s+", " ", s.translate(QUOTES)).strip()


def norm_label(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.lower().strip()


def verify(original, output):
    errors = []
    orig = norm(original)
    pos = 0
    for i, sl in enumerate(output["slices"]):
        label, text = norm_label(sl["label"]), norm(sl["text"])
        if label not in LABELS:
            errors.append(f"slice {i}: unknown label '{sl['label']}'")
        found = orig.find(text, pos)
        if found == -1:
            errors.append(f"slice {i}: not literal or out of order: {text[:60]!r}")
            continue
        if orig[pos:found].strip():
            errors.append(f"slice {i}: text dropped before it: {orig[pos:found][:60]!r}")
        pos = found + len(text)
        for j, mark in enumerate(sl.get("marks", [])):
            if norm(mark["text"]) not in text:
                errors.append(f"slice {i} mark {j}: not inside its slice: {mark['text'][:60]!r}")
            if norm_label(mark["label"]) not in LABELS:
                errors.append(f"slice {i} mark {j}: unknown label '{mark['label']}'")
    if orig[pos:].strip():
        errors.append(f"text dropped at the end: {orig[pos:][:60]!r}")
    return errors


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as f:
        original = f.read()
    with open(sys.argv[2], encoding="utf-8") as f:
        output = json.load(f)
    errors = verify(original, output)
    for e in errors:
        print(e)
    print("PASS" if not errors else f"FAIL ({len(errors)} errors)")
    sys.exit(1 if errors else 0)
