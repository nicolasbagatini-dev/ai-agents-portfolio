# AI Agents & Automation Portfolio

**Nícolas Bagatini** · Web developer and AI automation specialist · Brazil (remote)
[nicolasbagatini.dev](https://nicolasbagatini.dev)

I build, operate and harden AI agents and LLM pipelines: conversational agents on WhatsApp, cheap-model extraction at scale with measurable error rates, adversarial test gates before go-live, and Claude Code set up as an operating system for day-to-day engineering work.

Client names and private data are omitted. Numbers are the ones measured in production or in the pilot runs described.

## Case studies

| # | Case | What it shows | Stack |
| --- | --- | --- | --- |
| 1 | [Cheap-model extraction with mechanical evals](cases/01-llm-extraction-evals.md) | Eval design against a gold set, cost per item, measured false positive / false negative | Claude Code headless (Haiku), Python |
| 2 | [WhatsApp sales agent in production](cases/02-whatsapp-sales-agent.md) | Tool-using agent, prompt-injection defense, latency tuning | n8n, Claude Sonnet, LangChain, Postgres, Redis |
| 3 | [Red-team gate for conversational agents](cases/03-red-team-gate.md) | Adversarial prompt battery that blocks go-live | Prompt suites, simulated attacker model |
| 4 | [Claude Code as an engineering OS](cases/04-claude-code-ops.md) | Hooks, skills, subagents, usage telemetry | Claude Code hooks, Bash, Python, React, Supabase |

## Code samples

- [`code/evals/verify_literal.py`](code/evals/verify_literal.py): the anti-hallucination check from case 1. Every extracted value must be a literal slice of the input, and the slices must rebuild the whole text.
- [`code/hooks/security-command-nudge.sh`](code/hooks/security-command-nudge.sh): Claude Code hook I run daily. It injects a security checklist when a command changes authorization or exposure.

## How I work with agents

- **Measure before scaling.** Calibrate on 5 items against a strong-model gold set, then run the cheap model, then compare by script, field by field.
- **Make hallucination checkable, not forbidden.** "Don't invent" does not hold a cheap model. A task whose output can be verified without a model does.
- **Ask if regex answers before paying for tokens.** Model output becomes the gold set to measure the regex error.
- **No go-live without the red-team suite passing.**
