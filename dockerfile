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


# docker build -t infraonedb/api-vendas .; if ($?) { docker push infraonedb/api-vendas }


