FROM node:8 as build-deps

WORKDIR /bridge
COPY package.json .
COPY package-lock.json .
COPY . .
RUN npm install
