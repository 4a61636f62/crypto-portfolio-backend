const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const User = require('../models/user')
const Portfolio = require('../models/portfolio')

beforeEach(async () => {
  await User.deleteMany({})
  await Portfolio.deleteMany({})
  const saltRounds = 10

  const passwordHash = await bcrypt.hash(helper.initialUser.password, saltRounds)
  const userObject = new User({
    username: helper.initialUser.username,
    passwordHash
  })

  await userObject.save()
})

describe('when there is initally one user saved', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const response = await api.get('/api/users')
    expect(response.body).toHaveLength(1)
  })

  test('unique identifier of returned users is named "id"', async () => {
    const response = await api.get('/api/users')
    expect(response.body[0]).toHaveProperty('id')
    expect(response.body[0]).not.toHaveProperty('_id')
  })
})

describe('adding a new user', () => {
  test('succeeds with valid username and password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'newuser',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('fails with statuscode 400 and appropriate error message if username is taken', async () => {
    const newUser = {
      username: 'root',
      password: 'toor',
      name: 'test'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')
  })

  test('fails with statuscode 400 if username is invalid', async () => {
    const newUser = {
      username: '12',
      password: 'toor',
      name: 'test'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('is shorter than the minimum allowed length (3)')
  })

  test('fails with statuscode 400 if password is invalid', async () => {
    const newUser = {
      username: '123',
      password: '12',
      name: 'test'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('is shorter than the minimum allowed length (3)')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
