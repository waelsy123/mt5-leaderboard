FROM node:20-slim AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

RUN adduser --disabled-password --gecos "" --uid 1001 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push; PORT=${PORT:-3000} npm start"]
