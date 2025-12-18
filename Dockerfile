FROM node:20-slim

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["pnpm", "api"]
