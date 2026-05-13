# nginx Service — Railway Setup

This directory contains a standalone nginx reverse proxy service for Railway.

## What it does

- Sits in front of the Next.js "web" service
- Rate limits: 30 req/s general, 3 req/s Birdy chat, 1 req/s applications
- Connection limits: 20 concurrent per IP
- Gzip compression for all text responses
- Proper SSE passthrough (no buffering) for Birdy streaming
- Static asset caching headers
- Bot/scanner blocking

## How to deploy on Railway

### Step 1: Enable private networking

In the Railway project, go to **Settings → Networking → Private Networking** and enable it.

### Step 2: Create the nginx service

1. In the Railway project dashboard, click **+ New Service**
2. Choose **GitHub Repo** → select this repo
3. Change the **Root Directory** to `nginx/`
4. Railway detects the Dockerfile and uses it

### Step 3: Set environment variables on the nginx service

In the nginx service settings → Variables:

```
NEXTJS_UPSTREAM=web.railway.internal:3000
PORT=8080
```

> **Note:** `web` is the name of your Next.js service. If you named it differently in Railway,
> use that name instead: e.g. `peoplebook.railway.internal:3000`.

### Step 4: Configure domains

- **nginx service**: assign your production domain here (e.g. `app.rayland.com`)
- **web service**: remove the public domain — it only needs to be accessible internally
  (or keep it for direct access during testing)

### Step 5: Verify

```bash
curl -I https://your-domain.railway.app/nginx-health
# Should return: HTTP/2 200, body: "ok"

curl -I https://your-domain.railway.app/api/birdy/chat
# Headers should include: X-Accel-Buffering: no
```

## Without nginx (simpler setup)

The Next.js app works perfectly fine without nginx — it has its own:
- App-level rate limiting (lib/birdy/rate-limiter.ts)
- Security headers (middleware.ts)
- Bot blocking (middleware.ts)

nginx is recommended for high-traffic production but not required for a team/internal tool.
