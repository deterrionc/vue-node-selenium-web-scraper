const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeagueSchema = new Schema({
  leagueName: {
    type: String
  },
  countryName: {
    type: String
  },
  active: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('league', LeagueSchema);
