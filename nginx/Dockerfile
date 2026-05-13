# ── Nginx reverse proxy service for Railway ──────────────────────────────────
# Build: docker build -t birdy-nginx ./nginx
# Railway will use this Dockerfile when the nginx/ directory is the service root.
FROM nginx:1.27-alpine

# Install envsubst for runtime variable substitution in nginx.conf
RUN apk add --no-cache gettext

# Copy our config (template — uses envsubst at startup)
COPY nginx.conf /etc/nginx/nginx.conf.template

# Startup script: substitute env vars then launch nginx
RUN printf '#!/bin/sh\n\
set -e\n\
# NEXTJS_UPSTREAM defaults to web.railway.internal:3000\n\
: "${NEXTJS_UPSTREAM:=web.railway.internal:3000}"\n\
envsubst "${NEXTJS_UPSTREAM}" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf\n\
# Test config before starting\n\
nginx -t\n\
exec nginx -g "daemon off;"\n' > /docker-entrypoint-custom.sh && chmod +x /docker-entrypoint-custom.sh

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/nginx-health || exit 1

CMD ["/docker-entrypoint-custom.sh"]
