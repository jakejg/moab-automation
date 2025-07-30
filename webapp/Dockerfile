# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install build tools and compatibility libraries for native modules
RUN apk add --no-cache libc6-compat build-base python3

# Copy package.json and lock file
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# 2. Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# Set NEXT_TELEMETRY_DISABLED to 1 to prevent Next.js from collecting telemetry data
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# 3. Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set NEXT_TELEMETRY_DISABLED to 1 for the production environment
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security purposes
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application from the 'builder' stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the PORT environment variable
ENV PORT 3000

# Start the Next.js application
CMD ["node", "server.js"]
