# --- Estágio 1: build da aplicação Angular ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# --- Estágio 2: servir via nginx ---
FROM nginx:alpine
COPY --from=build /app/dist/opensarc-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
