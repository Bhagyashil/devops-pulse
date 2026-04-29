FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=512

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Local docker-compose
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ECS production - template with BACKEND_URL env variable
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
