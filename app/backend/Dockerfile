# ============================================================
# Node.js Backend
# ============================================================

FROM node:22-bookworm-slim

# ------------------------------------------------------------
# Application environment
# ------------------------------------------------------------
ENV NODE_ENV=production

# ------------------------------------------------------------
# Application directory
# ------------------------------------------------------------
WORKDIR /app

# ------------------------------------------------------------
# Copy dependency files first.
#
# This allows Docker to cache the dependency layer when
# application source code changes.
# ------------------------------------------------------------
COPY package*.json ./

# ------------------------------------------------------------
# Install production dependencies.
#
# Prefer npm ci when package-lock.json exists.
# Fallback to npm install if the lock file is missing.
#
# --omit=dev:
#   Do not install development dependencies.
#
# --ignore-scripts:
#   Prevent package lifecycle scripts from executing.
#
# Clean npm cache afterwards.
# ------------------------------------------------------------
RUN if [ -f package-lock.json ]; then \
        npm ci --omit=dev --ignore-scripts; \
    else \
        npm install --omit=dev --ignore-scripts; \
    fi \
    && npm cache clean --force

# ------------------------------------------------------------
# Copy application source
# ------------------------------------------------------------
COPY src ./src

# ------------------------------------------------------------
# Create dedicated non-root application user
# ------------------------------------------------------------
RUN useradd \
        --system \
        --uid 10001 \
        --create-home \
        appuser \
    && chown -R appuser:appuser /app

# ------------------------------------------------------------
# Run application as non-root
# ------------------------------------------------------------
USER 10001

# ------------------------------------------------------------
# Application port
# ------------------------------------------------------------
EXPOSE 8080

# ------------------------------------------------------------
# Start application
# ------------------------------------------------------------
CMD ["node", "src/server.js"]