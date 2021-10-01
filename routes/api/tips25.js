const express = require('express')
const router = express.Router()
const axios = require('axios')
const schedule = require('node-schedule')

const Match25Tip = require('../../models/Match25Tip')
const User = require('../../models/User')

const webdriver = require('selenium-webdriver')
const chromeDriver = require('selenium-webdriver/chrome')
const path = require('chromedriver').path
const service = new chromeDriver.ServiceBuilder(path).build()
chromeDriver.setDefaultService(service)
const { By, until } = webdriver
webdriver.promise.USE_PROMISE_MANAGER = false
const options = new chromeDriver.Options()
options.setChromeBinaryPath('C:/Program Files/Google/Chrome/Application/chrome.exe')
// options.setChromeBinaryPath('/usr/bin/google-chrome')
options.addArguments(
  // ['--no-sandbox', '--disable-dev-shm-usage']
  ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
)

const htmlContent = require('./data')

const sendCustomersEmailGoodMatches = async () => {
  var matchesFromDB = await Match25Tip.find({ IsNew: true })
  var matches = []

  for (var i = 0; i < matchesFromDB.length; i++) {
    var match = { ...matchesFromDB[i]._doc }
    if (match.h1 >= 24 && match.a1 >= 24) {
      match.risk = 'Good T1'
    } else if (match.h1 >= 24 && match.a1 >= 24 && match.probability >= 85) {
      match.risk = 'Great'
    } else if (match.probability >= 85) {
      match.risk = 'Good T2'
    }
    matches.push(match)
  }

  var matchesForEmail = matches.filter(match => match.risk === 'Good' || match.risk === 'Great')

  if (matchesForEmail.length) {
    var users = await User.find()

    var emailText = ''

    for (var matchIndex = 0; matchIndex < matchesForEmail.length; matchIndex++) {
      var match = matchesForEmail[matchIndex]
      emailText += (match.homeTeam + ' vs ' + match.awayTeam + ' | ' + match.league + ' | ' + match.time + '(EST GMT - 5 / Today) | ' + 'Style: Over / Under | Risk: ' + match.risk + '\n\n')
    }

    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      var user = users[userIndex]
      var emailContentToCustomer = {
        from: 'Fyrebets <info@fyrebets.com>',
        to: user.email,
        subject: "Don't miss the change. There are matches to bet.",
        text: emailText
      }
      mailgun.messages().send(emailContentToCustomer, function (error, body) {
        console.log(body)
      })
    }
  }
}

router.get('/getMatches', async (req, res) => {
  console.log('GET MATCHES TIPS 25')
  await sendCustomersEmailGoodMatches()
  var matchesFromDB = await Match25Tip.find({ IsNew: true })
  var matches = []

  for (var i = 0; i < matchesFromDB.length; i++) {
    var match = { ...matchesFromDB[i]._doc }
    if (match.h1 >= 24 && match.a1 >= 24) {
      match.risk = 'Good'
    } else if (match.h1 >= 24 && match.a1 >= 24 && match.probability >= 85) {
      match.risk = 'Great'
    } else if (match.probability >= 85) {
      match.risk = 'Good'
    }
    matches.push(match)
  }

  res.json({
    success: true,
    matches
  })
})

const rule = new schedule.RecurrenceRule()
rule.minute = 3

const j = schedule.scheduleJob(rule, () => {
  const date = new Date()
  if (date.getHours() % 2 === 0) {
    scrapeMatchesToday()
  }
})

const changeTimeToEst = (time) => {
  var hour = time.slice(0, 2)
  hour = hour - 5
  if (hour < 0) {
    hour += 24
  }
  if (hour < 10) {
    hour = '0' + hour
  }
  hour = hour + `${time.slice(2, 5)}`
  return hour
}

const scrapeMatchesToday = async () => {
  console.log('scrape matches on daily over tips')

  await Match25Tip.deleteMany({ IsNew: false })
  await Match25Tip.updateMany({ IsNew: true }, { IsNew: false }, { new: true })

  var htmlContent = (await axios.get('https://www.over25tips.com/')).data
  var startPos = htmlContent.indexOf('<table class="predictionsTable">')
  var endPos = htmlContent.indexOf('</table>')
  var tableContent = htmlContent.slice(startPos, endPos)
  var tableTrs = tableContent.split('</tr>')
  tableTrs.shift()
  tableTrs.pop()
  for (var i = 0; i < tableTrs.length; i++) {
    var tableTr = tableTrs[i]
    var tableTds = tableTr.split('</td>')
    tableTds.pop()
    var time = tableTds[0].split('>').pop()
    time = changeTimeToEst(time)
    var league = tableTds[1].slice(tableTds[1].indexOf('</span> ') + 8, tableTds[1].length)
    var homeTeam = tableTds[2].slice(tableTds[2].indexOf('"name">') + 7, tableTds[2].length - 8)
    var awayTeam = tableTds[4].slice(tableTds[4].indexOf('"name">') + 7, tableTds[4].length - 8)
    var h1 = tableTds[5].slice(tableTds[5].indexOf('"h1">') + 5, tableTds[5].indexOf('</span>'))
    var h2 = tableTds[6].slice(tableTds[6].indexOf('"h2">') + 6, tableTds[6].indexOf('</span>'))
    var a1 = tableTds[7].slice(tableTds[7].indexOf('"a1">') + 5, tableTds[7].indexOf('</span>'))
    var a2 = tableTds[8].slice(tableTds[8].indexOf('"a2">') + 5, tableTds[8].indexOf('</span>'))
    var a3 = tableTds[9].slice(tableTds[9].indexOf('"a3">') + 5, tableTds[9].indexOf('</span>'))
    var a4 = tableTds[10].slice(tableTds[10].indexOf('"a4">') + 5, tableTds[10].indexOf('</span>'))
    var probability = tableTds[15].slice(tableTds[15].indexOf("25'>") + 4, tableTds[15].indexOf('%</span>'))
    var newMatch = new Match25Tip({
      time, league, homeTeam, awayTeam, h1, h2, a1, a2, a3, a4, probability
    })
    await newMatch.save()
  }
}

router.get('/scrapeMatchesToday', async (req, res) => {
  await scrapeMatchesToday()

  res.json({
    success: true
  })
})

module.exports = router