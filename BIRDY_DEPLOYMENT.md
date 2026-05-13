# Birdy — Production Alpha Deployment Guide

## Service topology

```
Internet
    │
    ▼
[nginx service]          ← rate limiting, SSE proxy, gzip
  port 8080 (public)
    │ (Railway private network)
    ▼
[web service]            ← Next.js 14, Prisma, Birdy UI + API
  port 3000 (internal)
    │
    ├──► [PostgreSQL]    ← Railway Postgres plugin (pgvector included)
    ├──► [Redis]         ← Railway Redis plugin (optional — agent queue)
    └──► [ollama service]← Custom Docker, auto-provisions models
           port 11434 (internal)
           volume: /root/.ollama (50 GB+)
```

---

## Railway environment variables

### web service (required)

| Variable | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Get from console.anthropic.com |
| `DATABASE_URL` | From Railway Postgres plugin | Auto-set if using plugin |
| `NEXTAUTH_SECRET` | 32+ random chars | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.railway.app` | Your web service public URL |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.railway.app` | Same as above |
| `AIRTABLE_API_KEY` | Your Airtable key | |
| `AIRTABLE_BASE_ID` | `appGGFKuFxQ3Z0Wuz` | |
| `AIRTABLE_ROLES_TABLE` | `tblH6wo8yXqUYdKRi` | |
| `AIRTABLE_APPLICANTS_TABLE` | `tblCQ9I8odPZRKKfv` | |
| `UPLOADTHING_SECRET` | From uploadthing.com | |
| `UPLOADTHING_APP_ID` | From uploadthing.com | |
| `RESEND_API_KEY` | From resend.com | |

### web service (optional — enables Ollama models)

| Variable | Value | Notes |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://ollama.railway.internal:11434` | Set after Ollama service created |

### nginx service

| Variable | Value |
|---|---|
| `NEXTJS_UPSTREAM` | `web.railway.internal:3000` |

### ollama service

| Variable | Value |
|---|---|
| `OLLAMA_HOST` | `0.0.0.0` |

---

## Step-by-step Railway setup

### Step 1: Deploy the web service (already done)
Your main Next.js app is already deployed. Verify:
- `DATABASE_URL` is set (from Railway Postgres plugin)
- `ANTHROPIC_API_KEY` is set — **Birdy will not respond without this**

### Step 2: Enable pgvector (automatic)
pgvector activates on first health check (`/api/health`).
Railway Postgres includes the extension — no action needed.
Verify in logs: `[pgvector] Setup complete`

### Step 3: Deploy the Ollama service (enables RAG + memory)

1. In Railway project → **+ New Service → GitHub Repo**
2. Same repo, **Root Directory**: `services/ollama/`
3. Railway detects the Dockerfile
4. In the service → **Settings → Volumes** → **Add Volume**
   - Mount path: `/root/.ollama`
   - Size: **50 GB minimum** (qwen3:32b alone is ~20 GB)
5. Set environment variable: `OLLAMA_HOST=0.0.0.0`
6. In Railway project → **Settings → Networking → Private Networking** → Enable
7. In **web service** → Variables → Add: `OLLAMA_BASE_URL=http://ollama.railway.internal:11434`

**Model pull timeline (first boot):**
- `nomic-embed-text` (274 MB) → ~1 min → RAG/embeddings activate
- `phi4` (~9 GB) → ~15-20 min → memory summarization activates
- `deepseek-coder-v2:16b` (~9 GB) → ~15-20 min → code routing activates
- `qwen3:32b` (~20 GB) → ~40-60 min → reasoning routing activates

**During download:** Birdy routes all traffic to Claude (automatic fallback). No degraded experience for users.

### Step 4: Deploy the nginx service (recommended for production)

1. **+ New Service → GitHub Repo** → Root Directory: `nginx/`
2. Set variable: `NEXTJS_UPSTREAM=web.railway.internal:3000`
3. Add your production domain to the **nginx service** (not the web service)
4. Remove the public domain from the web service (internal only)

Without nginx: The web service works directly — just without network-level rate limiting.

### Step 5: Add Redis (optional — enables durable agent queue)

1. Railway project → **+ New** → **Database → Redis**
2. In web service → Variables → copy the `REDIS_URL` Railway provides
3. The agent queue automatically upgrades from in-process to Redis-backed

---

## Verification checklist

Run these checks after deployment:

```bash
# 1. Health check
curl https://your-app.railway.app/api/health
# Expected: {"status":"ok","checks":{"database":"ok","pgvector":"ok"}}

# 2. Birdy chat (replace with your session ID)
curl -X POST https://your-app.railway.app/api/birdy/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","sessionId":"test-123"}' \
  --no-buffer
# Expected: SSE stream with data: {"conversationId":"..."} then data: {"delta":"..."} events

# 3. Admin status
curl https://your-app.railway.app/api/birdy/admin
# Expected: JSON with infrastructure.claude.configured: true

# 4. Ollama (once deployed)
curl http://ollama.railway.internal:11434/api/tags  # from within Railway network
# Expected: {"models":[{"name":"nomic-embed-text:latest",...}]}
```

---

## Operational runbook

### Birdy isn't responding
1. Check `ANTHROPIC_API_KEY` is set in Railway web service variables
2. Check `/api/health` → should return 200
3. Check Railway deployment logs for startup errors

### RAG/semantic search not working
1. Check Ollama service is deployed and healthy
2. Check `OLLAMA_BASE_URL` is set in web service
3. Open Birdy → Admin tab → Infrastructure → Ollama models should show "Ready"
4. Upload a test document → Knowledge tab → wait for READY status
5. Try a semantic search

### Memory summarization not running
- Requires `phi4` model to be available in Ollama
- Check Admin tab → Ollama models → phi4: Ready
- Memory only triggers after 15+ messages in a conversation

### Models still downloading
- Check Ollama service logs: `[ollama-init] ⬇ Pulling phi4...`
- All Birdy features work — traffic routes to Claude during pull
- Model persistence: once downloaded to the Railway volume, models survive deploys

### Database connection errors
- Check `DATABASE_URL` is set and correct
- Railway Postgres connection limit: ~97 connections
- Birdy caps at 5 via `lib/prisma.ts` — safe for multiple concurrent users

### Streaming not working through nginx
- Check nginx config has `proxy_buffering off` for `/api/birdy/chat`
- Check `X-Accel-Buffering: no` header is present in response
- Verify `NEXTJS_UPSTREAM` is set correctly in nginx service

---

## Feature availability matrix

| Feature | Without Ollama | With nomic-embed-text | With phi4 | With all models |
|---|---|---|---|---|
| AI Chat (Claude) | ✅ | ✅ | ✅ | ✅ |
| Document upload | ✅ | ✅ | ✅ | ✅ |
| Full-text search | ✅ | ✅ | ✅ | ✅ |
| Semantic/vector search | ❌ | ✅ | ✅ | ✅ |
| RAG in chat | ❌ | ✅ | ✅ | ✅ |
| Memory summarization | ❌ | ❌ | ✅ | ✅ |
| Code routing (deepseek) | ❌ | ❌ | ❌ | ✅ |
| Reasoning routing (qwen3) | ❌ | ❌ | ❌ | ✅ |
| Fast utility (phi4) | ❌ | ❌ | ✅ | ✅ |
| Quick Actions (via Claude) | ✅ | ✅ | ✅ | ✅ |
| Agent workflows | ✅ | ✅ | ✅ | ✅ |
| Admin panel | ✅ | ✅ | ✅ | ✅ |

---

## Daily usage guide

### Opening Birdy
- Click the 🐦 button (bottom-right)
- Or press **⌘/** (Mac) / **Ctrl+/** (Windows)

### Chat
- Type any question and press Enter
- Shift+Enter for new line
- Type **/** to see slash commands (/summarize, /draft, /analyze, /search, /plan)

### Quick Actions
- Switch to the **Actions** tab (⚡)
- Click any card — it pre-fills and sends the prompt automatically
- Actions are context-aware (role data is auto-injected)

### Knowledge base
- Switch to **Knowledge** tab (📚)
- Click **+ Upload document** → select PDF, Word, Markdown, or text
- Wait for status to turn ✅ READY (usually 1-5 minutes)
- Use the search bar to test semantic search
- Once documents are indexed, Birdy auto-retrieves relevant content in chat

### Activity monitoring
- Switch to **Activity** tab (📊)
- Shows per-request stats: model used, tokens, latency, RAG chunks
- Click ↻ Refresh to update (auto-refreshes every 30s)

### Admin panel
- Switch to **Admin** tab (⚙️)
- Infrastructure: service health, Ollama model status
- Routing: current model routing table
- Performance: P50/P95 latency, 24h usage stats
