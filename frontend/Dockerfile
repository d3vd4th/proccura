# Stage 1: Base dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Local Development (Hot-reloading)
FROM base AS development
COPY . .
# Let Compose pass these, but define defaults
ENV VITE_API_BASE_URL=http://localhost:8000
ENV VITE_APP_NAME=Proccura
ENV VITE_APP_ENV=development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Production Builder
FROM base AS builder
COPY . .
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_APP_NAME=Proccura
ARG VITE_APP_ENV=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_ENV=$VITE_APP_ENV
RUN npm run build

# Stage 4: Production Server
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
