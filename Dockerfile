# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY package*.json pnpm-lock.yaml ecosystem.config.js ./

RUN pnpm install

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
