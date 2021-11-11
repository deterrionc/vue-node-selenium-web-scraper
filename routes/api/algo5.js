const express = require('express')
const router = express.Router()
const config = require('config')

// SELENIUM
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
  console.log('GET ALGO 5 MATCHES')

  res.json({
    success: true,
    matches: []
  })
})

router.get('/scrapeMatches', async (req, res) => {
  console.log('SCRAPE ALGO 5 MATCHES')

  const driver = await new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  await driver.get('https://www.whoscored.com/Betting/Facts')
  var htmlContent = await driver.findElement(By.id('main-iframe'))
  htmlContent = await htmlContent.getAttribute('innerHTML')
  console.log(htmlContent)
  // await driver.findElement(By.xpath('//div[@id="facts-filter-matchMarket"]/select[@class="filter-drop"]')).click()
  // await driver.findElement(By.xpath("//option[@data-source='ou']")).click()

  // var tableMatches = await driver.findElement(By.xpath('//body'))
  // var tableContent = await tableMatches.getAttribute('innerHTML')
  // console.log(tableContent)

  await driver.close()
  await driver.quit()

  res.json({
    success: true
  })
})

module.exports = router