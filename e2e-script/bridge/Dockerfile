FROM node:8

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y libc6-dev
RUN apt-get install -y libc6-dev-i386
RUN apt-get install -y wget
RUN apt-get clean

RUN git clone https://github.com/poanetwork/bridge-nodejs.git
WORKDIR /bridge-nodejs
RUN git fetch && git checkout support-erc20-native-#81
RUN cd submodules/poa-bridge-contracts && git submodule update --init --recursive && git fetch && git checkout erc20-to-native-#79
RUN npm install
