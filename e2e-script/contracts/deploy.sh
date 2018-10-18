#!/usr/bin/env bash
cd submodules/poa-bridge-contracts/deploy
echo "Deploying Native-Erc contracts"
node deploy.js
echo "Deploying erc20 contract"
node deployERC20.js
cp erc-contracts.env .env
echo "Deploying erc20-erc20 contracts"
node deploy.js
