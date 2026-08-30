FROM node:22-bookworm-slim

ENV NODE_ENV=production

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies from lock file
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

# Copy application source
COPY src ./src

# Create non-root application user
RUN useradd --system \
    --uid 10001 \
    --create-home \
    appuser \
    && chown -R appuser:appuser /app

USER 10001

EXPOSE 8080

CMD ["node", "src/server.js"]