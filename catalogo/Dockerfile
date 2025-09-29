# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Si usás variables, definilas como ARG o .env.* (Vite usa VITE_*):
# ARG VITE_API_BASE
# ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# --- Runtime stage con Nginx ---
FROM nginx:1.27-alpine AS runner
# Config SPA + proxy /api -> backend:8080 (dentro de la red de docker)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
