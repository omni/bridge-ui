FROM parity/parity:v2.2.11

WORKDIR /stuff

COPY . .

CMD ["--chain", "chain.json", "--network-id", "77", "--jsonrpc-apis", "all", "--jsonrpc-interface", "all", "--jsonrpc-cors", "all", "--jsonrpc-hosts", "all"]
