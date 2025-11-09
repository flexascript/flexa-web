# Estágio 1: Construir o interpretador
FROM ubuntu:22.04 as interpreter

# Instala dependências do interpretador
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    && apt-get clean

WORKDIR /app

# Copia o binário flexa para o estágio do interpretador
COPY interpreter/flexa /app/interpreter/flexa
RUN chmod +x /app/interpreter/flexa

# Estágio 2: Backend Node.js
FROM node:18-alpine

# Instala Docker CLI
RUN apk add --no-cache docker

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia o código do backend
COPY . .

# Copia o interpretador do estágio anterior (AGORA FUNCIONA!)
COPY --from=interpreter /app/interpreter/flexa /app/interpreter/flexa

# Cria diretório para arquivos temporários
RUN mkdir -p temp

EXPOSE 4000 4001

CMD ["node", "src/server.js"]
