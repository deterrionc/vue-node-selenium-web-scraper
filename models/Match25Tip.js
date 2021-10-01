const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Match25TipSchema = new Schema({
  time: {
    type: String
  },
  league: {
    type: String
  },
  homeTeam: {
    type: String
  },
  awayTeam: {
    type: String
  },
  h1: {
    type: Number
  },
  h2: {
    type: Number
  },
  a1: {
    type: Number
  },
  a2: {
    type: Number
  },
  a3: {
    type: Number
  },
  a4: {
    type: Number
  },
  probability: {
    type: Number
  },
  IsNew: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('match25tip', Match25TipSchema);
