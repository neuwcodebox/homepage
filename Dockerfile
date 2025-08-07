# Node.js 빌드 단계
FROM node:22 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Nginx 서빙 단계
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/build .
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
