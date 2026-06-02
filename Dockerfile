ARG NODE_VERSION=24-alpine
ARG NGINX_VERSION=1-alpine3.23
ARG APP_VERSION=0.0.0

FROM node:${NODE_VERSION} AS base

# =========================================
# Stage 1: Build the Angular Application
# =========================================

# Use a lightweight DHI Node.js image for building
FROM base AS client-builder

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY client/package*.json* ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the application source code into the container
COPY client/. .

# Build the Angular application
RUN npx ng build --configuration=production

# =========================================
# Stage : Build the NestJS Application
# =========================================

# --------------------------------
# Builder
FROM base AS server-builder
WORKDIR /usr/src/app
ARG APP_VERSION=0.0.0
ENV APP_VERSION=$APP_VERSION
ENV SERVER_SIDE_CLIENT=true
COPY server/package*.json ./
RUN npm ci
COPY server/. .
RUN npm run build

# --------------------------------
# Production
FROM base AS server-prod
WORKDIR /usr/src/app

ARG APP_VERSION=0.0.0
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
ENV SERVER_SIDE_CLIENT=true

COPY server/package*.json* ./
RUN npm ci --omit=dev
COPY --from=server-builder /usr/src/app/dist ./dist
COPY --from=client-builder /app/dist/*/browser ./dist/client

EXPOSE 3000
CMD ["node", "dist/src/main"]
