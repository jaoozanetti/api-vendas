FROM node:18-alpine AS builder

WORKDIR /app

# Habilita pnpm via corepack (forma moderna)
RUN corepack enable

# Copia arquivos de dependência
COPY package.json pnpm-lock.yaml ./

# Instala dependências
RUN pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

EXPOSE 3000
CMD ["pnpm", "start"]


# docker build -t infraonedb/api-vendas .; if ($?) { docker push infraonedb/api-vendas } // Comando para buildar e pushar a imagem para o repositório Docker Hub

# docker build -t infraonedb/api-vendas:1.0.1 . ; docker push infraonedb/api-vendas:1.0.1 09/02/2026 - tag de versão e push para o repositório


