# Case 1: Cheap-model extraction with mechanical evals

## Problem

A job-market research project collected thousands of job postings in Portuguese (8,251 at the latest count). Each posting is free text that had to become structured fields (responsibilities, hard skills, years of experience, contract type, salary, tools). Running a strong model on every posting was too expensive.

## Approach

1. **Close the fields before writing the prompt.** The first draft had 22 fields. It closed at 11, keeping only fields that answer a question someone will ask later.
2. **Gold set first.** 5 postings labeled by the strong model, then the cheap model (Haiku) on the same 5, then a script comparing both field by field. Each prompt change is re-tested on 5 new postings, so the prompt cannot memorize the sample.
3. **A lock that makes hallucination detectable.** Every value is a contiguous, literal slice of the input. The slices, joined in order, must rebuild the whole text. A `rest` field catches everything that fits nowhere else, and content that repeats in `rest` across many items reveals a missing field. See [`verify_literal.py`](../code/evals/verify_literal.py).
4. **Two layers.** A coarse *slice* covers the text, and a fine *mark* inside it carries data such as "5 to 8 years". This avoids losing fine fields inside bigger blocks.

## Measured results

Headless engine: `claude -p --model haiku`, same 20 postings in each setup.

| Setup | Tokens/item | USD/item | Pass literal check | Coverage |
| --- | --- | --- | --- | --- |
| 1 item per call, thinking on | 52.6k | 0.12 | 9 of 10 | 99% |
| 5 per call, thinking on | 12.2k | 0.030 | 12 of 20 | 91% |
| 5 per call, thinking off | 10.1k | 0.022 | 3 of 20 | 79% |

- Batching cut cost 4x: most of the per-call weight was the harness prompt, not the input.
- Turning thinking off saved tokens but destroyed quality, so it stayed on.
- A cheap pre-filter (title keywords, language, duplicates) cut 3,835 postings to 1,946 before any token was spent.
- After 271 postings were sliced, the final analysis moved to regex, using the 271 model outputs as the gold set. **Measured regex error: 1.7% false positives, 2% false negatives.** Two regex rules were fixed because of it.

## Failure modes found and fixed

| Cheap-model error | Fix |
| --- | --- |
| Never leaves a field empty (fills from metadata) | Prompt: empty is a valid result |
| Matches by word, not meaning ("experience with tool X" goes to years) | Prompt: field only accepts a number of years |
| Stops at the first labeled block | Prompt: field receives every block on that subject |
| Rewrites scattered text into its own sentence | Script rejects any non-literal slice |
| Normalizes quotes and accents while copying | Script normalizes before comparing |
