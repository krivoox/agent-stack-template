#!/usr/bin/env bash
# Documentation drift guard.
#
# Product code and the documents that describe it fall out of sync one commit at
# a time. When a turn touched features, auth, middleware or the schema without
# touching any document, ask for a follow-up before the turn closes.
#
# Requires `jq`. Fails open: any unexpected condition returns an empty object so
# the agent is never blocked by this hook.
set -euo pipefail

input=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  echo '{}'
  exit 0
fi

status=$(printf '%s' "$input" | jq -r '.status // empty')
loop_count=$(printf '%s' "$input" | jq -r '.loop_count // 0')

[[ "$status" == "completed" ]] || { echo '{}'; exit 0; }

# One follow-up per turn chain, otherwise this loops forever.
[[ "${loop_count}" -lt 1 ]] || { echo '{}'; exit 0; }

root=$(printf '%s' "$input" | jq -r '.workspace_roots[0] // empty')
[[ -n "$root" && -d "$root" ]] || root="$(pwd)"
cd "$root"

command -v git >/dev/null 2>&1 || { echo '{}'; exit 0; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo '{}'; exit 0; }

changed=$(
  {
    git diff --name-only HEAD 2>/dev/null || true
    git diff --name-only --cached 2>/dev/null || true
    git ls-files --others --exclude-standard 2>/dev/null || true
  } | sort -u
)

[[ -n "$changed" ]] || { echo '{}'; exit 0; }

product_hit=$(printf '%s\n' "$changed" | grep -E '^(src/features/|src/domain/|src/lib/auth\.ts|src/middleware\.ts|prisma/)' || true)
docs_hit=$(printf '%s\n' "$changed" | grep -E '^(docs/|\.cursor/rules/|AGENTS\.md|DESIGN\.md)' || true)

if [[ -n "$product_hit" && -z "$docs_hit" ]]; then
  jq -n --arg msg "$(cat <<'EOF'
This turn changed product code (features, domain, auth, middleware or schema)
without touching any documentation.

Before closing, check whether these still describe reality:
- the relevant spec in docs/specs/
- docs/domain-model.md, if the model changed
- docs/architecture.md, if a layer or pattern changed
- docs/adr/, if a structural decision was made

Do not document features that were not implemented. If nothing needs updating,
say so explicitly and why.
EOF
)" '{followup_message: $msg}'
  exit 0
fi

echo '{}'
exit 0
