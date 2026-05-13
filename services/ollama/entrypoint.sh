#!/bin/bash
# ============================================================
# Birdy — Ollama self-provisioning entrypoint
# ============================================================
# Lifecycle:
#   1. Start Ollama server in background
#   2. Wait for API readiness
#   3. Pull any missing required models (idempotent)
#   4. Write readiness file
#   5. Stay running (wait on Ollama PID)
#
# Models persist across deployments via Railway volume at /root/.ollama
# so pulls only happen once per model per volume lifecycle.
# ============================================================

set -euo pipefail

OLLAMA_HOST="${OLLAMA_HOST:-0.0.0.0}"
OLLAMA_API="http://localhost:11434"
READY_FILE="/tmp/ollama_ready"
LOG_PREFIX="[ollama-init]"

# Models pulled on first boot; order matters — smallest first for fastest initial readiness
REQUIRED_MODELS=(
  "nomic-embed-text"   # 274 MB — embedding model, needed for RAG
  "phi4"               # ~9 GB  — utility/summarization model
  "deepseek-coder-v2:16b"  # ~9 GB  — coding assistant
  "qwen3:32b"          # ~20 GB — general reasoning
)

log()  { echo "${LOG_PREFIX} $(date -u +'%H:%M:%S') INFO  $*"; }
warn() { echo "${LOG_PREFIX} $(date -u +'%H:%M:%S') WARN  $*"; }
err()  { echo "${LOG_PREFIX} $(date -u +'%H:%M:%S') ERROR $*" >&2; }

# ── Start Ollama in background ─────────────────────────────────────────────
log "Starting Ollama server (OLLAMA_HOST=${OLLAMA_HOST})"
OLLAMA_HOST="${OLLAMA_HOST}" ollama serve &
OLLAMA_PID=$!
log "Ollama PID: ${OLLAMA_PID}"

# ── Wait for API readiness ─────────────────────────────────────────────────
log "Waiting for Ollama API..."
WAIT_SECS=0
until curl -sf "${OLLAMA_API}/api/tags" > /dev/null 2>&1; do
  if ! kill -0 "${OLLAMA_PID}" 2>/dev/null; then
    err "Ollama process died unexpectedly"
    exit 1
  fi
  sleep 2
  WAIT_SECS=$((WAIT_SECS + 2))
  if [ "${WAIT_SECS}" -gt 120 ]; then
    err "Ollama API did not become ready within 2 minutes"
    exit 1
  fi
done
log "Ollama API ready after ${WAIT_SECS}s"

# ── Provision required models ──────────────────────────────────────────────
MODELS_READY=0
MODELS_TOTAL=${#REQUIRED_MODELS[@]}
FAILED_MODELS=()

for MODEL in "${REQUIRED_MODELS[@]}"; do
  MODEL_NAME=$(echo "${MODEL}" | cut -d':' -f1)
  # Check if model is already available (persistent volume)
  if ollama list 2>/dev/null | grep -q "^${MODEL_NAME}"; then
    log "✓ ${MODEL} — already available (cached)"
    MODELS_READY=$((MODELS_READY + 1))
    continue
  fi

  log "⬇ Pulling ${MODEL} (this may take several minutes on first boot)..."
  if ollama pull "${MODEL}" 2>&1; then
    log "✓ ${MODEL} — pull complete"
    MODELS_READY=$((MODELS_READY + 1))
  else
    warn "✗ ${MODEL} — pull failed (service will run with degraded capability)"
    FAILED_MODELS+=("${MODEL}")
  fi
done

# ── Write readiness status ─────────────────────────────────────────────────
READY_JSON="{\"ready\":true,\"models_ready\":${MODELS_READY},\"models_total\":${MODELS_TOTAL},\"failed\":$(printf '%s' "${FAILED_MODELS[@]+"${FAILED_MODELS[@]}"}" | python3 -c 'import sys,json; items=sys.stdin.read().split(); print(json.dumps(items))'),\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
echo "${READY_JSON}" > "${READY_FILE}"
log "Readiness file written: ${READY_JSON}"

if [ ${#FAILED_MODELS[@]} -eq 0 ]; then
  log "🚀 All ${MODELS_TOTAL} models ready. Birdy RAG + memory fully operational."
else
  warn "⚠  ${MODELS_READY}/${MODELS_TOTAL} models ready. Failed: ${FAILED_MODELS[*]}"
  warn "    Birdy will operate with degraded capability."
fi

# ── Keep running ───────────────────────────────────────────────────────────
log "Handing off to Ollama process (PID ${OLLAMA_PID})"
wait "${OLLAMA_PID}"
