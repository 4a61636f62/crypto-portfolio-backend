const axios = require('axios')

const getCoinData = async (coinId) => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}`
  const response = await axios.get(url)
  return response.data
}

const getPrices = async (coinIds, vsCurrencies) => {
  const baseUrl = 'https://api.coingecko.com/api/v3/simple/price'
  const ids = coinIds.join('%2C')
  const vs = vsCurrencies.join('%2C')

  const response = await axios.get(`${baseUrl}?ids=${ids}&vs_currencies=${vs}`)
  return response.data
}

module.exports = { getOne: getCoinData, getPrices }
