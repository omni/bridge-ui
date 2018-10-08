export async function fetchGasPrice({ bridgeContract, oracleFn }) {
  let gasPrice = null
  try {
    gasPrice = await oracleFn()
  } catch (e) {
    console.error(`Gas Price API is not available. ${e.message}`)

    try {
      gasPrice = await bridgeContract.methods.gasPrice().call()
    } catch (e) {
      console.error(`There was a problem getting the gas price from the contract. ${e.message}`)
    }
  }
  return gasPrice
}

export async function fetchGasPriceFromOracle(oracleUrl, speedType) {
  const response = await fetch(oracleUrl)
  const json = await response.json()
  const gasPrice = json[speedType]
  if (!gasPrice) {
    throw new Error(`Response from Oracle didn't include gas price for ${speedType} type.`)
  }
  return gasPrice
}
