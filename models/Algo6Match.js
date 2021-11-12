const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Algo6MatchSchema = new Schema({
  time: {
    type: Date
  },
  flag: {
    type: String
  },
  name: {
    type: String
  },
  link: {
    type: String
  },
  style: {
    type: String
  },
  logic: {
    type: String
  },
  competition: {
    type: String
  },
  league: {
    type: String
  },
  IsNew: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('algo6match', Algo6MatchSchema);
