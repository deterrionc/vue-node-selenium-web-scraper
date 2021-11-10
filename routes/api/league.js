const express = require('express')
const router = express.Router()
const config = require('config')

// MONGO MODEL
const League = require('../../models/League')
const Country = require('../../models/Country')

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

router.get('/scrapeLeagues', async (req, res) => {
  console.log('SCRAPE LEAGUES')

  const driver = await new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  await driver.get('https://www.oddsportal.com/manage-my-leagues/')

  var tableMatches = await driver.findElement(By.id('sport_content_soccer'))
  var tableContent = await tableMatches.getAttribute('innerHTML')

  var htmlTableTrs = tableContent.split('<tbody>').pop()
  htmlTableTrs = htmlTableTrs.slice(0, htmlTableTrs.indexOf('</tbody>'))
  htmlTableTrs = htmlTableTrs.split('xcid')
  htmlTableTrs.shift()
  htmlTableTrs.shift()

  for (var i = 0; i < htmlTableTrs.length; i++) {
    var htmlTableTr = htmlTableTrs[i]
    var countryName = htmlTableTr.slice(htmlTableTr.indexOf('&nbsp;</span>') + 13, htmlTableTr.indexOf('</a></th><'))
    var leagueIds = []
    var country = await Country.findOne({ name: countryName })

    if (country) {
      console.log('\ncountry: ', countryName)

      leagueIds = country.leagues

      var htmlLeagueTrs = htmlTableTr.split('xsid')
      htmlLeagueTrs.shift()
      htmlLeagueTrs.shift()

      for (var j = 0; j < htmlLeagueTrs.length; j++) {
        var htmlLeagueTr = htmlLeagueTrs[j]
        var htmlLeagueTds = htmlLeagueTr.split('</td>')
        htmlLeagueTds.pop()

        for (var k = 0; k < htmlLeagueTds.length; k++) {
          var htmlLeagueTd = htmlLeagueTds[k]
          var leagueName = htmlLeagueTd.slice(htmlLeagueTd.indexOf('this);"> ') + 9, htmlLeagueTd.indexOf(' <span id'))
          if (leagueName && leagueName !== 's="empty"') {
            var league = await League.findOne({ leagueName: leagueName, countryName: countryName })
            if (league) {

            } else {
              console.log('new league: ', leagueName)

              let newLeague = new League({
                leagueName,
                countryName
              })
              var league = await newLeague.save()
              leagueIds.push(league._id)
            }
          }
        }
      }

      await Country.findByIdAndUpdate(country._id, { leagues: leagueIds })
    } else {
      console.log('\ncountry - new: ', countryName)

      var htmlLeagueTrs = htmlTableTr.split('xsid')
      htmlLeagueTrs.shift()
      htmlLeagueTrs.shift()

      for (var j = 0; j < htmlLeagueTrs.length; j++) {
        var htmlLeagueTr = htmlLeagueTrs[j]
        var htmlLeagueTds = htmlLeagueTr.split('</td>')
        htmlLeagueTds.pop()

        for (var k = 0; k < htmlLeagueTds.length; k++) {
          var htmlLeagueTd = htmlLeagueTds[k]
          var leagueName = htmlLeagueTd.slice(htmlLeagueTd.indexOf('this);"> ') + 9, htmlLeagueTd.indexOf(' <span id'))
          if (leagueName && leagueName !== 's="empty"') {
            console.log('league: ', leagueName)
            let newLeague = new League({
              leagueName,
              countryName
            })
            var league = await newLeague.save()
            leagueIds.push(league._id)
          }
        }
      }
      let newCountry = new Country({
        name: countryName,
        leagues: leagueIds
      })
      await newCountry.save()
    }
  }

  await driver.close()
  await driver.quit()

  res.json({
    success: true
  })
})

router.get('/getLeagues', async (req, res) => {
  console.log('GET LEAGUES')
  const countries = await Country.find().populate('leagues')

  res.json({
    success: true,
    countries
  })
})

router.post('/updateLeague/:id', async (req, res) => {
  console.log('UPDATE A LEAGUE')

  await League.findByIdAndUpdate(req.params.id, req.body)

  res.json({
    success: true,
  })
})

module.exports = router