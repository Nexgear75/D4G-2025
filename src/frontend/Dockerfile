FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY src/frontend/package.json src/frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY src/frontend/ .

ARG API_URL=http://backend:5000
ENV API_URL=${API_URL}

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
