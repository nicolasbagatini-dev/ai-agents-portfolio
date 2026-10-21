#!/usr/bin/env bash
# PreToolUse hook (Bash): non-blocking security nudge.
# When a command touches authorization or exposure (SQL GRANT/RLS/policy,
# opening a port, a public reverse-proxy route, an open WordPress REST
# permission), inject a short checklist into the agent's context.
# Narrow keywords on purpose: low false positives, never blocks the session.
# Why: grants run over ssh + psql are invisible to file-based hooks.

set -euo pipefail

INPUT=$(cat 2>/dev/null || echo "")
[ -z "$INPUT" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
[ "$TOOL" = "Bash" ] || exit 0

CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$CMD" ] && exit 0

# Each keyword is a real authorization or exposure action.
PATTERN='GRANT |REVOKE |CREATE POLICY|DROP POLICY|ALTER POLICY|ENABLE ROW LEVEL|DISABLE ROW LEVEL|CREATE TABLE|security_invoker|SECURITY DEFINER|ufw (allow|disable|delete)|0\.0\.0\.0:|Host\(`|permission_callback|__return_true'

echo "$CMD" | grep -qiE "$PATTERN" || exit 0

MSG="Security pass (security by design, not retrofit):
This command changes authorization or exposure. Before running, confirm:
- Which role gains access? (anon = public, authenticated = any logged user). Is it the minimum needed?
- Sensitive table or view: RLS on? View with security_invoker=true? (otherwise it bypasses RLS)
- Does it open a port or route? Exposed to whom on the internet? Blast radius?
- Re-test from outside afterwards (curl with the public key) to confirm it is closed.
Non-blocking reminder: proceed if already considered."

jq -n --arg msg "$MSG" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: $msg
  }
}'
