const mongoose = require('mongoose')

const coinSchema = new mongoose.Schema({
  _id: String,
  symbol: String,
  name: String,
  prices: {}
})

coinSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Coin = mongoose.model('Coin', coinSchema)

module.exports = Coin
