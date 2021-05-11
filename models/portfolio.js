const mongoose = require('mongoose')

const holdingSchema = new mongoose.Schema({
  coin: {
    type: mongoose.Schema.Types.String,
    ref: 'Coin',
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
})

holdingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const portfolioSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    default: 'usd'
  },
  holdings: [holdingSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

portfolioSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Portfolio = mongoose.model('Portfolio', portfolioSchema)

module.exports = Portfolio
