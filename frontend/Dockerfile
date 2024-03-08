FROM node:17-alpine3.14 AS builder
ENV NODE_ENV production
WORKDIR /app
COPY package.json .
RUN npm i --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:1.21.6-alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
