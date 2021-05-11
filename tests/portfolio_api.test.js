const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const User = require('../models/user')
const Portfolio = require('../models/portfolio')

beforeEach(async () => {
  await User.deleteMany({})
  await Portfolio.deleteMany({})

  const newUser = {
    username: helper.initialUser.username,
    password: helper.initialUser.password
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

describe('adding a new user', () => {
  test('creates a new blank portfolio for that user', async () => {
    const users = await helper.usersInDb()
    const newUser = users[0]
    const newUserPortfolioID = newUser.portfolio

    const portfolios = await helper.portfoliosInDb()
    expect(portfolios).toHaveLength(1)

    const portfolioId = portfolios[0].id.toString()
    expect(portfolioId).toEqual(newUserPortfolioID.toString())

    const portfolioUserId = portfolios[0].user.toString()
    expect(portfolioUserId).toEqual(newUser.id.toString())

    expect(portfolios[0].holdings).toEqual([])
  })
})

describe('getting a specific portfolio', () => {
  test('the portfolio is returned as json', async () => {
    const portfolios = await helper.portfoliosInDb()
    const portfolioID = portfolios[0].id
    await api
      .get(`/api/portfolios/${portfolioID}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('unique identifier of returned portfolio is named "id"', async () => {
    const portfolios = await helper.portfoliosInDb()
    const portfolioID = portfolios[0].id
    const response = await api
      .get(`/api/portfolios/${portfolioID}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveProperty('id')
    expect(response.body).not.toHaveProperty('_id')
  })
})

describe('updating a specific portfolio with valid credentials', () => {
  let authToken
  beforeEach(async () => {
    const credentials = {
      username: helper.initialUser.username,
      password: helper.initialUser.password
    }
    const response = await api
      .post('/api/login')
      .send(credentials)
    authToken = response.body.token
  })

  test('updates are saved correctly to database', async () => {
    const portfoliosAtStart = await helper.portfoliosInDb()
    const portfolioID = portfoliosAtStart[0].id
    const update = {
      baseCurrency: 'gbp',
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
    }

    await api
      .put(`/api/portfolios/${portfolioID}`)
      .send(update)
      .set({ Authorization: `bearer ${authToken}` })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const portfoliosAtEnd = await helper.portfoliosInDb()
    const updated = portfoliosAtEnd[0]
    expect(updated.baseCurrency).toEqual(update.baseCurrency)
    expect(updated.holdings).toEqual(update.holdings)
  })

  test('updated portfolio is returned', async () => {
    const portfoliosAtStart = await helper.portfoliosInDb()
    const portfolioID = portfoliosAtStart[0].id
    const update = {
      baseCurrency: 'gbp',
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
    }

    const response = await api
      .put(`/api/portfolios/${portfolioID}`)
      .send(update)
      .set({ Authorization: `bearer ${authToken}` })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.baseCurrency).toEqual(update.baseCurrency)
    expect(response.body.holdings).toEqual(update.holdings)
  })

  test('fails with statuscode 400 if update holding is missing amount', async () => {
    const portfoliosAtStart = await helper.portfoliosInDb()
    const portfolioID = portfoliosAtStart[0].id
    const update = {
      baseCurrency: 'gbp',
      holdings: [
        {
          coinId: 'btc'
        }
      ]
    }
    const response = await api
      .put(`/api/portfolios/${portfolioID}`)
      .send(update)
      .set({ Authorization: `bearer ${authToken}` })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('`amount` is required')
  })

  test('fails with statuscode 400 if update holding is missing coinId', async () => {
    const portfoliosAtStart = await helper.portfoliosInDb()
    const portfolioID = portfoliosAtStart[0].id
    const update = {
      baseCurrency: 'gbp',
      holdings: [
        {
          amount: 32
        }
      ]
    }
    const response = await api
      .put(`/api/portfolios/${portfolioID}`)
      .send(update)
      .set({ Authorization: `bearer ${authToken}` })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    console.log(response.body)
    expect(response.body.error).toContain('`coinId` is required')
  })
})

describe('updating specific portfolio', () => {
  test('fails statuscode 401 if missing token', async () => {
    const portfoliosAtStart = await helper.portfoliosInDb()
    const portfolioID = portfoliosAtStart[0].id
    const update = {
      baseCurrency: 'gbp',
      holdings: [
        {
          coinId: 'btc',
          amount: 1
        }
      ]
    }

    await api
      .put(`/api/portfolios/${portfolioID}`)
      .send(update)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails statuscode 401 if invalid token', async () => {
    const portfoliosAtStart = await helper.portfoliosInDb()
    const portfolioID = portfoliosAtStart[0].id
    const update = {
      baseCurrency: 'gbp',
      holdings: [
        {
          coinId: 'btc',
          amount: 1
        }
      ]
    }

    await api
      .put(`/api/portfolios/${portfolioID}`)
      .send(update)
      .set({ Authorization: 'invalid token' })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails with statuscode 401 if valid but incorrect token', async () => {
    const newUser = {
      username: 'newUser',
      password: 'newUser'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const loginResponse = await api
      .post('/api/login')
      .send(newUser)

    const incorrectToken = loginResponse.body.token

    const portfoliosAtStart = await helper.portfoliosInDb()
    const portfolioID = portfoliosAtStart[0].id

    const update = {
      baseCurrency: 'gbp',
      holdings: [
        {
          coinId: 'btc',
          amount: 1
        }
      ]
    }

    const response = await api
      .put(`/api/portfolios/${portfolioID}`)
      .send(update)
      .set({ Authorization: `bearer ${incorrectToken}` })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    console.log(response.body)
  })

  test('temp', () => {
    console.log('donothing')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
