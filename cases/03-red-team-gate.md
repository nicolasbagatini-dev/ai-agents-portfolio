# Case 3: Red-team gate for conversational agents

## Problem

Conversational agents for end customers (sales and service triage) reach the public. A single prompt leak or persona break is a product failure and exposes attack surface.

## The gate

A reusable battery of adversarial prompts, each with the expected behavior written below it. It runs in the test chat before go-live. **Any failure blocks the launch.**

Current coverage: **instruction and persona extraction.** It has a short "influencer style" prompt and a full 10-dimension version that asks for prior instructions, goals, tools, refusal rules, memory, RAG, reasoning flow and hidden trigger words. The expected behavior is to stay in persona and reveal nothing about how the agent is built.

New categories are added as new attack vectors show up in real conversations, instead of guessing them upfront.

## Results

- Applied to a service-triage agent before its launch. Behavior bugs found in testing (for example, the model repeating an offer the user had already refused) were logged with root cause and fix.
- The same suite validated the anti-injection blocks of the sales agent in [case 2](02-whatsapp-sales-agent.md).
