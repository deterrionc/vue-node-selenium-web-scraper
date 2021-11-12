const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require("compression")

const app = express()

const auth = require('./middleware/auth')

// Connect Database
connectDB()

// Init Middleware
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.raw())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/match', require('./routes/api/match'))
app.use('/api/bookmaker', require('./routes/api/bookmaker'))
app.use('/api/league', require('./routes/api/league'))
app.use('/api/algo1', require('./routes/api/algo1'))
app.use('/api/algo2', require('./routes/api/algo2'))
app.use('/api/algo3', require('./routes/api/algo3'))
app.use('/api/algo4', require('./routes/api/algo4'))
app.use('/api/algo5', require('./routes/api/algo5'))
app.use('/api/algo6', require('./routes/api/algo6'))

// Serve frontend built
app.use(express.static(__dirname + '/client/dist'))

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/dist/index.html')
})

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/dist'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
