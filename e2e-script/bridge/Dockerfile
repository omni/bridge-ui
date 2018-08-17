FROM node:8

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y libc6-dev
RUN apt-get install -y libc6-dev-i386
RUN apt-get install -y wget
RUN apt-get clean

RUN git clone https://github.com/poanetwork/bridge-nodejs.git
WORKDIR /bridge-nodejs
RUN cd submodules/poa-bridge-contracts && git submodule update --init --recursive && ls && git checkout refactor_v1
RUN npm install
