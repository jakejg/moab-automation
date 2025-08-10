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

# Declare a build argument to receive the Firebase config from Cloud Build
ARG NEXT_PUBLIC_FIREBASE_CONFIG

# Set it as an environment variable that Next.js will pick up during the build process
# This makes it available to your `npm run build` command
ENV NEXT_PUBLIC_FIREBASE_CONFIG=${NEXT_PUBLIC_FIREBASE_CONFIG}

# --- TEMPORARY DEBUGGING STEP ---
RUN echo "DEBUG: NEXT_PUBLIC_FIREBASE_CONFIG is: ${NEXT_PUBLIC_FIREBASE_CONFIG}"
# If the above line prints an empty or undefined value, then the problem is
# with the ARG/ENV setup or the value not reaching the Docker build.
# --- END TEMPORARY DEBUGGING STEP ---

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
