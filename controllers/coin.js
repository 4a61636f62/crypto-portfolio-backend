const Coin = require('../models/coin')
const coinService = require('../services/coin')

const updatePrices = async () => {
  const coins = await Coin.find({})
  const coinIds = coins.map(c => c._id)
  const vsCurrencies = ['usd', 'gbp']
  const prices = await coinService.getPrices(coinIds, vsCurrencies)
  const promises = coins.map(coin => {
    coin.prices = prices[coin._id]
    console.log(coin.prices)
    return coin.save()
  })
  await Promise.all(promises)
}

module.exports = { updatePrices }
