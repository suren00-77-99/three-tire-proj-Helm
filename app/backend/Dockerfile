FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

COPY src ./src

RUN useradd --system --uid 10001 --create-home appuser \
    && chown -R appuser:appuser /app

USER 10001

EXPOSE 8080
CMD ["node", "src/server.js"]
