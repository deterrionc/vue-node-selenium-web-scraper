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

  res.json({
    success: true,
    matches: []
  })
})

router.get('/scrapeMatches', async (req, res) => {
  const driver = await new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  await driver.get('https://1xbet.whoscored.com/Betting/Facts')
  await driver.findElement(By.xpath('//div[@id="facts-filter-matchMarket"]/select[@class="filter-drop"]')).click()
  await driver.findElement(By.xpath("//option[@data-source='ou']")).click()

  var tableMatches = await driver.findElement(By.tag('matchFacts'))
  var tableContent = await tableMatches.getAttribute('innerHTML')
  console.log(tableContent)

  await driver.close()
  await driver.quit()

  res.json({
    success: true
  })
})

module.exports = router