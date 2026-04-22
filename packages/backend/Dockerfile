FROM node:20-alpine
WORKDIR /app
COPY packages/backend/package*.json ./
RUN npm ci --only=production || npm install
COPY packages/backend/ .
RUN npm run build
CMD ["npm", "start"]
