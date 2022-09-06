const express = require('express')
const router = express.Router()
const config = require('config')

// Mailgun Info
const mailgunApiKey = config.get('mailgun.mailgunApiKey')
const mailgunDomain = config.get('mailgun.domain')
var mailgun = require('mailgun-js')({ apiKey: mailgunApiKey, domain: mailgunDomain })

const schedule = require('node-schedule')
const BookMaker = require('../../models/Bookmaker')
const League = require('../../models/League')
const Match = require('../../models/Match')
const OddsData = require('../../models/OddsData')
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

var watchList = []

const fs = require('fs')
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

const composeWatchList = async (matches = []) => {
  var watchListForCompare = []
  for (var i = 0; i < matches.length; i++) {
    var match = {
      name: matches[i].name,
      leagueName: matches[i].leagueName,
      time: matches[i].time,
      homeOdds: matches[i].homeOdds,
      xOdds: matches[i].xOdds,
      awayOdds: matches[i].awayOdds,
      bs: matches[i].bs,
      risk: matches[i].risk,
      select: matches[i].select,
      link: matches[i].link,
      _id: matches[i]._id
    }
    watchListForCompare.push(match)
  }

  var newDate = new Date()
  var hour = newDate.getHours()
  var minute = newDate.getMinutes()

  watchList = watchList.filter(element => {
    if (element.time.length === 5) {
      if (element.time.slice(0, 2) > hour || (element.time.slice(0, 2) == hour && element.time.slice(3, 5) > minute)) {
        return true
      }
    }
  })

  watchListForCompare = watchListForCompare.filter(element => {
    if (element.time.length === 5) {
      if (element.time.slice(0, 2) > hour || (element.time.slice(0, 2) == hour && element.time.slice(3, 5) > minute)) {
        return true
      }
    } else {
      if (element.time.slice(0, 2) > minute) {
        return true
      }
    }
  })

  var invalidMatches = []

  for (var i = 0; i < watchList.length; i++) {
    var match = watchList[i]
    var exist = watchListForCompare.find(element => element.name === match.name)
    if (exist === undefined) {
      // NOT VALID
      match.risk = 'Not Valid'
      invalidMatches.push(match)
    }
  }

  var emailText = ''

  for (var matchIndex = 0; matchIndex < invalidMatches.length; matchIndex++) {
    var match = invalidMatches[matchIndex]
    var match = watchList.find(element => element.name === match.name)
    if (match.emailSent === undefined) {
      emailText += (match.name + ' | ' + match.leagueName + ' | ' + match.time + '(EST GMT - 4) | ' + 'Style: Asian Handicap 0' + ' | Risk: ' + match.risk + ' | ' + 'Notes: Select "win or draw" with ' + (match.select === 'first' ? 'Home Team' : 'Away Team') + '\n\n')
    }
    match.emailSent = true
  }

  var users = await User.find()

  if (emailText.length > 10) {
    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      var user = users[userIndex]
      var emailContentToCustomer = {
        from: 'Fyrebets <info@fyrebets.com>',
        to: user.email,
        subject: "Algo1 Asian Handicap 0. Some Matches changed to Invalid.",
        text: (emailText + 'These matches are still in watch list.')
      }
      mailgun.messages().send(emailContentToCustomer, function (error, body) {
        console.log(body)
      })
    }
  }

  for (var i = 0; i < watchListForCompare.length; i++) {
    var match = watchListForCompare[i]
    var exist = watchList.find(element => element.name === match.name)
    if (exist === undefined) {
      watchList.push(match)
    }
  }

  console.log(watchList)
}

const getGoodMatches = async () => {
  var matches = await getMatches()
  var goodMatches = matches.filter(match => match.risk === 'Good')
  await composeWatchList(goodMatches)
}

const getMatches = async () => {
  var exceptionList = ['888sport', 'Unibet', 'Expekt', 'Betclic', 'NordicBet', 'Betsson', 'Betsafe']
  var matchesFromDB = await Match.find({ IsNew: true, active: true })
  var matches = []
  for (var i = 0; i < matchesFromDB.length; i++) {
    var match = { ...matchesFromDB[i]._doc }
    var oddsDatas = await OddsData.find({
      match: match._id,
      bookmakerActive: true,
      IsNew: true
    })

    var blockedOddsDatas = await OddsData.find({
      match: match._id,
      bookmakerActive: true,
      active: false,
      IsNew: true
    })

    if (match.homeOdds >= 1.7 || match.awayOdds >= 1.7) {
      if (blockedOddsDatas.length === 0) {
        // RULE3! NO BLOCKED ODDS, ALL UP OR DOWN
        var homeCounter = 0
        var awayCounter = 0
        for (var j = 0; j < oddsDatas.length; j++) {
          var oddsData = oddsDatas[j]
          if (oddsData.homeMove === 'up' && oddsData.active) {
            homeCounter++
          }

          if (oddsData.awayMove === 'up' && oddsData.active) {
            awayCounter++
          }
        }

        match.select = null

        if ((homeCounter === oddsDatas.length || awayCounter === oddsDatas.length) && oddsDatas.length > 7) {
          match.risk = 'Good'
          if (homeCounter > 0) {
            match.select = 'first'
          }
          if (awayCounter > 0) {
            match.select = 'second'
          }
        }
      }

      if (blockedOddsDatas.length > 0) {
        // RULE4-A! BLOCKED ODDS, NO ARROW CHANGE, ALL UP OR DOWN
        var noArrows = 0
        for (var k = 0; k < blockedOddsDatas.length; k++) {
          var blockedOddsData = blockedOddsDatas[k]
          if (blockedOddsData.homeMove === '' && blockedOddsData.awayMove === '') {
            noArrows++
          }
        }
        if (noArrows === blockedOddsDatas.length) {
          var homeCounter = 0
          var awayCounter = 0
          for (var j = 0; j < oddsDatas.length; j++) {
            var oddsData = oddsDatas[j]
            if (oddsData.homeMove === 'up' && oddsData.active) {
              homeCounter++
            }

            if (oddsData.awayMove === 'up' && oddsData.active) {
              awayCounter++
            }
          }

          match.select = null

          if ((homeCounter === (oddsDatas.length - blockedOddsDatas.length) || awayCounter === (oddsDatas.length - blockedOddsDatas.length)) && oddsDatas.length > 7) {
            match.risk = 'Good'
            if (homeCounter > 0) {
              match.select = 'first'
            }
            if (awayCounter > 0) {
              match.select = 'second'
            }
          }
        }
      }

      if (blockedOddsDatas.length === 1) {
        if (blockedOddsDatas[0].homeMove !== '' && blockedOddsDatas[0].awayMove !== '') {
          // RULE4-B! 1 BLOCKED ODD, ARROW CHANGE, 888.com, ALL UP OR DOWN
          if (blockedOddsDatas[0].bookmaker === '888sport') {
            var homeCounter = 0
            var awayCounter = 0
            for (var j = 0; j < oddsDatas.length; j++) {
              var oddsData = oddsDatas[j]
              if (oddsData.homeMove === 'up' && oddsData.active) {
                homeCounter++
              }

              if (oddsData.awayMove === 'up' && oddsData.active) {
                awayCounter++
              }
            }

            match.select = null

            if ((homeCounter >= oddsDatas.length - 1 || awayCounter >= oddsDatas.length - 1) && oddsDatas.length > 7) {
              match.risk = 'Good'
              if (homeCounter > 0) {
                match.select = 'first'
              }
              if (awayCounter > 0) {
                match.select = 'second'
              }
            }
          }
          // RULE4-C! 1 BLOCKED ODD, ARROW CHANGE, BetInAsia
          if (blockedOddsDatas[0].bookmaker === 'BetInAsia') {
            var homeCounter = 0
            var awayCounter = 0
            for (var j = 0; j < oddsDatas.length; j++) {
              var oddsData = oddsDatas[j]
              if (oddsData.homeMove === 'up' && oddsData.active) {
                homeCounter++
              }

              if (oddsData.awayMove === 'up' && oddsData.active) {
                awayCounter++
              }
            }

            match.select = null

            if ((homeCounter >= oddsDatas.length - 1 || awayCounter >= oddsDatas.length - 1) && oddsDatas.length > 7) {
              match.risk = 'Good'
              if (homeCounter > 0) {
                match.select = 'second'
              }
              if (awayCounter > 0) {
                match.select = 'first'
              }
            }
          }
        } else if (blockedOddsDatas[0].homeMove === '' && blockedOddsDatas[0].awayMove === '') {
          // RULE4-E! 1xbet, no change
          if (blockedOddsDatas[0].bookmaker === '1xBet') {
            match.risk = ''
            match.select = ''
          }
        } else {
          // RULE4-F! 1 gray arrow
          match.risk = ''
          match.select = ''
        }
      }

      if (blockedOddsDatas.length >= 2) {
        // RULE4-D! 
        var homeCounter = 0
        var awayCounter = 0
        for (var j = 0; j < oddsDatas.length; j++) {
          var oddsData = oddsDatas[j]
          if (oddsData.homeMove === 'up' && oddsData.active) {
            homeCounter++
          }

          if (oddsData.awayMove === 'up' && oddsData.active) {
            awayCounter++
          }
        }

        match.select = null

        if ((homeCounter >= oddsDatas.length - 1 || awayCounter >= oddsDatas.length - 1) && oddsDatas.length > 7) {
          match.risk = 'Good'
          if (homeCounter > 0) {
            match.select = 'second'
          }
          if (awayCounter > 0) {
            match.select = 'first'
          }
        }
      }
    }

    // EXCEPTION! HIGH RISK FIND
    var maxOddsData = oddsDatas.sort((a, b) => {
      return a.homeOdds - b.homeOdds
    }).pop()

    if (maxOddsData) {
      if (exceptionList.find(element => element === maxOddsData.bookmaker)) {
        match.risk = 'High Risk'
        match.select = null
      }
    }

    match.bs = oddsDatas.length
    matches.push(match)
  }

  return matches
}

const sendCustomersEmailGoodMatches = async () => {
  await getGoodMatches()

  if (watchList.length) {
    var users = await User.find()

    var emailText = ''

    for (var matchIndex = 0; matchIndex < watchList.length; matchIndex++) {
      var match = watchList[matchIndex]
      emailText += (match.name + ' | ' + match.leagueName + ' | ' + match.time + '(EST GMT - 4) | ' + 'Style: Asian Handicap 0' + ' | Risk: ' + match.risk + ' | ' + 'Notes: Select "win or draw" with ' + (match.select === 'first' ? 'Home Team' : 'Away Team') + '\n\n')
    }

    for (var userIndex = 0; userIndex < users.length; userIndex++) {
      var user = users[userIndex]
      var emailContentToCustomer = {
        from: 'Fyrebets <info@fyrebets.com>',
        to: user.email,
        subject: "Algo1 Asian Handicap 0. There are matches to bet.",
        text: emailText
      }
      mailgun.messages().send(emailContentToCustomer, function (error, body) {
        console.log(body)
      })
    }
  }
}

router.get('/getWatchList', async (req, res) => {
  res.json({
    success: true,
    watchlist: watchList
  })
})

router.get('/getMatches', async (req, res) => {
  console.log('Get Matches')
  var exceptionList = ['888sport', 'Unibet', 'Expekt', 'Betclic', 'NordicBet', 'Betsson', 'Betsafe']
  var matches = await Match.find({ IsNew: true, active: true })
  var matchesForSend = []
  for (var i = 0; i < matches.length; i++) {
    var match = { ...matches[i]._doc }
    var oddsDatas = await OddsData.find({
      match: match._id,
      bookmakerActive: true,
      IsNew: true
    })

    var blockedOddsDatas = await OddsData.find({
      match: match._id,
      bookmakerActive: true,
      active: false,
      IsNew: true
    })

    if (match.homeOdds >= 1.7 || match.awayOdds >= 1.7) {
      if (blockedOddsDatas.length === 0) {
        // RULE3! NO BLOCKED ODDS, ALL UP OR DOWN
        var homeCounter = 0
        var awayCounter = 0
        for (var j = 0; j < oddsDatas.length; j++) {
          var oddsData = oddsDatas[j]
          if (oddsData.homeMove === 'up' && oddsData.active) {
            homeCounter++
          }

          if (oddsData.awayMove === 'up' && oddsData.active) {
            awayCounter++
          }
        }

        match.select = null

        if ((homeCounter === oddsDatas.length || awayCounter === oddsDatas.length) && oddsDatas.length > 7) {
          match.risk = 'Good'
          if (homeCounter > 0) {
            match.select = 'first'
          }
          if (awayCounter > 0) {
            match.select = 'second'
          }
        }
      }

      if (blockedOddsDatas.length > 0) {
        // RULE4-A! BLOCKED ODDS, NO ARROW CHANGE, ALL UP OR DOWN
        var noArrows = 0
        for (var k = 0; k < blockedOddsDatas.length; k++) {
          var blockedOddsData = blockedOddsDatas[k]
          if (blockedOddsData.homeMove === '' && blockedOddsData.awayMove === '') {
            noArrows++
          }
        }
        if (noArrows === blockedOddsDatas.length) {
          var homeCounter = 0
          var awayCounter = 0
          for (var j = 0; j < oddsDatas.length; j++) {
            var oddsData = oddsDatas[j]
            if (oddsData.homeMove === 'up' && oddsData.active) {
              homeCounter++
            }

            if (oddsData.awayMove === 'up' && oddsData.active) {
              awayCounter++
            }
          }

          match.select = null

          if ((homeCounter === (oddsDatas.length - blockedOddsDatas.length) || awayCounter === (oddsDatas.length - blockedOddsDatas.length)) && oddsDatas.length > 7) {
            match.risk = 'Good'
            if (homeCounter > 0) {
              match.select = 'first'
            }
            if (awayCounter > 0) {
              match.select = 'second'
            }
          }
        }
      }

      if (blockedOddsDatas.length === 1) {
        if (blockedOddsDatas[0].homeMove !== '' && blockedOddsDatas[0].awayMove !== '') {
          // RULE4-B! 1 BLOCKED ODD, ARROW CHANGE, 888.com, ALL UP OR DOWN
          if (blockedOddsDatas[0].bookmaker === '888sport') {
            var homeCounter = 0
            var awayCounter = 0
            for (var j = 0; j < oddsDatas.length; j++) {
              var oddsData = oddsDatas[j]
              if (oddsData.homeMove === 'up' && oddsData.active) {
                homeCounter++
              }

              if (oddsData.awayMove === 'up' && oddsData.active) {
                awayCounter++
              }
            }

            match.select = null

            if ((homeCounter >= oddsDatas.length - 1 || awayCounter >= oddsDatas.length - 1) && oddsDatas.length > 7) {
              match.risk = 'Good'
              if (homeCounter > 0) {
                match.select = 'first'
              }
              if (awayCounter > 0) {
                match.select = 'second'
              }
            }
          }
          // RULE4-C! 1 BLOCKED ODD, ARROW CHANGE, BetInAsia
          if (blockedOddsDatas[0].bookmaker === 'BetInAsia') {
            var homeCounter = 0
            var awayCounter = 0
            for (var j = 0; j < oddsDatas.length; j++) {
              var oddsData = oddsDatas[j]
              if (oddsData.homeMove === 'up' && oddsData.active) {
                homeCounter++
              }

              if (oddsData.awayMove === 'up' && oddsData.active) {
                awayCounter++
              }
            }

            match.select = null

            if ((homeCounter >= oddsDatas.length - 1 || awayCounter >= oddsDatas.length - 1) && oddsDatas.length > 7) {
              match.risk = 'Good'
              if (homeCounter > 0) {
                match.select = 'second'
              }
              if (awayCounter > 0) {
                match.select = 'first'
              }
            }
          }
        } else if (blockedOddsDatas[0].homeMove === '' && blockedOddsDatas[0].awayMove === '') {
          // RULE4-E! 1xbet, no change
          if (blockedOddsDatas[0].bookmaker === '1xBet') {
            match.risk = ''
            match.select = ''
          }
        } else {
          // RULE4-F! 1 gray arrow
          match.risk = ''
          match.select = ''
        }
      }

      if (blockedOddsDatas.length >= 2) {
        // RULE4-D! 
        var homeCounter = 0
        var awayCounter = 0
        for (var j = 0; j < oddsDatas.length; j++) {
          var oddsData = oddsDatas[j]
          if (oddsData.homeMove === 'up' && oddsData.active) {
            homeCounter++
          }

          if (oddsData.awayMove === 'up' && oddsData.active) {
            awayCounter++
          }
        }

        match.select = null

        if ((homeCounter >= oddsDatas.length - 1 || awayCounter >= oddsDatas.length - 1) && oddsDatas.length > 7) {
          match.risk = 'Good'
          if (homeCounter > 0) {
            match.select = 'second'
          }
          if (awayCounter > 0) {
            match.select = 'first'
          }
        }
      }
    }

    // EXCEPTION! HIGH RISK FIND
    var maxOddsData = oddsDatas.sort((a, b) => {
      return a.homeOdds - b.homeOdds
    }).pop()

    if (maxOddsData) {
      if (exceptionList.find(element => element === maxOddsData.bookmaker)) {
        match.risk = 'High Risk'
        match.select = null
      }
    }

    match.bs = oddsDatas.length
    matchesForSend.push(match)
  }

  res.json({
    success: true,
    matches: matchesForSend
  })
})

router.get('/getMatchDetail/:id', async (req, res) => {
  console.log('GET MATCH DETAIL')

  const match = await Match.findById(req.params.id)
  var oddsdatas = await OddsData.find({
    match: req.params.id,
    bookmakerActive: true,
    IsNew: true
  })

  for (var i = 0; i < oddsdatas.length; i++) {
    if (oddsdatas.homoMove === '' && oddsdatas.awayMove === '') {
      oddsdatas[i].active = false
    }
  }

  res.json({
    success: true,
    match,
    oddsdatas
  })
})

const scrapeOnMatchTimeForValidCheck = async () => {
  var newDate = new Date()
  var hour = newDate.getHours()
  var minute = newDate.getMinutes()

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

  var tempWatchListForSet = [...watchList]

  for (var i = 0; i < watchList.length; i++) {
    var match = watchList[i]
    if (match.time.length === 5) {
      var matchHour = match.time.slice(0, 2)
      var matchMinute = match.time.slice(3, 5)
      if (Number(matchHour) == hour && (minute - Number(matchMinute)) < 15) {
        console.log(match)
        await scrapeMatchDetail(driver, match.link, match._id)
        var matches = await getMatches()
        var goodMatches = matches.filter(element => element.risk === 'Good')
        var exist = goodMatches.find(element => element._id === match._id)
        if (exist) {
          emailText = (match.name + ' | ' + match.leagueName + ' | ' + match.time + '(EST GMT - 4) | ' + 'Style: Asian Handicap 0' + ' | Risk: ' + match.risk + ' | ' + 'Notes: Select "win or draw" with ' + (match.select === 'first' ? 'Home Team' : 'Away Team') + '\n\n')
          var users = await User.find()
          for (var userIndex = 0; userIndex < users.length; userIndex++) {
            var user = users[userIndex]
            var emailContentToCustomer = {
              from: 'Fyrebets <info@fyrebets.com>',
              to: user.email,
              subject: "Algo1 Asian Handicap 0. Valid Match Started.",
              text: emailText
            }
            mailgun.messages().send(emailContentToCustomer, function (error, body) {
              console.log(body)
            })
          }
        }
        tempWatchListForSet = tempWatchListForSet.filter(element => element.name != match.name)
      }
    }
  }

  await driver.close()
  await driver.quit()

  watchList = tempWatchListForSet
}

// const ruleForMatch1 = new schedule.RecurrenceRule()
// ruleForMatch1.minute = 10

// const scheduleForMatch1 = schedule.scheduleJob(ruleForMatch1, () => {
//   scrapeOnMatchTimeForValidCheck()
// })

// const ruleForMatch2 = new schedule.RecurrenceRule()
// ruleForMatch2.minute = 25

// const scheduleForMatch2 = schedule.scheduleJob(ruleForMatch2, () => {
//   scrapeOnMatchTimeForValidCheck()
// })

// const ruleForMatch3 = new schedule.RecurrenceRule()
// ruleForMatch3.minute = 40

// const scheduleForMatch3 = schedule.scheduleJob(ruleForMatch3, () => {
//   scrapeOnMatchTimeForValidCheck()
// })

// const ruleForMatch4 = new schedule.RecurrenceRule()
// ruleForMatch4.minute = 55

// const scheduleForMatch4 = schedule.scheduleJob(ruleForMatch4, () => {
//   scrapeOnMatchTimeForValidCheck()
// })

// const ruleForScrape = new schedule.RecurrenceRule()
// ruleForScrape.minute = 5

// const scheduleForScrape = schedule.scheduleJob(ruleForScrape, () => {
//   const date = new Date()
//   if (date.getHours() % 2 === 0) {
//     scrapeMatchesToday()
//   }
// })

router.get('/scrapeMatchesToday', async (req, res) => {
  await scrapeMatchesToday()

  res.json({
    success: true
  })
})

const scrapeMatchesToday = async () => {
  console.log('Scrape Matches Today')

  const driver = await new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  try {
    await Match.updateMany({ IsNew: true }, { IsNew: false }, { new: true })
    await OddsData.updateMany({ IsNew: true }, { IsNew: false }, { new: true })

    await driver.get('https://www.oddsportal.com/login/')
    await driver.findElement(By.id('onetrust-reject-all-handler')).click()
    await driver.findElement(By.name('login-username')).sendKeys('sbhooley')
    await driver.findElement(By.name('login-password')).sendKeys('Access2020$')
    await driver.findElement(By.xpath("//div[@class='item']/button[@type='submit']")).click()
    await driver.sleep(5000)

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
      var countryName = htmlTableTr.slice(htmlTableTr.indexOf('&nbsp;</span>') + 13, htmlTableTr.indexOf('</a><span '))
      var leagueName = htmlTableTr.slice(htmlTableTr.indexOf('</span><a') + 13, htmlTableTr.indexOf('</a></th>'))
      var leagueName = leagueName.split('/">').pop()

      var htmlMatchTrs = htmlTableTr.split('xeid')
      htmlMatchTrs.shift()

      for (var j = 0; j < htmlMatchTrs.length; j++) {
        var htmlMatchTr = htmlMatchTrs[j]
        var htmlMatchTds = htmlMatchTr.split('<td')
        htmlMatchTds.shift()
        var time = htmlMatchTds[0].slice(htmlMatchTds[0].indexOf('">') + 2, htmlMatchTds[0].indexOf('<'))
        var name = htmlMatchTds[1].slice(htmlMatchTds[1].indexOf('<a'), htmlMatchTds[1].indexOf('</td>'))
        name = name.slice(name.lastIndexOf('/">') + 3, name.lastIndexOf('</a>'))
        name = deleteMatchNameSpan(name)
        var link = htmlMatchTds[1].slice(htmlMatchTds[1].lastIndexOf('href="/') + 6, htmlMatchTds[1].lastIndexOf('/">'))
        var link = 'https://www.oddsportal.com' + link
        if (htmlMatchTds.length > 6) {
          var score = htmlMatchTds[2].slice(htmlMatchTds[2].lastIndexOf('">') + 2, htmlMatchTds[2].indexOf('</'))
          var homeOdds = htmlMatchTds[3].slice(htmlMatchTds[3].indexOf('odds_text">') + 11, htmlMatchTds[3].indexOf('</a>'))
          var xOdds = htmlMatchTds[4].slice(htmlMatchTds[4].indexOf('odds_text">') + 11, htmlMatchTds[4].indexOf('</a>'))
          var awayOdds = htmlMatchTds[5].slice(htmlMatchTds[5].indexOf('odds_text">') + 11, htmlMatchTds[5].indexOf('</a>'))
          var bs = htmlMatchTds[6].slice(htmlMatchTds[6].indexOf('">') + 2, htmlMatchTds[6].indexOf('</td>'))

          var newMatch = new Match({ name, link, countryName, leagueName, score, time, homeOdds, xOdds, awayOdds, bs })

          var league = await League.findOne({ leagueName, countryName })

          if (league) {
            if (league.active) {
              newMatch.active = true
              await scrapeMatchDetail(driver, link, newMatch._id)
              console.log('Active Match Found')
            }
          }

          await newMatch.save()
        } else {
          var homeOdds = htmlMatchTds[2].slice(htmlMatchTds[2].indexOf('odds_text">') + 11, htmlMatchTds[2].indexOf('</a>'))
          var xOdds = htmlMatchTds[3].slice(htmlMatchTds[3].indexOf('odds_text">') + 11, htmlMatchTds[3].indexOf('</a>'))
          var awayOdds = htmlMatchTds[4].slice(htmlMatchTds[4].indexOf('odds_text">') + 11, htmlMatchTds[4].indexOf('</a>'))
          var bs = htmlMatchTds[5].slice(htmlMatchTds[5].indexOf('">') + 2, htmlMatchTds[5].indexOf('</td>'))

          var newMatch = new Match({ name, link, countryName, leagueName, time, homeOdds, xOdds, awayOdds, bs })

          var league = await League.findOne({ leagueName, countryName })

          if (league) {
            if (league.active) {
              newMatch.active = true
              await scrapeMatchDetail(driver, link, newMatch._id)
              console.log('Active Match Found')
            }
          }

          await newMatch.save()
        }
      }
    }

    await driver.close()
    await driver.quit()

    // await sendCustomersEmailGoodMatches()
  } catch (error) {
    console.log('------------- SOMETHING WENT WRONG ON ALGO 1 --------------')
    console.log(error)
  }
}

async function scrapeMatchDetail(driver, link, matchID) {
  var link = link + '/#ah;2;0.00;0'

  // await OddsData.deleteMany({ IsNew: false, match: matchID })
  await OddsData.updateMany({ IsNew: true, match: matchID }, { IsNew: false }, { new: true })

  await driver.get(link)
  try {
    var tableMatches = await driver.findElement(By.className('table-main detail-odds sortable'))
    var tableContent = await tableMatches.getAttribute('innerHTML')

    var htmlTbody = tableContent.split('<tbody>').pop()
    htmlTbody = htmlTbody.slice(0, htmlTbody.indexOf('</tbody>'))
    var htmlTrs = htmlTbody.split('<tr')
    htmlTrs.pop()
    htmlTrs.shift()
    for (var i = 0; i < htmlTrs.length; i++) {
      var htmlTr = htmlTrs[i]
      var htmlTds = htmlTr.split('<td')
      htmlTds.shift()

      var bookmaker = htmlTds[0].slice(htmlTds[0].lastIndexOf('link/">') + 7, htmlTds[0].lastIndexOf('</a>&nbsp;'))
      var active = true
      if (htmlTds[2].indexOf('dark') > 0) {
        active = false
      }
      var homeOdds = htmlTds[2].slice(htmlTds[2].lastIndexOf('">') + 2, htmlTds[2].indexOf('</'))
      var homeMove = ''
      if (htmlTds[2].indexOf('up') > 0) {
        homeMove = 'up'
      }
      if (htmlTds[2].indexOf('down') > 0) {
        homeMove = 'down'
      }
      var awayOdds = htmlTds[3].slice(htmlTds[3].lastIndexOf('">') + 2, htmlTds[3].indexOf('</'))
      var awayMove = ''
      if (htmlTds[3].indexOf('up') > 0) {
        awayMove = 'up'
      }
      if (htmlTds[3].indexOf('down') > 0) {
        awayMove = 'down'
      }
      var bookmakerActive = false
      var bookmakerOnDB = await BookMaker.findOne({
        WebName: bookmaker,
        setAsMine: true
      })
      if (bookmakerOnDB) {
        bookmakerActive = true
      }
      var newOddsData = new OddsData({
        match: matchID,
        bookmaker,
        bookmakerActive,
        active,
        homeOdds,
        homeMove,
        awayOdds,
        awayMove,
        IsNew: true
      })
      await newOddsData.save()
      console.log('Algo1. ONE MATCH ADDED')
    }
  } catch (err) {
    console.log(err)
  }

  // await driver.close()
}

module.exports = router