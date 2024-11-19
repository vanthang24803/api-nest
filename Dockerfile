FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./ 

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

COPY package*.json pnpm-lock.yaml ecosystem.config.js ./

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
