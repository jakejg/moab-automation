# 1. Install dependencies
FROM node:20-slim AS deps
WORKDIR /app


# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# 2. Build the application
FROM node:20-slim AS builder
WORKDIR /app

# Client-side Firebase config
ARG NEXT_PUBLIC_FIREBASE_CONFIG
ENV NEXT_PUBLIC_FIREBASE_CONFIG=${NEXT_PUBLIC_FIREBASE_CONFIG}

# Server-side Firebase Admin config
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
ARG FIREBASE_CLIENT_EMAIL
ENV FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
ARG FIREBASE_PRIVATE_KEY
ENV FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}


# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# Set NEXT_TELEMETRY_DISABLED to 1 to prevent Next.js from collecting telemetry data
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# 3. Production image
FROM node:20-slim AS runner
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
