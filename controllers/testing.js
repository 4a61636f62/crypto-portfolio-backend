const testingRouter = require('express').Router()
const User = require('../models/user')
const Portfolio = require('../models/portfolio')
const Coin = require('../models/coin')
const updatePrices = require('../controllers/coin').updatePrices

testingRouter.post('/reset', async (request, response) => {
  await User.deleteMany({})
  await Portfolio.deleteMany({})
  response.status(200).end()
})

testingRouter.post('/update', async (request, response) => {
  await updatePrices()
  response.status(200).end()
})

testingRouter.get('/coins', async (request, response) => {
  const coins = await Coin.find({})
  response.json(coins)
})

module.exports = testingRouter
