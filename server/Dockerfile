# Stage 1: build the interpretador
FROM ubuntu:22.04 AS interpreter

# Install interpreter dependencies
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    && apt-get clean

WORKDIR /app

# Copy the flex binary to the interpreter stage
COPY interpreter/ /app/interpreter/
RUN chmod +x /app/interpreter/flexa

# Stage 2: Node.js Backend
FROM node:25-alpine
RUN apk update && apk upgrade --no-cache

# Install Docker CLI
RUN apk add --no-cache docker

WORKDIR /app

# Copy package.json e install dependencies
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Copy the interpreter from the first stage
COPY --from=interpreter /app/interpreter /app/interpreter

# Create temp directory
RUN mkdir -p temp

EXPOSE 4000 4001

CMD ["node", "src/server.js"]
