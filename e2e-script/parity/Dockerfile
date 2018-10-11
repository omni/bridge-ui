FROM parity/parity:v1.11.11

WORKDIR /stuff

COPY . .

CMD ["--chain", "chain.json", "--network-id", "77", "--jsonrpc-apis", "all", "--jsonrpc-interface", "all", "--jsonrpc-cors", "all", "--jsonrpc-hosts", "all"]
