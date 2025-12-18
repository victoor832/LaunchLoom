FROM node:20-slim

WORKDIR /app

# Instalar LibreOffice y dependencias necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

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
