# Веб-калькулятор на Node.js без залежностей у рантаймі
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# У package.json лише devDependencies, тому npm install не потрібен
COPY package.json ./
COPY calc.js server.js ./
COPY public ./public

# Запуск не від root (користувач node є в образі)
USER node

EXPOSE 3000

CMD ["node", "server.js"]