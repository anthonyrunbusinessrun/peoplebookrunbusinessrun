#!/bin/bash
# ============================================================
# Birdy — Deployment Validation Script
# Run from your local machine after deploying to Railway.
# Usage: BASE_URL=https://your-app.railway.app bash scripts/validate-deployment.sh
# ============================================================

set -euo pipefail

BASE_URL="${BASE_URL:-https://peoplebook.railway.app}"
SESSION_ID="validate-$(date +%s)"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}✗${NC} $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

echo ""
echo "🐦 Birdy Deployment Validation"
echo "   Base URL: $BASE_URL"
echo "   Session:  $SESSION_ID"
echo ""

# ── 1. Health check ──────────────────────────────────────────────────────────
echo "── Infrastructure ──────────────────────────────────────"
HEALTH=$(curl -sf "$BASE_URL/api/health" 2>/dev/null || echo '{}')
STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','unknown'))" 2>/dev/null || echo "error")

if [ "$STATUS" = "ok" ]; then
  ok "Health check: $STATUS"
else
  fail "Health check: $STATUS ($(echo $HEALTH | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checks',{}))" 2>/dev/null))"
fi

DB=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checks',{}).get('database',{}).get('status','unknown'))" 2>/dev/null || echo "unknown")
[ "$DB" = "ok" ] && ok "Database: connected" || fail "Database: $DB"

PGV=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checks',{}).get('pgvector',{}).get('status','unknown'))" 2>/dev/null || echo "unknown")
[ "$PGV" = "ok" ] && ok "pgvector: ready" || warn "pgvector: $PGV"

CLAUDE=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checks',{}).get('claude',{}).get('status','unknown'))" 2>/dev/null || echo "unknown")
[ "$CLAUDE" = "ok" ] && ok "Claude API: configured" || fail "Claude API: NOT CONFIGURED — set ANTHROPIC_API_KEY"

OLLAMA=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checks',{}).get('ollama',{}).get('status','unknown'))" 2>/dev/null || echo "unknown")
[ "$OLLAMA" = "ok" ] && ok "Ollama: connected" || warn "Ollama: $OLLAMA (Claude fallback active)"

echo ""
echo "── Chat streaming ──────────────────────────────────────"
STREAM_OUTPUT=$(curl -sf -X POST "$BASE_URL/api/birdy/chat" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"reply with exactly the word: PONG\",\"sessionId\":\"$SESSION_ID\"}" \
  --max-time 30 2>/dev/null || echo "")

if echo "$STREAM_OUTPUT" | grep -q "conversationId"; then
  ok "SSE stream: first event received"
  CONV_ID=$(echo "$STREAM_OUTPUT" | grep "data:" | head -1 | python3 -c "import sys,json; d=json.load(sys.stdin.read().split('data: ')[1] if 'data: ' in sys.stdin.read() else '{}'); print(d.get('conversationId',''))" 2>/dev/null || echo "")
else
  fail "SSE stream: no response (check ANTHROPIC_API_KEY)"
fi

if echo "$STREAM_OUTPUT" | grep -q '"done":true'; then
  ok "SSE stream: completed successfully"
else
  warn "SSE stream: done event not detected in output"
fi

echo ""
echo "── Conversation API ─────────────────────────────────────"
CONVS=$(curl -sf "$BASE_URL/api/birdy/conversations?sessionId=$SESSION_ID" 2>/dev/null || echo '{}')
COUNT=$(echo "$CONVS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('conversations',[])))" 2>/dev/null || echo "0")
[ "$COUNT" -gt 0 ] && ok "Conversations: $COUNT found" || warn "Conversations: none (may be expected on first call)"

echo ""
echo "── Knowledge API ────────────────────────────────────────"
DOCS=$(curl -sf "$BASE_URL/api/birdy/knowledge?sessionId=$SESSION_ID" 2>/dev/null || echo '{}')
if echo "$DOCS" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'documents' in d" 2>/dev/null; then
  ok "Knowledge API: responding"
else
  fail "Knowledge API: unexpected response"
fi

echo ""
echo "── Activity API ─────────────────────────────────────────"
ACT=$(curl -sf "$BASE_URL/api/birdy/activity?sessionId=$SESSION_ID" 2>/dev/null || echo '{}')
if echo "$ACT" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'activity' in d" 2>/dev/null; then
  ok "Activity API: responding"
else
  fail "Activity API: unexpected response"
fi

echo ""
echo "── Admin API ────────────────────────────────────────────"
ADMIN=$(curl -sf "$BASE_URL/api/birdy/admin" 2>/dev/null || echo '{}')
if echo "$ADMIN" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'infrastructure' in d" 2>/dev/null; then
  ok "Admin API: responding"
  WFS=$(echo "$ADMIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('platform',{}).get('workflows',[])))" 2>/dev/null || echo "0")
  ok "Workflows registered: $WFS"
else
  fail "Admin API: unexpected response"
fi

echo ""
echo "── Agent workflow ───────────────────────────────────────"
TASK=$(curl -sf -X POST "$BASE_URL/api/birdy/agents/run" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"workflowId\":\"knowledge-summary\",\"input\":{\"topic\":\"test\"}}" \
  --max-time 10 2>/dev/null || echo '{}')

TASK_ID=$(echo "$TASK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('taskId',''))" 2>/dev/null || echo "")
if [ -n "$TASK_ID" ]; then
  ok "Agent task queued: $TASK_ID"
else
  fail "Agent task: failed to queue"
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo -e "  ${GREEN}PASS${NC}: $PASS   ${RED}FAIL${NC}: $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}🚀 Birdy is fully operational!${NC}"
elif [ "$FAIL" -le 1 ]; then
  echo -e "${YELLOW}⚠  Birdy is mostly operational — review failures above.${NC}"
else
  echo -e "${RED}✗  Birdy has critical failures — review above.${NC}"
  echo ""
  echo "Most common fixes:"
  echo "  1. Set ANTHROPIC_API_KEY in Railway web service variables"
  echo "  2. Verify DATABASE_URL is connected (Railway Postgres plugin)"
  echo "  3. Check Railway deployment logs for build errors"
fi
echo ""
