const mongoose = require('mongoose')

const OddsDataSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'match'
  },
  bookmaker: {
    type: String
  },
  bookmakerActive: {
    type: Boolean
  },
  active: {
    type: Boolean
  },
  homeOdds: {
    type: Number
  },
  homeMove: {
    type: String
  },
  awayOdds: {
    type: Number
  },
  awayMove: {
    type: String
  },
  IsNew: {
    type: Boolean,
    default: true
  },
})

module.exports = mongoose.model('oddsdata', OddsDataSchema)