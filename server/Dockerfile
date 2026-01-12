
# Use the official Node.js image as the base image
FROM node:24-alpine AS base

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
ENV NODE_ENV=development
# Expose the application port
EXPOSE 3000
# Command to run the application in development mode
CMD ["npm", "run", "start:dev"]

# --------------------------------
# Production
FROM base AS prod
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

ENV NODE_ENV=production
# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
