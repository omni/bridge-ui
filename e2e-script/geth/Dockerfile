FROM ethereum/client-go

WORKDIR /stuff

COPY . .
RUN geth --datadir ./data init genesis.json
CMD ["--datadir", "./data", "--networkid", "15", "--rpc", "--rpcapi", "eth,web3,net", "--mine", "--minerthreads=1","--etherbase", "0xaaB52d66283F7A1D5978bcFcB55721ACB467384b"]
