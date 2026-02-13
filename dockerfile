# --- ESTÁGIO 1: BUILD ---
FROM node:20.17-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- ESTÁGIO 2: PRODUÇÃO ---
FROM node:20.17-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]


# Comandos para buildar e pushar a imagem para o repositório Docker Hub 1ª vez

# docker build -t infraonedb/api-vendas .; if ($?) { docker push infraonedb/api-vendas } // Comando para buildar e pushar a imagem para o repositório Docker Hub

# Comandos para buildar e pushar a imagem para o repositório Docker Hub com tag de versão

# docker build -t infraonedb/api-vendas:1.0.1 . ; docker push infraonedb/api-vendas:1.0.1 09/02/2026 - tag de versão e push para o repositório
# docker build -t infraonedb/api-vendas:1.0.2 . ; docker push infraonedb/api-vendas:1.0.2 09/02/2026 - nova tag de versão e push para o repositório
# docker build -t infraonedb/api-vendas:1.0.3 . ; docker push infraonedb/api-vendas:1.0.3 09/02/2026 - nova tag de versão e push para o repositório
# docker build -t infraonedb/api-vendas:1.0.4 . ; docker push infraonedb/api-vendas:1.0.4 13/02/2026 - nova tag de versão e push para o repositório


