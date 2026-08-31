FROM nginx:1.29-alpine

# Update Alpine packages
RUN apk upgrade --no-cache

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend application
COPY src/index.html /usr/share/nginx/html/index.html

# nginx user in the official image uses UID 101
USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]