FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY src/index.html /usr/share/nginx/html/index.html

USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
