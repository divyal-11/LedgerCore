FROM node:20-alpine
WORKDIR /app
COPY packages/frontend/package*.json ./
RUN npm install
COPY packages/frontend/ .

# Accept build arg and expose as env var before build
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build
CMD ["npm", "start"]