const express = require('express')
const router = express.Router()
const config = require('config')

// Mailgun Info
const mailgunApiKey = config.get('mailgun.mailgunApiKey')
const mailgunDomain = config.get('mailgun.domain')
var mailgun = require('mailgun-js')({ apiKey: mailgunApiKey, domain: mailgunDomain })

// For Scraping
const axios = require('axios')

// For Scheduling
const schedule = require('node-schedule')

// Mongo Models


router.get('/scrapePredictionMatches', async (req, res) => {
  await scrapePredictionMatches()

  res.json({
    success: true
  })
})

module.exports = router

const scrapePredictionMatches = async () => {
  console.log('Scrape Prediction Matches')
}