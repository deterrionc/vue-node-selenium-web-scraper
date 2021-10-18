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

  var htmlContent = (await axios.get('https://www.over25tips.com/statistics/teams-which-are-involved-in-the-most-games-where-there-are-over-25-goals.html')).data
  var startPos = htmlContent.indexOf('<div class="top-25-teams">')
  var endPos = htmlContent.indexOf('<div class="col-xs-12 col-lg-3 col-md-12">')
  var tableContent = htmlContent.slice(startPos, endPos)
  var teamDivs = tableContent.split('<div class="top-25-teams-item')
  teamDivs.shift()
  teamDivs.shift()
  for (var i = 0; i < teamDivs.length; i++) {
    var teamDiv = teamDivs[i]
    var teamDetailDivs = teamDiv.split('</div>')
    var winningTeam = teamDetailDivs[0].slice(teamDetailDivs[0].lastIndexOf('">') + 2, teamDetailDivs[0][teamDetailDivs[0].length])
    var percent = teamDetailDivs[1].slice(teamDetailDivs[1].lastIndexOf('>') + 1, teamDetailDivs[1].indexOf('%'))
    var link = teamDetailDivs[2].slice(teamDetailDivs[2].indexOf('href=') + 6, teamDetailDivs[2].indexOf('.html') + 5)
    link = link.slice(link.indexOf('predictions/') + 12, link.indexOf('-202'))

    if (link.length) {
      link = 'https://www.over25tips.com/football/prediction/' + link + '.html'
      var match = teamDetailDivs[2].slice(teamDetailDivs[2].lastIndexOf("'>") + 2, teamDetailDivs[2].lastIndexOf('</a>'))
      var teamNames = match.split(' vs ')
      var firstTeam = teamNames[0]
      var secondTeam = teamNames[1]
      var matchHtmlContent = (await axios.get(link)).data
      var startPos1 = matchHtmlContent.indexOf('<div class="col-lg-4 col-xs-4 center-align mmt10">')
      var endPos1 = matchHtmlContent.indexOf('<div class="col-lg-4 col-xs-4 pp0">')
      var targetDivContent = matchHtmlContent.slice(startPos1, endPos1)
      var countryLeague = targetDivContent.slice(targetDivContent.indexOf('</span>') + 7, targetDivContent.indexOf('</b>'))
      countryLeague = countryLeague.split(' - ')
      var country = countryLeague[0].trim()
      var league = countryLeague[1]
      var date = targetDivContent.slice(targetDivContent.indexOf('sp;</b>') + 7, targetDivContent.indexOf('<br><b>Day'))

      var prediction = {
        winningTeam, percent, link, firstTeam, secondTeam, country, league, date
      }
      console.log(prediction)
    }
  }
}