# Birdy — Exact Railway Deployment Runbook

**Project:** https://railway.com/project/d322220a-9e04-4644-9a0c-e6f0429dc859

---

## Current service status

| Service | Status | Action needed |
|---|---|---|
| **web** (Next.js) | ✅ Deployed | Set `ANTHROPIC_API_KEY` |
| **postgres** | ✅ Running | No action |
| **nginx** | ⬜ Not created | Create (optional but recommended) |
| **ollama** | ⬜ Not created | Create for RAG + memory |
| **redis** | ⬜ Not created | Create (optional — enables durable queue) |

---

## Step 1 — Set ANTHROPIC_API_KEY (do this right now — unlocks Birdy chat)

1. Open https://railway.com/project/d322220a-9e04-4644-9a0c-e6f0429dc859
2. Click your **web service** (the Next.js/peoplebook service)
3. Click **Variables** tab
4. Click **+ New Variable**
5. Name: `ANTHROPIC_API_KEY`
6. Value: your key from https://console.anthropic.com/settings/keys
7. Click **Add** → Railway redeploys automatically (~2 min)

**Verify:** Open TeamBase → click the 🐦 button → send "hello" → Birdy responds

---

## Step 2 — Verify database + pgvector

Open in browser:
```
https://YOUR-WEB-SERVICE.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "checks": {
    "database": {"status": "ok"},
    "pgvector": {"status": "ok"},
    "claude": {"status": "ok", "configured": true}
  }
}
```

If `pgvector.status` is `"error"`:
- Railway Postgres includes pgvector but it must be enabled
- In Railway → your Postgres service → **Query** tab → run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- Then redeploy the web service to trigger `ensureVectorSetup()`

---

## Step 3 — Create the Ollama service (enables RAG + memory)

### 3a. Create the service
1. Railway project → **+ New Service**
2. Select **GitHub Repo**
3. Same repo: `anthonyrunbusinessrun/peoplebookrunbusinessrun`
4. **Root Directory**: `services/ollama/`
5. Railway detects the Dockerfile → click **Deploy**

### 3b. Add a persistent volume (CRITICAL — without this models re-download every deploy)
1. Click the new Ollama service → **Settings** tab
2. Scroll to **Volumes** section → **Add Volume**
3. Mount path: `/root/.ollama`
4. Size: **50 GB** minimum (models are ~38 GB total)
5. Click **Create Volume**

### 3c. Set environment variable
1. Ollama service → **Variables** tab
2. Add: `OLLAMA_HOST` = `0.0.0.0`

### 3d. Enable private networking
1. Railway project → **Settings** → **Networking**
2. Toggle **Private Networking** → **Enable**
3. Each service now gets a `.railway.internal` private hostname

### 3e. Connect web service to Ollama
1. Web service → **Variables** tab
2. Add: `OLLAMA_BASE_URL` = `http://ollama.railway.internal:11434`
3. Railway redeploys the web service automatically

### 3f. What happens on first boot
```
[ollama-init] Starting Ollama server...
[ollama-init] Ollama API ready after 4s
[ollama-init] ⬇ Pulling nomic-embed-text (274 MB)...
[ollama-init] ✓ nomic-embed-text — pull complete    ← RAG activates here (~2 min)
[ollama-init] ⬇ Pulling phi4 (~9 GB)...
[ollama-init] ✓ phi4 — pull complete                ← Memory activates here (~20 min)
[ollama-init] ⬇ Pulling deepseek-coder-v2:16b...
[ollama-init] ✓ deepseek-coder-v2:16b — pull complete
[ollama-init] ⬇ Pulling qwen3:32b (~20 GB)...
[ollama-init] ✓ qwen3:32b — pull complete           ← Full stack ready (~60 min)
```

**During download:** Birdy routes everything to Claude. No user-visible degradation.
**After nomic-embed-text ready:** Semantic search and RAG work in the Knowledge tab.
**After phi4 ready:** Conversation memory summarization starts working.

---

## Step 4 — Create nginx service (recommended)

### 4a. Create the service
1. Railway project → **+ New Service → GitHub Repo**
2. Same repo, **Root Directory**: `nginx/`
3. Railway detects the Dockerfile

### 4b. Configure
1. nginx service → **Variables** → Add:
   - `NEXTJS_UPSTREAM` = `web.railway.internal:3000`
2. nginx service → **Settings → Networking → Public Networking**
   - Click **Generate Domain** or add your custom domain here
3. Web service → **Settings → Networking → Public Networking**
   - Remove the public domain (web service becomes internal only)
   - Keep port 3000 for internal access

### Without nginx (simpler):
Skip Step 4. The web service handles everything directly. Rate limiting is handled
by `lib/birdy/rate-limiter.ts`. This is fine for internal team usage.

---

## Step 5 — Create Redis service (optional)

Redis upgrades the agent task queue from in-process (restarts lost jobs) to durable.

1. Railway project → **+ New** → **Database → Add Redis**
2. Wait for provisioning (~30 seconds)
3. Railway auto-injects `REDIS_URL` into all services with private networking enabled
4. Web service → **Variables** — verify `REDIS_URL` appears automatically

---

## All required environment variables

### Web service — paste this list into Railway Variables

```
# REQUIRED — Birdy won't respond without this
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# REQUIRED — auto-set by Railway Postgres plugin
DATABASE_URL=postgresql://...  # (already set by Railway)

# REQUIRED — authentication
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=https://your-web-service.railway.app
NEXT_PUBLIC_APP_URL=https://your-web-service.railway.app

# REQUIRED — Airtable integration
AIRTABLE_API_KEY=patXXXXXXXXXXXX
AIRTABLE_BASE_ID=appGGFKuFxQ3Z0Wuz
AIRTABLE_ROLES_TABLE=tblH6wo8yXqUYdKRi
AIRTABLE_APPLICANTS_TABLE=tblCQ9I8odPZRKKfv

# REQUIRED — file uploads
UPLOADTHING_SECRET=sk_live_XXXXXXXX
UPLOADTHING_APP_ID=your-app-id

# REQUIRED — email
RESEND_API_KEY=re_XXXXXXXX

# OPTIONAL — enables Ollama models (set after Step 3)
OLLAMA_BASE_URL=http://ollama.railway.internal:11434
```

### Ollama service

```
OLLAMA_HOST=0.0.0.0
```

### nginx service

```
NEXTJS_UPSTREAM=web.railway.internal:3000
```

---

## Deployment order

```
1. ✅ web service already deployed
2. Set ANTHROPIC_API_KEY → Birdy chat works
3. Create Ollama service + volume → RAG + memory
4. Create nginx service → production routing (optional)
5. Create Redis service → durable agent queue (optional)
```

---

## Verification commands

Run after each step (replace `your-app` with your Railway domain):

```bash
# After Step 1 — should show claude.configured: true
curl https://your-app.railway.app/api/health | python3 -m json.tool

# After Step 3 — should show ollama.connected: true
curl https://your-app.railway.app/api/birdy/admin | python3 -m json.tool

# Full validation suite
BASE_URL=https://your-app.railway.app bash scripts/validate-deployment.sh

# Test Birdy chat directly
curl -X POST https://your-app.railway.app/api/birdy/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What open roles do we have?","sessionId":"test-1"}' \
  --no-buffer
```

---

## Expected behavior after full deployment

| Action | Expected |
|---|---|
| Open TeamBase, click 🐦 | Birdy panel slides in from right |
| Press ⌘/ | Panel toggles |
| Send a message | Streaming response appears token by token |
| Use Actions tab ⚡ | Click a card → pre-fills chat → sends |
| Upload a PDF in Knowledge 📚 | Status: READY within 2-5 minutes |
| Search in Knowledge | Returns relevant chunks with scores |
| Ask about uploaded doc in chat | Birdy cites [1] [2] from your docs |
| Admin tab ⚙️ | Shows infrastructure status, routing, P50/P95 |
| Activity tab 📊 | Shows per-request logs, auto-refreshes |
| After 15+ messages | Memory summary created in background |

---

## Troubleshooting

### "Birdy isn't responding" in chat
→ `ANTHROPIC_API_KEY` not set or invalid. Check Railway web service Variables.

### Panel opens but chat hangs
→ Check Railway deployment logs for build errors
→ Verify health check: `curl https://your-app.railway.app/api/health`

### Document upload fails
→ `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` not set
→ Get from https://uploadthing.com/dashboard

### Semantic search returns 0 results (after uploading docs)
→ `OLLAMA_BASE_URL` not set or Ollama not running
→ `nomic-embed-text` not yet pulled (check Ollama service logs)
→ Document status must be READY (not PENDING/PROCESSING)

### Memory summarization not happening
→ Needs `phi4` model in Ollama → check Admin tab → Ollama models
→ Needs 15+ messages in a conversation to trigger

### Streaming cuts off mid-response
→ Railway has a 60s request timeout by default
→ The `maxDuration = 55` in the chat route handles this
→ nginx config has `proxy_read_timeout 65s` for the chat endpoint

### "Too many requests" errors
→ Rate limit: 10 requests/minute per IP
→ This is intentional — adjust in `lib/birdy/rate-limiter.ts` if needed for team

