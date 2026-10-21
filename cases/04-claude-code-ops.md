# Case 4: Claude Code as an engineering OS

## Problem

I run several client websites and internal systems alone, many of them in production with no staging. I needed the AI coding agent to be fast, but never to act on production without approval, repeat a past mistake or quietly burn tokens.

## What I built

- **Hooks on every lifecycle event** (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop). They block edits without approval, nudge a security checklist when a command touches authorization or opens a port, catch case-collision bugs on case-insensitive file systems, lint PHP after every write, and warn about context usage.
- **50+ skills** for repeatable work: passive site audits for prospecting (platform, headers, DNS, Lighthouse), WhatsApp audio transcription with local Whisper, email sending with open/click tracking, Elementor editing over SSH with backup and rollback.
- **Subagents** for parallel research and validation (for example, an Elementor JSON validator before any production write).
- **Usage telemetry:** a hook records each session (tokens without cache, minutes, commits) to Supabase, and a React dashboard shows cost and time per person, with no conversation text stored.

## Measured result

The approval gate logged 114 "violations" at first. Reading the log showed that **73 of the 114 were false positives**: an edit made right after the user approved it was still flagged. I fixed the rule instead of living with the noise, because a gate that cries wolf gets ignored.

Code samples: [`code/hooks/`](../code/hooks/).
