FROM node:20

WORKDIR /app

COPY package*.json ./

# очистка кэша и удаление старых зависимостей — на всякий случай
RUN rm -rf node_modules package-lock.json || true

RUN npm cache clean --force
RUN npm install

COPY . .

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
