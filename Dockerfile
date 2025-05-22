FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Генерация Prisma Client на этапе сборки
RUN npx prisma generate

# Применение миграций и запуск сервера при старте контейнера
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]