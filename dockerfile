# --- Estágio 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (Cache Layer)
COPY package*.json ./
RUN npm ci

# Copia o resto do código
COPY . .

# Gera a pasta dist/
RUN npm run build

# --- Estágio 2: Produção ---
FROM node:18-alpine

WORKDIR /app

# Copia apenas o necessário do estágio de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Expõe a porta que o Nest usa
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "start:prod"]