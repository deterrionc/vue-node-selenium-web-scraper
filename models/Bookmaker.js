const mongoose = require('mongoose');

const bookmakerSchema = new mongoose.Schema({
  idProvider: {
    type: String,
  },
  WebName: {
    type: String,
  },
  WebUrl: {
    type: String,
  },
  IsBookmaker: {
    type: String
  },
  IsBettingExchange: {
    type: String
  },
  Url: {
    type: String
  },
  DefaultBetslipUrl: {
    type: String
  },
  Active: {
    type: String
  },
  NewTo: {
    type: String
  },
  SetNew: {
    type: String
  },
  PreferredCountryID: {
    type: String
  },
  sr: {
    type: String
  },
  IsPremium: {
    type: String
  },
  sortKey: {
    type: String
  },
  bonus: {
    id: {
      type: String
    },
    title: {
      type: String
    },
    text: {
      type: String
    }
  },
  setAsMine: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('bookmaker', bookmakerSchema);
