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
options.setChromeBinaryPath(config.get('selenium.chromeBinaryPath'))
options.addArguments(
  config.get('selenium.arguments')
)

router.get('/getMatches', async (req, res) => {
  console.log('GET ALGO 3 MATCHES')

  const predictions = await getGoodPredictions()

  res.json({
    success: true,
    matches: predictions
  })
})

router.get('/scrapeMatches', async (req, res) => {
  console.log('SCRAPE ALGO 3 MATCHES')
  await scrapePredictionMatches()

  res.json({
    success: true
  })
})

module.exports = router

const ruleForScrape = new schedule.RecurrenceRule()
ruleForScrape.minute = 15

const scheduleForScrape = schedule.scheduleJob(ruleForScrape, () => {
  const date = new Date()
  if (date.getHours() % 8 === 1) {
    scrapePredictionMatches()
  }
})

const scrapePredictionMatches = async () => {
  try {
    const matches = await getTodayOddsMatcheNames()

    await Prediction.updateMany({ IsNew: true }, { IsNew: false })

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
        var handicapOver = null

        for (var matchIndex = 0; matchIndex < matches.length; matchIndex++) {
          var teamNames = matches[matchIndex].name.split(' - ')
          var pFirstTeam = remove_FK_FC_SC(firstTeam)
          var pSecondTeam = remove_FK_FC_SC(secondTeam)
          var mFirstTeam = remove_FK_FC_SC(teamNames[0])
          var mSecondTeam = remove_FK_FC_SC(teamNames[1])

          if (pFirstTeam === mFirstTeam && pSecondTeam === mSecondTeam) {
            oddLink = matches[matchIndex].link + oddLink
            handicapOver = await getHandicapOverValue(oddLink)
          }
        }

        var newPrediction = new Prediction({
          winningTeam, percent, link, firstTeam, secondTeam, country, league, date, handicapOver
        })

        await newPrediction.save()
        console.log('Algo3. One Match Added!')
      }
    }

    var goodPredictions = await getGoodPredictions()
    await sendCustomersEmailGoodMatches(goodPredictions)
  } catch (error) {
    console.log('------------- SOMETHING WENT WRONG ON ALGO 3 --------------')
    console.log(error)
  }
}

const getTodayOddsMatcheNames = async () => {
  console.log('GET ALGO 3 ODDS MATCHES')
  var matches = []
  const driver = await new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  try {
    await driver.get('https://www.oddsportal.com/login/')
    await driver.findElement(By.name('login-username')).sendKeys('sbhooley')
    await driver.findElement(By.name('login-password')).sendKeys('Access2020$')
    await driver.findElement(By.xpath("//div[@class='item']/button[@type='submit']")).click()

    await driver.get('https://www.oddsportal.com/matches/soccer/')
    await driver.findElement(By.id('user-header-oddsformat-expander')).click()
    await driver.findElement(By.linkText('EU Odds')).click()

    var tableMatches = await driver.findElement(By.id('table-matches'))
    var tableContent = await tableMatches.getAttribute('innerHTML')

    var htmlTableTrs = tableContent.split('<tbody>').pop()
    htmlTableTrs = htmlTableTrs.slice(0, htmlTableTrs.indexOf('</tbody>'))
    htmlTableTrs = htmlTableTrs.split('xtid')
    htmlTableTrs.shift()

    for (var i = 0; i < htmlTableTrs.length; i++) {
      var htmlTableTr = htmlTableTrs[i]
      var htmlMatchTrs = htmlTableTr.split('xeid')
      htmlMatchTrs.shift()

      for (var j = 0; j < htmlMatchTrs.length; j++) {
        var htmlMatchTr = htmlMatchTrs[j]
        var htmlMatchTds = htmlMatchTr.split('<td')
        htmlMatchTds.shift()
        var name = htmlMatchTds[1].slice(htmlMatchTds[1].indexOf('<a'), htmlMatchTds[1].indexOf('</td>'))
        name = name.slice(name.lastIndexOf('/">') + 3, name.lastIndexOf('</a>'))
        name = deleteMatchNameSpan(name)
        var link = htmlMatchTds[1].slice(htmlMatchTds[1].lastIndexOf('href="/') + 6, htmlMatchTds[1].lastIndexOf('/">'))
        var link = 'https://www.oddsportal.com' + link

        var match = {
          name,
          link
        }

        matches.push(match)
      }
    }

    await driver.close()
    await driver.quit()

    return matches
  } catch (err) {
    await driver.close()
    await driver.quit()

    return matches
  }
}

const getHandicapOverValue = async (oddLink) => {
  var handicapValue = null

  const driver = await new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  try {
    await driver.get('https://www.oddsportal.com/login/')
    await driver.findElement(By.name('login-username')).sendKeys('sbhooley')
    await driver.findElement(By.name('login-password')).sendKeys('Access2020$')
    await driver.findElement(By.xpath("//div[@class='item']/button[@type='submit']")).click()

    await driver.get('https://www.oddsportal.com/matches/soccer/')
    await driver.findElement(By.id('user-header-oddsformat-expander')).click()
    await driver.findElement(By.linkText('EU Odds')).click()

    await driver.get(oddLink)
    var ouTableContent = await driver.findElement(By.id('odds-data-table'))
    var ouTableContentText = await ouTableContent.getText()
    var textArray = ouTableContentText.split('Compare odds\n')
    var targetText = textArray.find(element => element.indexOf('Over/Under +2.5') > -1)
    var targetValuesArray = targetText.split('\n')
    handicapValue = targetValuesArray[3]

    await driver.close()
    await driver.quit()

    return handicapValue
  } catch (err) {
    console.log(err)
    return handicapValue
  }
}

const remove_FK_FC_SC = (teamName) => {
  var name = teamName.replace(' FK', '')
  name = teamName.replace('FK ', '')
  name = teamName.replace(' FC', '')
  name = teamName.replace('FC ', '')
  name = teamName.replace(' SC', '')
  name = teamName.replace('SC ', '')
  return name
}

const deleteMatchNameSpan = (matchName) => {
  var teamNames = matchName.split(' - ')
  for (var i = 0; i < teamNames.length; i++) {
    var teamName = teamNames[i]
    if (teamName.indexOf('</span>') > 0) {
      teamName = teamName.slice(teamName.indexOf('">') + 2, teamName.indexOf('</'))
    }
    teamNames[i] = teamName
  }
  return (teamNames[0] + ' - ' + teamNames[1])
}

const getGoodPredictions = async () => {
  const predictionsFromDB = await Prediction.find({IsNew: true})
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var today = new Date(`${year}-${month}-${day}`)
  var predictions = []
  for (var i = 0; i < predictionsFromDB.length; i++) {
    var prediction = { ...predictionsFromDB[i]._doc }
    var intervalInDays = (prediction.date - today) / 86400000

    if (intervalInDays >= 0 && intervalInDays < 2) {
      prediction.risk1 = 'Available'
    } else {
      prediction.risk1 = null
    }

    if (prediction.handicapOver === null) {
      prediction.risk2 = null
    } else if (prediction.handicapOver >= 1.3 && prediction.handicapOver <= 1.8) {
      prediction.risk2 = 'Good'
    } else {
      prediction.risk2 = 'Exist'
    }

    predictions.push(prediction)
  }

  return predictions
}

const sendCustomersEmailGoodMatches = async (predictions) => {
  var predictionsForEmail = predictions.filter(prediction => prediction.risk2 === 'Good' || prediction.risk2 === 'Exist')

  if (predictionsForEmail.length) {
    var users = await User.find()

    var emailText = ''

    for (var predictionIndex = 0; predictionIndex < predictionsForEmail.length; predictionIndex++) {
      var prediction = predictionsForEmail[predictionIndex]
      emailText += (prediction.firstTeam + ' - ' + prediction.secondTeam + ' | ' + prediction.league + ' | ' + String(prediction.date).slice(0, 10) + ' | Style: Over / Under 2.5 | Risk: ' + prediction.risk2 + ' | Color: ' + (prediction.risk2 === 'Good' ? 'Green' : 'Purple') + '\n\n')
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