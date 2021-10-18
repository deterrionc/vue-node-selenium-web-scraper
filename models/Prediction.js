const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PredictionSchema = new Schema({
  winningTeam: {
    type: String
  }, 
  percent: {
    type: Number
  }, 
  link: {
    type: String
  }, 
  firstTeam: {
    type: String
  }, 
  secondTeam: {
    type: String
  }, 
  country: {
    type: String
  }, 
  league: {
    type: String
  }, 
  date: {
    type: Date
  },
  IsNew: {
    type: Boolean,
    default: true
  },
});

module.exports = mongoose.model('prediction', PredictionSchema);