FROM node:22.3.0-alpine

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 8000

CMD ["pnpm", "start"]
