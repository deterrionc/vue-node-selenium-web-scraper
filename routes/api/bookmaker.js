const express = require('express')
const router = express.Router()

// For Scraping
const axios = require('axios')

// MONGO MODEL
const BookMaker = require('../../models/Bookmaker')

router.get('/scrapeBookmakers', async (req, res) => {
  console.log('SCRAPE BOOKMAKERS')
  const bookmakers = (await axios.get(`https://api.scraperapi.com/?api_key=6af9cf06b17cf2704e36098822044500&url=https://www.oddsportal.com/res/x/bookies-210812124947-1628800616.js`)).data

  if (bookmakers.length > 50) {
    await BookMaker.deleteMany()

    let startPos = bookmakers.indexOf('{')
    let endPos = bookmakers.lastIndexOf('var bookiesLoaded')
    let targetString = bookmakers.slice(startPos, endPos - 1)
    let jsonObject = JSON.parse(targetString)
    let objectKeys = Object.keys(jsonObject)
    let bookmakerArray = []

    objectKeys.forEach(async element => {
      bookmakerArray.push(jsonObject[element])
    })

    bookmakerArray = bookmakerArray.sort((a, b) => { return a.idProvider - b.idProvider })

    bookmakerArray.forEach(async element => {
      await BookMaker.create(element)
    })

    res.json({
      success: true
    })
  } else {
    res.json({
      success: false
    })
  }
})

router.get('/getBookmakers', async (req, res) => {
  console.log('GET BOOKMAKERS')
  let bookmakers = await BookMaker.find()
  bookmakers = bookmakers.filter(element => element.Active === 'y')

  const premiumBookmakers = bookmakers.filter(element => element.IsPremium === 'y').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const myBookmakers = bookmakers.filter(element => element.PreferredCountryID === '0' && element.IsPremium === 'n').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const czezhBookmakers = bookmakers.filter(element => element.PreferredCountryID === '62').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const frenchBookmakers = bookmakers.filter(element => element.PreferredCountryID === '77').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const italianBookmakers = bookmakers.filter(element => element.PreferredCountryID === '98').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const polishBookmakers = bookmakers.filter(element => element.PreferredCountryID === '154').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const russianBookmakers = bookmakers.filter(element => element.PreferredCountryID === '158').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const slovakBookmakers = bookmakers.filter(element => element.PreferredCountryID === '171').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  const spanishBookmakers = bookmakers.filter(element => element.PreferredCountryID === '176').sort((a, b) => {
    return a.WebName.toLowerCase().charCodeAt() - b.WebName.toLowerCase().charCodeAt()
  })

  res.json({
    success: true,
    premiumBookmakers,
    myBookmakers,
    czezhBookmakers,
    frenchBookmakers,
    italianBookmakers,
    polishBookmakers,
    russianBookmakers,
    slovakBookmakers,
    spanishBookmakers
  })
})

router.post('/editBookmaker', async (req, res) => {
  console.log('EDIT A BOOKMAKER')
  await BookMaker.findByIdAndUpdate(req.body.id, { setAsMine: req.body.value }, { new: true })
  res.json({
    success: true
  })
})

module.exports = router