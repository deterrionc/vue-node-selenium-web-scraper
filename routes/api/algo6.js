const express = require('express')
const router = express.Router()
const config = require('config')

// Mailgun Info
const mailgunApiKey = config.get('mailgun.mailgunApiKey')
const mailgunDomain = config.get('mailgun.domain')
var mailgun = require('mailgun-js')({ apiKey: mailgunApiKey, domain: mailgunDomain })

// For Scraping
const axios = require('axios')

// MODELS
const Algo6Match = require('../../models/Algo6Match')
const User = require('../../models/User')

router.get('/getMatches', async (req, res) => {
  console.log('GET ALGO 6 MATCHES')

  const matches = await getGoodMatches()

  res.json({
    success: true,
    matches
  })
})

router.get('/scrapeMatches', async (req, res) => {
  console.log('SCRAPE ALGO 6 MATCHES')

  await scrapeMatches()
  await sendEmail()

  res.json({
    success: true
  })
})

const scrapeMatches = async () => {
  const htmlContent = (await axios.get('https://footballzz.co.uk/over-under-goals-football-predictions-and-statistics')).data
  const overTableContent = htmlContent.slice(htmlContent.indexOf('<tbody>') + 7, htmlContent.indexOf('</tbody>'))
  const underTableContent = htmlContent.slice(htmlContent.lastIndexOf('<tbody>') + 7, htmlContent.lastIndexOf('</tbody>'))
  const tableContent = overTableContent + underTableContent

  var tableTrs = tableContent.split('</tr>')

  if (tableTrs.length > 3) {
    await Algo6Match.updateMany({ IsNew: true }, { IsNew: false })
  }

  tableTrs.pop()

  var months = [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  for (var trIndex = 0; trIndex < tableTrs.length; trIndex++) {
    var tableTr = tableTrs[trIndex]
    var tableTds = tableTr.split('</td>')
    try {
      var time = tableTds[0].slice(tableTds[0].indexOf('ick-off">') + 9, tableTds[0].indexOf('</span>')).trim()
      var year = (time.split(' ')[0]).split('-')[0]
      var month = months[(time.split(' ')[0]).split('-')[1] - 1]
      var date = (time.split(' ')[0]).split('-')[2]
      var hour = (time.split(' ')[1]).split(':')[0]
      var minute = (time.split(' ')[1]).split(':')[1]

      time = new Date(Date.UTC(year, month, date, hour, minute, 0))
      time = new Date(time.valueOf() + (-4) * 3600000)

      var flag = tableTds[1].slice(tableTds[1].indexOf('url(') + 5, tableTds[1].lastIndexOf('")')).trim()
      var name = tableTds[2].slice(tableTds[2].indexOf('itemprop="name">') + 16, tableTds[2].indexOf('</span>')).trim()
      var link = tableTds[2].slice(tableTds[2].indexOf('href="') + 6, tableTds[2].indexOf('title="') - 1).trim()
      var style = tableTds[3].slice(tableTds[3].indexOf('">') + 2, tableTds[3].indexOf('</span>')).trim()
      var logic = tableTds[4].slice(tableTds[4].indexOf('center">') + 8, tableTds[4].length).trim()
      var competition_league = tableTds[1].slice(tableTds[1].indexOf('<span title="') + 13, tableTds[1].lastIndexOf('" class="')).trim()
      var competition = (competition_league.split(' - '))[0]
      var league = convertSpanishToEnglish((competition_league.split(' - '))[1])

      let newAlgo6Match = new Algo6Match({
        time, flag, name, link, style, logic, competition, league
      })

      await newAlgo6Match.save()
    } catch (err) {

    }
  }
}

const convertSpanishToEnglish = word => {
  var tempWord = word.replace('&#243;', 'ó')
  tempWord = tempWord.replace('&#250;', 'ú')
  tempWord = tempWord.replace('&#39;', "'")
  tempWord = tempWord.replace('&#233;', "é")
  tempWord = tempWord.replace('&#241;', "ñ")
  tempWord = tempWord.replace('&#252;', "ü")
  tempWord = tempWord.replace('&#225;', "á")
  tempWord = tempWord.replace('&#246;', "ö")
  tempWord = tempWord.replace('&#237;', "í")
  tempWord = tempWord.replace('&#228;', "ä")
  const regex = /&#(\d)+;/
  tempWord = tempWord.replace(regex, 'á')

  return tempWord
}

const getGoodMatches = async () => {
  const matches = await Algo6Match.find({ IsNew: true })
  return matches
}

const sendEmail = async () => {
  console.log('SEND EMAIL')
  const matches = await getGoodMatches()

  if  (matches.length) {
    var emailText = ''

    for (var matchIndex = 0; matchIndex < matches.length; matchIndex++) {
      var match = matches[matchIndex]
      emailText += (match.name + ' | ' + String(new Date(match.time.valueOf() + 5 * 3600000)).slice(0, 21) + ' UTC | ' + match.competition + ' | ' + match.league + ' | ' + match.style + ' | ' + deleteStrongTag(match.logic) + '\n')
    }

    var users = await User.find()

    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      var user = users[userIndex]
      var emailContentToCustomer = {
        from: 'Fyrebets <info@fyrebets.com>',
        to: user.email,
        subject: "Algo6 Over/Under. There are matches to bet.",
        text: emailText
      }
      mailgun.messages().send(emailContentToCustomer, function (error, body) {
        console.log(body)
      })
    }
  }
}

const deleteStrongTag = word => {
  var tempWord = word.replace('<strong>', '')
  tempWord = tempWord.replace('</strong>', '')
  return tempWord
}

module.exports = router