FROM node:20-bookworm-slim

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
CMD ["npm", "run", "start"]
