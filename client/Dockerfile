ARG NODE_VERSION=24-alpine
ARG CADDY_VERSION=2.11.2-alpine

FROM node:${NODE_VERSION} AS base


# =========================================
# Dev
# =========================================
FROM base AS dev

# Set environment variable to indicate development mode
ENV NODE_ENV=development

# Set the working directory inside the container
WORKDIR /app

# Copy only the dependency files first to optimize Docker caching
COPY package.json package-lock.json* ./

# Install dependencies using npm with caching to speed up subsequent builds
RUN --mount=type=cache,target=/root/.npm npm install

# Copy all application source files into the container
COPY . .

# Expose the port Angular uses for the dev server (default is 4200)
EXPOSE 4200

# Start the Angular dev server and bind it to all network dto
CMD ["npm", "start", "--", "--proxy-config", "proxy.conf.docker.json", "--host=0.0.0.0"]


# =========================================
# Stage 1: Build the Angular Application
# =========================================

# Use a lightweight DHI Node.js image for building
FROM base AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json* ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the application source code into the container
COPY . .

# Build the Angular application
RUN npm run build

# =========================================
# Stage 2: Prepare Nginx to Serve Static Files
# =========================================

FROM caddy:${CADDY_VERSION} AS prod
WORKDIR /app

RUN addgroup -S webuser \
  && adduser -S webuser -G webuser \
  && apk add --no-cache gettext-envsubst=0.24.1-r1


COPY --chown=nginx:nginx --from=builder /app/dist/*/browser /usr/share/caddy

RUN cat > /etc/caddy/Caddyfile <<'EOF'
:8080 {
    root * /tmp/www
    try_files {path} {path}/ /index.html
    file_server
}
EOF

RUN cat > /usr/local/bin/awen-entrypoint <<'EOF' \
  && chmod +x /usr/local/bin/awen-entrypoint
#!/bin/sh
set -eu

: "${AWEN_APP_NAME:=AWEN - Graph Based Entity Management}"
: "${AWEN_APP_PREFIX:=/}"
: "${AWEN_APP_DESCRIPTION:=Entity Management for Graph Applications using the RAMEN-Framework}"
: "${AWEN_APP_FAVICON:=/favicon-default.jpg}"

rm -rf /tmp/www
mkdir -p /tmp/www
cp -R /usr/share/caddy/. /tmp/www/

envsubst '${AWEN_APP_HOST} ${AWEN_APP_NAME} ${AWEN_APP_PREFIX} ${AWEN_APP_DESCRIPTION} ${AWEN_APP_FAVICON}' \
  < /usr/share/caddy/index.html \
  > /tmp/www/index.html

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
EOF

USER webuser
EXPOSE 8080

CMD ["awen-entrypoint"]

