FROM node:8 as build-deps

WORKDIR /bridge
COPY package.json .
COPY package-lock.json .
COPY . .
RUN npm install
RUN cp e2e-script/.env.example .env
RUN npm run build

FROM nginx:1.12-alpine
COPY --from=build-deps /bridge .
COPY --from=build-deps /bridge/build /usr/share/nginx/html
EXPOSE 80
