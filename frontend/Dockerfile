FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Copy default nginx configuration to handle React Router (if needed)
RUN echo 'server { \
    listen       80; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:8080/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    client_max_body_size 50M; \
}' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
