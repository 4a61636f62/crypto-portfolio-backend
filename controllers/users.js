const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Portfolio = require('../models/portfolio')

usersRouter.get('/', async (request, response) => {
  const portfolios = await User.find({})
  response.json(portfolios)
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (body.password.length < 3) {
    return next({
      name: 'ValidationError',
      message: 'User validation failed: password is shorter than the minimum allowed length (3).'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const newUser = new User({
    username: body.username,
    passwordHash
  })

  // save new user in order to generate id
  const user = await newUser.save()

  const portfolio = new Portfolio({
    baseCurrency: 'usd',
    holdings: [],
    user: user._id
  })
  await portfolio.save()

  user.portfolio = portfolio
  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = usersRouter
