const express = require('express')
const router = express.Router()

// For Scraping
const axios = require('axios')

// MODELS
const Algo6Match = require('../../models/Algo6Match')
const { titleMatches } = require('selenium-webdriver/lib/until')

router.get('/getMatches', async (req, res) => {
  console.log('GET ALGO 6 MATCHES')

  const matches = await Algo6Match.find({ IsNew: true })

  res.json({
    success: true,
    matches
  })
})

router.get('/scrapeMatches', async (req, res) => {
  console.log('SCRAPE ALGO 6 MATCHES')

  await scrapeMatches()

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

  for (var trIndex = 0; trIndex < tableTrs.length; trIndex++) {
    var tableTr = tableTrs[trIndex]
    var tableTds = tableTr.split('</td>')
    try {
      var time = tableTds[0].slice(tableTds[0].indexOf('content="') + 9, tableTds[0].indexOf('" class=')).trim()
      console.log(time)
      time = (new Date(Date.UTC(time)).toLocaleString(undefined, {
        timeZone: 'UTC'
      }))
      console.log(time)
      var flag = tableTds[1].slice(tableTds[1].indexOf('url(') + 5, tableTds[1].lastIndexOf('")')).trim()
      var name = tableTds[2].slice(tableTds[2].indexOf('itemprop="name">') + 16, tableTds[2].indexOf('</span>')).trim()
      var link = tableTds[2].slice(tableTds[2].indexOf('href="') + 6, tableTds[2].indexOf('title="') - 1).trim()
      var style = tableTds[3].slice(tableTds[3].indexOf('">') + 2, tableTds[3].indexOf('</span>')).trim()
      var logic = tableTds[4].slice(tableTds[4].indexOf('center">') + 8, tableTds[4].length).trim()
      var competition_league =  tableTds[1].slice(tableTds[1].indexOf('<span title="') + 13, tableTds[1].lastIndexOf('" class="')).trim()
      var competition = (competition_league.split(' - '))[0]
      var league = (competition_league.split(' - '))[1]

      let newAlgo6Match = new Algo6Match({
        time, flag, name, link, style, logic, competition, league
      })

      await newAlgo6Match.save()
    } catch (err) {

    }
  }
}

module.exports = router