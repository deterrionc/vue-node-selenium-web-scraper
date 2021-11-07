const express = require('express')
const router = express.Router()

// MODELS
const Match25Tip = require('../../models/Match25Tip')

// Utility Functions
const { scrapeMatches, sendAlgo2GooMatchesByEmail } = require('../../utils/algo2')

router.get('/getMatches', async (req, res) => {
  console.log('GET ALGO 2 MATCHES')
  var matchesFromDB = await Match25Tip.find({ IsNew: true })
  var matches = []

  for (var i = 0; i < matchesFromDB.length; i++) {
    var match = { ...matchesFromDB[i]._doc }
    if ((match.h1 + match.a1) >= 24) {
      match.risk = 'Medium 1'
    }
    if (match.probability >= 85) {
      match.risk = 'Medium 2'
    }
    if ((match.h1 + match.a1) >= 24 && match.probability >= 85) {
      match.risk = 'Medium 3'
    }
    if ((match.h1 + match.a1) >= 24 && match.probability >= 90) {
      match.risk = 'Good 1'
    }
    if ((match.h1 + match.a1) >= 24 && match.probability >= 90) {
      match.risk = 'Good 2'
    }

    matches.push(match)
  }

  res.json({
    success: true,
    matches
  })
})

router.get('/scrapeMatches', async (req, res) => {
  console.log('SCRAPE ALGO 2 MATCHES')
 
  await scrapeMatches()
  await sendAlgo2GooMatchesByEmail()
  
  res.json({
    success: true
  })
})

module.exports = router