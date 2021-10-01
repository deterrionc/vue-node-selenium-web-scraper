const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MatchSchema = new Schema({
  name: {
    type: String
  },
  link: {
    type: String
  },
  countryName: {
    type: String
  },
  leagueName: {
    type: String
  },
  time: {
    type: String
  },
  score: {
    type: String
  },
  homeOdds: {
    type: String
  },
  xOdds: {
    type: String
  },
  awayOdds: {
    type: String
  },
  bs: {
    type: String
  },
  IsNew: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('match', MatchSchema);
