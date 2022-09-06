const config = require('config')

// AXIOS FOR SCRAPE
const axios = require('axios')

// MODELS
const Match25Tip = require('../models/Match25Tip')
const User = require('../models/User')

// Mailgun Info
const mailgunApiKey = config.get('mailgun.mailgunApiKey')
const mailgunDomain = config.get('mailgun.domain')
var mailgun = require('mailgun-js')({ apiKey: mailgunApiKey, domain: mailgunDomain })

// SCHEDULE
const schedule = require('node-schedule')

const rule = new schedule.RecurrenceRule()
rule.hour = 1
rule.minute = 0

const j = schedule.scheduleJob(rule, async () => {
  await scrapeMatches()
  await sendAlgo2GooMatchesByEmail()
  await sendAlgo4GooMatchesByEmail()
})

const scrapeMatches = async () => {
  try {
    await Match25Tip.updateMany({ IsNew: true }, { IsNew: false }, { new: true })

    var htmlContent = (await axios.get('https://www.over25tips.com/')).data
    var startPos = htmlContent.indexOf('class="predictionsTable"')
    var endPos = htmlContent.indexOf('</table>')
    var tableContent = htmlContent.slice(startPos, endPos)
    var tableTrs = tableContent.split('</tr>')
    tableTrs.shift()
    tableTrs.pop()
    for (var i = 0; i < tableTrs.length; i++) {
      var tableTr = tableTrs[i]
      var tableTds = tableTr.split('</td>')
      tableTds.pop()
      var time = tableTds[0].split('>')
      time = (time[3].split('</'))[0]
      time = changeTimeToEst(time)
      var league = tableTds[1].slice(tableTds[1].indexOf('</span> ') + 8, tableTds[1].length)
      league = (league.split('</span>'))[0]
      var homeTeam = (tableTds[2].slice(tableTds[2].indexOf('"name">') + 7, tableTds[2].indexOf('</span>'))).trim()
      var awayTeam = tableTds[8].slice(tableTds[8].indexOf('"name">') + 7, tableTds[8].indexOf('</span>')).trim()
      var h1 = tableTds[13].slice(tableTds[13].indexOf('"h1">') + 5, tableTds[13].indexOf('</span>'))
      var h2 = tableTds[14].slice(tableTds[14].indexOf('"h2">') + 6, tableTds[14].indexOf('</span>'))
      var a1 = tableTds[15].slice(tableTds[15].indexOf('"a1">') + 5, tableTds[15].indexOf('</span>'))
      var a2 = tableTds[16].slice(tableTds[16].indexOf('"a2">') + 5, tableTds[16].indexOf('</span>'))
      var a3 = tableTds[17].slice(tableTds[17].indexOf('"a3">') + 5, tableTds[17].indexOf('</span>'))
      var a4 = tableTds[18].slice(tableTds[18].indexOf('"a4">') + 5, tableTds[18].indexOf('</span>'))
      var probability = tableTds[23].slice(tableTds[23].indexOf('25">') + 4, tableTds[23].indexOf('%</span>'))
      var newMatch = new Match25Tip({
        time, league, homeTeam, awayTeam, h1, h2, a1, a2, a3, a4, probability
      })
      await newMatch.save()
      console.log('Algo2(4). One Match Added!')
    }
  } catch (error) {
    console.log('------------- SOMETHING WENT WRONG ON ALGO 2 AND ALGO 4 --------------')
    console.log(error)
  }
}

const changeTimeToEst = (time) => {
  var hour = time.slice(0, 2)
  hour = hour - 4
  if (hour < 0) {
    hour += 24
  }
  if (hour < 10) {
    hour = '0' + hour
  }
  hour = hour + `${time.slice(2, 5)}`
  return hour
}

const sendAlgo2GooMatchesByEmail = async () => {
  console.log('SEND ALGO 2 EMAIL')
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

  var matchesForEmail = matches.filter(match => match.risk === 'Medium 1' || match.risk === 'Medium 2' || match.risk === 'Medium 3' || match.risk === 'Good 1' || match.risk === 'Good 2')

  if (matchesForEmail.length) {
    var users = await User.find()

    var emailText = ''

    for (var matchIndex = 0; matchIndex < matchesForEmail.length; matchIndex++) {
      var match = matchesForEmail[matchIndex]
      emailText += (match.homeTeam + ' - ' + match.awayTeam + ' | ' + match.league + ' | ' + match.time + '(EST GMT - 4 / Today) | ' + 'Style: Over / Under | Risk: ' + match.risk + '\n\n')
    }

    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      var user = users[userIndex]
      var emailContentToCustomer = {
        from: 'Fyrebets <info@fyrebets.com>',
        to: user.email,
        subject: "Algo2 Over/Under Strategy. There are matches to bet.",
        text: emailText
      }
      mailgun.messages().send(emailContentToCustomer, function (error, body) {
        console.log(body)
      })
    }
  }
}

const sendAlgo4GooMatchesByEmail = async () => {
  console.log('SEND ALGO 2 EMAIL')
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

  var matchesForEmail = matches.filter(match => match.risk === 'Good T1' || match.risk === 'Good T2' || match.risk === 'Great')

  if (matchesForEmail.length) {
    var users = await User.find()

    var emailText = ''

    for (var matchIndex = 0; matchIndex < matchesForEmail.length; matchIndex++) {
      var match = matchesForEmail[matchIndex]
      emailText += (match.homeTeam + ' - ' + match.awayTeam + ' | ' + match.league + ' | ' + match.time + '(EST GMT - 4 / Today) | ' + 'Style: Over / Under | Risk: ' + match.risk + '\n\n')
    }

    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      var user = users[userIndex]
      var emailContentToCustomer = {
        from: 'Fyrebets <info@fyrebets.com>',
        to: user.email,
        subject: "Algo4 Over/Under Strategy. There are matches to bet.",
        text: emailText
      }
      mailgun.messages().send(emailContentToCustomer, function (error, body) {
        console.log(body)
      })
    }
  }
}

module.exports = {
  scrapeMatches,
  changeTimeToEst,
  sendAlgo2GooMatchesByEmail,
  sendAlgo4GooMatchesByEmail
}