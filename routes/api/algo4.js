const express = require('express')
const router = express.Router()

// MODELS
const Match25Tip = require('../../models/Match25Tip')

// Utility Functions
const { scrapeMatches, sendAlgo4GooMatchesByEmail } = require('../../utils/algo2')

router.get('/getMatches', async (req, res) => {
  console.log('GET ALGO 4 MATCHES')
  var matchesFromDB = await Match25Tip.find({ IsNew: true })
  var matches = []

  for (var i = 0; i < matchesFromDB.length; i++) {
    var match = { ...matchesFromDB[i]._doc }
    if (match.a1 >= 24 && match.h1 >= 24) {
      match.risk = 'Good T1'
    }
    if (match.probability >= 85) {
      match.risk = 'Good T2'
    }
    if (match.a1 >= 24 && match.h1 >= 24 && match.probability >= 85) {
      match.risk = 'Great'
    }

    matches.push(match)
  }

  res.json({
    success: true,
    matches
  })
})

router.get('/scrapeMatches', async (req, res) => {
  console.log('SCRAPE ALGO 4 MATCHES')
 
  await scrapeMatches()
  await sendAlgo4GooMatchesByEmail()

  res.json({
    success: true
  })
})

module.exports = router