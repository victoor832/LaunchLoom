FROM node:20-alpine

WORKDIR /app

# Instalar LibreOffice y dependencias
RUN apk add --no-cache \
    libreoffice \
    libreoffice-headless \
    libreoffice-impress \
    libreoffice-calc \
    libreoffice-writer

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
