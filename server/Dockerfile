
# Use the official Node.js image as the base image
FROM node:24-alpine AS base
ARG APP_VERSION=0.0.0

# Dev
FROM base AS dev
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install the application dependencies
RUN npm install
# Copy the rest of the application files
COPY . .

ENV APP_VERSION=$APP_VERSION
ENV NODE_ENV=development
# Expose the application port
EXPOSE 3000
# Command to run the application in development mode
CMD ["npm", "run", "start:dev"]

# --------------------------------
# Builder
FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --------------------------------
# Production
FROM base AS prod
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/src/main"]
