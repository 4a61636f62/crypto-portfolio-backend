const portfoliosRouter = require('express').Router()
const Portfolio = require('../models/portfolio')
const Coin = require('../models/coin')
const coinService = require('../services/coin')
const userExtractor = require('../utils/middleware').userExtractor

portfoliosRouter.get('/:id', async (request, response) => {
  const portfolio = await Portfolio.findById(request.params.id)
    .populate('holdings.coin')
  response.json(portfolio)
})

const findCoin = async (coinId) => {
  try {
    let coin = await Coin.findById(coinId)
    if (!coin) {
      const coinData = await coinService.getOne(coinId)
      const newCoin = new Coin({
        _id: coinData.id,
        symbol: coinData.symbol,
        name: coinData.name
      })
      coin = await newCoin.save()
    }
    return coin
  } catch (error) {
    console.log(error.message)
    throw new Error('coin not found')
  }
}

portfoliosRouter.put('/:id/holdings', userExtractor, async (request, response) => {
  if (!(request.user.portfolio.toString() === request.params.id)) {
    return response.status(401).json({
      error: 'portfolio can only be updated by owner'
    })
  }
  const body = request.body
  const portfolio = await Portfolio.findById(request.params.id)

  // check if coin already exists in portfolio holdings
  let found = false
  let holdings = portfolio.holdings.map(h => {
    if (h.coin === body.coinId) {
      found = true
      console.log(h.amount + Number(body.amount))
      return { coin: h.coin, amount: h.amount + Number(body.amount) }
    }
    return h
  })

  // if coin does not already exist, search db / fetch it from api
  if (!found) {
    try {
      const coin = await findCoin(body.coinId)
      holdings = holdings.concat({ coin: coin._id, amount: Number(body.amount) })
    } catch (error) {
      console.log(error.message)
      response.status(400).json({
        error: error.message
      })
    }
  }

  try {
    const updatedPortfolio = await
    Portfolio.findByIdAndUpdate(request.params.id, { holdings }, { new: true, runValidators: true })
      .populate('holdings.coin')
    response.json(updatedPortfolio)
  } catch (error) {
    console.log(error)
    response.status(500).end()
  }
})

module.exports = portfoliosRouter
