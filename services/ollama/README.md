# Ollama Service — Railway Deployment

Self-managing Ollama inference service with automatic model provisioning.

## What it does

On first boot:
1. Starts the Ollama server
2. Checks which models are already cached in the Railway volume
3. Pulls any missing models automatically (nomic-embed-text → phi4 → deepseek-coder → qwen3)
4. Marks itself ready once all models are provisioned

On subsequent boots (models cached in volume):
1. Starts in seconds — models don't re-download
2. API becomes healthy almost immediately

## Railway Setup

### Step 1: Create the service

1. In Railway project → **+ New Service → GitHub Repo**
2. Select the same repo
3. Set **Root Directory** = `services/ollama/`
4. Railway detects the Dockerfile automatically

### Step 2: Add a persistent volume

> **CRITICAL**: Without a volume, all models re-download on every deploy (~40GB).

1. In the Ollama service → **Settings → Volumes**
2. Click **Add Volume**
3. Mount path: `/root/.ollama`
4. Size: at least 50 GB (qwen3:32b alone is ~20 GB)

### Step 3: Set environment variables

```
OLLAMA_HOST=0.0.0.0
```

### Step 4: Enable Private Networking

1. Railway project → **Settings → Networking → Private Networking** → Enable
2. The web service reaches Ollama at: `http://ollama.railway.internal:11434`
3. Set in the **web service** environment:
   ```
   OLLAMA_BASE_URL=http://ollama.railway.internal:11434
   ```

### Step 5: Remove public domain from Ollama service

The Ollama service only needs to be accessible internally, not publicly.
Remove the public domain in the Ollama service networking settings.

## Model sizes (approximate)

| Model                | Size   | Purpose                  |
|----------------------|--------|--------------------------|
| nomic-embed-text     | 274 MB | RAG embeddings (critical)|
| phi4                 | ~9 GB  | Summarization, utility   |
| deepseek-coder-v2:16b| ~9 GB  | Code assistance          |
| qwen3:32b            | ~20 GB | General reasoning        |

## First boot timeline

- nomic-embed-text ready: ~1 minute (small model)
- phi4 ready: ~10-20 minutes (depending on Railway bandwidth)
- Full stack ready: ~45-90 minutes

**During this time**: Birdy still works — it falls back to Claude for all requests
and uses full-text search instead of semantic search until nomic-embed-text is ready.

## Health status

- `/api/tags` → 200 once Ollama API is up
- Readiness file at `/tmp/ollama_ready` contains JSON with per-model status
