const User = require('../models/user')
const Portfolio = require('../models/portfolio')

const initialPortfolios = [
  {
    baseCurrency: 'usd',
    holdings: [
      {
        coinId: 'btc',
        amount: 1
      },
      {
        coinId: 'eth',
        amount: 32
      },
      {
        coinId: 'link',
        amount: 10000
      }
    ]
  },
  {
    baseCurrency: 'gbp',
    holdings: [
      {
        coinId: 'btc',
        amount: 0.01
      },
      {
        coinId: 'eth',
        amount: 1
      },
      {
        coinId: 'link',
        amount: 11
      }
    ]
  },
  {
    baseCurrency: 'usd',
    holdings: [
      {
        coinId: 'doge',
        amount: 69420
      }
    ]
  },
  {
    baseCurrency: 'rub',
    holdings: [
      {
        coinId: 'btc',
        amount: 10
      },
      {
        coinId: 'eth',
        amount: 100
      }
    ]
  }
]

const initialUser = {
  username: 'root',
  name: 'root',
  password: 'root'
}

const portfoliosInDb = async () => {
  const portfolios = await Portfolio.find({})
  return portfolios.map(portfolio => portfolio.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialPortfolios, initialUser, portfoliosInDb, usersInDb
}
