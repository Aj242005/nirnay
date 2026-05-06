# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --workspace=@nirnay/bidder-portal

FROM nginx:alpine
COPY --from=builder /app/apps/bidder-portal/dist /usr/share/nginx/html
COPY apps/bidder-portal/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
