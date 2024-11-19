FROM node:20-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ecosystem.config.js ./

RUN npm install -g pnpm pm2

RUN pnpm install --production

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
