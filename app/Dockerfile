FROM node:25-alpine
RUN apk update && apk upgrade --no-cache

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm install -g serve

RUN npm run build

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000", "--cors"]