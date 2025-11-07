FROM node:18-alpine

# Instala dependências do sistema se necessário
RUN apk add --no-cache docker

WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala dependências do Node.js
RUN npm install

# Cria diretório para arquivos temporários
RUN mkdir -p temp

# Expõe as portas
EXPOSE 4000 4001

# Comando para rodar o servidor Node.js
CMD ["node", "src/server.js"]