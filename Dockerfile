# =============================================
# Backend Dockerfile — Node.js Express API
# For deployment on Hostinger VPS
# =============================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS dev
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS prod
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
USER nodeuser
EXPOSE 5000
CMD ["node", "src/index.js"]
