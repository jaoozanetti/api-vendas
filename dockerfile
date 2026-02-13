# --- ESTÁGIO 1: BUILD ---
FROM node:20.17-alpine AS builder

# Habilita o pnpm via corepack (padrão Node moderno)
RUN npm install -g pnpm

WORKDIR /app

# Copia apenas os arquivos de definição de pacotes primeiro para cache
COPY package.json pnpm-lock.yaml ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN pnpm install --frozen-lockfile

# Copia o código fonte completo
COPY . .

# Compila o TypeScript para JavaScript (gera a pasta /dist)
RUN pnpm run build

# --- ESTÁGIO 2: PRODUÇÃO ---
FROM node:20.17-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Variável de ambiente para otimizações de libs (como Express/Nest)
ENV NODE_ENV=production

# Copia apenas os arquivos necessários para instalar as dependências de prod
COPY package.json pnpm-lock.yaml ./

# Instala APENAS as dependências de produção (--prod)
RUN pnpm install --prod --frozen-lockfile

# Copia o código compilado do estágio anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta padrão do NestJS
EXPOSE 3000

# Executa as migrations e inicia a aplicação em modo de produção
CMD ["sh", "-c", "pnpm run migrate:prod && pnpm run start:prod"]

# Comandos para buildar e pushar a imagem para o repositório Docker Hub 1ª vez

# docker build -t infraonedb/api-vendas .; if ($?) { docker push infraonedb/api-vendas } // Comando para buildar e pushar a imagem para o repositório Docker Hub

# Comandos para buildar e pushar a imagem para o repositório Docker Hub com tag de versão

# docker build -t infraonedb/api-vendas:1.0.1 . ; docker push infraonedb/api-vendas:1.0.1 09/02/2026 - tag de versão e push para o repositório
# docker build -t infraonedb/api-vendas:1.0.2 . ; docker push infraonedb/api-vendas:1.0.2 09/02/2026 - nova tag de versão e push para o repositório
# docker build -t infraonedb/api-vendas:1.0.3 . ; docker push infraonedb/api-vendas:1.0.3 09/02/2026 - nova tag de versão e push para o repositório
# docker build -t infraonedb/api-vendas:1.0.4 . ; docker push infraonedb/api-vendas:1.0.4 13/02/2026 - nova tag de versão e push para o repositório


