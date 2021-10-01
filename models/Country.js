const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  name: {
    type: String
  },
  leagues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'league'
    }
  ]
});

module.exports = mongoose.model('country', CountrySchema);
