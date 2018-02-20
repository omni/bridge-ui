# Bridge UI app to show cross chain transactions

This UI app provides an ability for a user to watch for events that is 
happening on both sides of the bridge.

On the left side is HomeBridge contract
On the right side is ForeignBridge contract
If you want to use this app, please follow the instruction:

1. Deploy HomeBridge contract
2. Deploy ForeignBridge contract
3. Hard code addresses into the Dapp source code(App.js)
4. Specify websockets endpoints for both sides of nodes
5. Send native coin to HomeBridge smart contract
6. Make sure you received ERC20 on ForeignBridge
7. When you want to exchange ERC20 from ForeignBridge Click
"Generate Signature to Home" button on the ForeignBridge chain network
8. Make sure you have CollectedSignatures event with message hash
9. Provide the message hash into the input box and click
"Withdraw from Home" in order to get locked coins from HomeBridge to your address


# Running the app
```bash
npm install
npm start
```
