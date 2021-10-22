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
const Prediction = require('../../models/Prediction')
const Match = require('../../models/Match')
const User = require('../../models/User')

// Selenium Webdriver
const webdriver = require('selenium-webdriver')
const chromeDriver = require('selenium-webdriver/chrome')
const path = require('chromedriver').path
const service = new chromeDriver.ServiceBuilder(path).build()
chromeDriver.setDefaultService(service)
const { By, until } = webdriver
webdriver.promise.USE_PROMISE_MANAGER = false
const options = new chromeDriver.Options()
// options.setChromeBinaryPath('C:/Program Files/Google/Chrome/Application/chrome.exe')
options.setChromeBinaryPath('/usr/bin/google-chrome')
options.addArguments(
  ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  // ['--no-sandbox', '--disable-dev-shm-usage']
)

router.get('/scrapePredictionMatches', async (req, res) => {
  await scrapePredictionMatches()

  res.json({
    success: true
  })
})

router.get('/getPredictionMatches', async (req, res) => {
  console.log('Get Prediction Matches')

  const predictionsFromDB = await Prediction.find({ IsNew: true })
  const matchesFromDB = await Match.find({ IsNew: true, active: true })
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var today = new Date(`${year}-${month}-${day}`)
  var predictions = []

  for (var i = 0; i < predictionsFromDB.length; i++) {
    var prediction = { ...predictionsFromDB[i]._doc }
    var matchName = prediction.firstTeam + ' - ' + prediction.secondTeam
    var intervalInDays = (prediction.date - today) / 86400000

    if (intervalInDays >= 0 && intervalInDays < 2) {
      prediction.risk1 = 'Available'
    } else {
      prediction.risk1 = null
    }

    for (var j = 0; j < matchesFromDB.length; j++) {
      var match = { ...matchesFromDB[j]._doc }

      if (prediction.risk1 === 'Available') {
        if (matchName === match.name) {
          prediction.risk2 = 'Good'
        }
      } else {
        if (matchName === match.name) {
          prediction.risk2 = 'Exist'
        }
      }
    }
    predictions.push(prediction)
  }

  res.json({
    success: true,
    predictions
  })
})

module.exports = router

const scheduleRuleForEverydayScrape = new schedule.RecurrenceRule()
scheduleRuleForEverydayScrape.hour = 1
scheduleRuleForEverydayScrape.minute = 10

const j = schedule.scheduleJob(scheduleRuleForEverydayScrape, () => {
  scrapePredictionMatches()
})

const scrapePredictionMatches = async () => {
  console.log('Scrape Prediction Matches')

  const driver = await new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  await driver.get('https://www.oddsportal.com/login/')
  await driver.findElement(By.name('login-username')).sendKeys('sbhooley')
  await driver.findElement(By.name('login-password')).sendKeys('Access2020$')
  await driver.findElement(By.xpath("//div[@class='item']/button[@type='submit']")).click()
  await driver.get('https://www.oddsportal.com/matches/soccer/')
  await driver.findElement(By.id('user-header-oddsformat-expander')).click()
  await driver.findElement(By.linkText('EU Odds')).click()

  const matchesFromDB = await Match.find({ IsNew: true, active: true })

  // await Prediction.deleteMany({ IsNew: false })
  // await Prediction.updateMany({ IsNew: true }, { IsNew: false })

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

    if (link.length && percent > 85) {
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
      
      var oddLink = '/#over-under;2'

      var matchName = firstTeam + ' - ' + secondTeam

      for (var j = 0; j < matchesFromDB.length; j++) {
        var oddMatch = { ...matchesFromDB[j]._doc }

        if (matchName === oddMatch.name) {
          oddLink = oddMatch.link + oddLink

          await driver.get(oddLink)
          var ouTableContent = await driver.findElement(By.id('odds-data-table'))
          var ouTableContentText = await ouTableContent.getText()
          var textArray = ouTableContentText.split('Compare odds\n')
          var targetText = textArray.find(element => element.indexOf('Over/Under +2.5') > -1)
          console.log('Algo3 oddLink', targetText)
          console.log(typeof(ouTableContentText))
        }
      }

      var newPrediction = new Prediction({
        winningTeam, percent, link, firstTeam, secondTeam, country, league, date
      })

      // await newPrediction.save()
      console.log('Algo3. One Match Added!')
    }
  }

  var goodPredictions = await getGoodPredictions()
  // await sendCustomersEmailGoodMatches(goodPredictions)

  await driver.close()
  await driver.quit()
}

const getGoodPredictions = async () => {
  const predictionsFromDB = await Prediction.find({ IsNew: true })
  const matchesFromDB = await Match.find({ IsNew: true, active: true })
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var today = new Date(`${year}-${month}-${day}`)
  var predictions = []

  for (var i = 0; i < predictionsFromDB.length; i++) {
    var prediction = { ...predictionsFromDB[i]._doc }
    var matchName = prediction.firstTeam + ' - ' + prediction.secondTeam
    var intervalInDays = (prediction.date - today) / 86400000

    if (intervalInDays >= 0 && intervalInDays < 2) {
      prediction.risk = 'Available'
    }

    for (var j = 0; j < matchesFromDB.length; j++) {
      var match = { ...matchesFromDB[j]._doc }

      if (prediction.risk === 'Available' && matchName === match.name) {
        // if (matchName === match.name) {
        prediction.risk = 'Good'
        predictions.push(prediction)
      }
    }
  }

  return predictions
}

const sendCustomersEmailGoodMatches = async (predictions) => {
  var predictionsForEmail = predictions.filter(prediction => prediction.risk === 'Good')

  if (predictionsForEmail.length) {
    var users = await User.find()

    var emailText = ''

    for (var predictionIndex = 0; predictionIndex < predictionsForEmail.length; predictionIndex++) {
      var prediction = predictionsForEmail[predictionIndex]
      emailText += (prediction.firstTeam + ' - ' + prediction.secondTeam + ' | ' + prediction.league + ' | ' + String(prediction.date).slice(0, 10) + ' | ' + 'Style: Over / Under 2.5 | Risk: ' + prediction.risk + '\n\n')
    }

    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      var user = users[userIndex]
      var emailContentToCustomer = {
        from: 'Fyrebets <info@fyrebets.com>',
        to: user.email,
        subject: "Algo3 Over/Under 2.5 Predictions. There are predictions to bet.",
        text: emailText
      }
      mailgun.messages().send(emailContentToCustomer, function (error, body) {
        console.log(body)
      })
    }
  }
}