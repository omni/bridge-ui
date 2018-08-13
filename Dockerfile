FROM node:8

WORKDIR /bridge
COPY package.json .
COPY package-lock.json .
COPY . .
RUN npm install
