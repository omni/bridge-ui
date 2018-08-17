FROM node:8

RUN mkdir /stuff
WORKDIR /stuff

RUN git clone https://github.com/poanetwork/poa-bridge-contracts.git

RUN mkdir submodules && \
  mv poa-bridge-contracts submodules && \
  cd submodules/poa-bridge-contracts && \
  git checkout refactor_v1

RUN cd submodules/poa-bridge-contracts && \
  npm install && \
  ./node_modules/.bin/truffle compile && \
  cd deploy && \
  npm install
COPY deploy.sh .
COPY contracts.env submodules/poa-bridge-contracts/deploy/
RUN cd submodules/poa-bridge-contracts/deploy && cp contracts.env .env
