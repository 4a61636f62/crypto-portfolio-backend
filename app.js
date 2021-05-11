const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const portfoliosRouter = require('./controllers/portfolios')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const mongoose = require('mongoose')
const morgan = require('morgan')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    logger.info('connected to MongoDB')
  }).catch(error => {
    logger.error('failed to establish connection with MongoDB', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(middleware.tokenExtractor)

app.use('/api/portfolios', portfoliosRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.get('/', (req, res) => {
  res.send('Front end static files will be served here')
})

app.use(middleware.errorHandler)
module.exports = app
