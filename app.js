// Import necessary packages
const express = require('express')
const sqlite3 = require('sqlite3').verbose()

// Create Express app
const app = express()

// Connect to the SQLite database
const db = new sqlite3.Database('covid19India.db')

// Middleware to parse JSON bodies
app.use(express.json())

// API 1: Get all states
app.get('/states/', (req, res) => {
  const query = 'SELECT * FROM state'
  db.all(query, (err, rows) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
      return
    }
    res.send(rows)
  })
})

// API 2: Get state by ID
app.get('/states/:stateId/', (req, res) => {
  const stateId = req.params.stateId
  const query = 'SELECT * FROM state WHERE state_id = ?'
  db.get(query, [stateId], (err, row) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
      return
    }
    if (!row) {
      res.status(404).send('State not found')
      return
    }
    res.send(row)
  })
})

// API 3: Create a new district
app.post('/districts/', (req, res) => {
  const {district_name, state_id, cases, cured, active, deaths} = req.body
  const query =
    'INSERT INTO district (district_name, state_id, cases, cured, active, deaths) VALUES (?, ?, ?, ?, ?, ?)'
  db.run(
    query,
    [district_name, state_id, cases, cured, active, deaths],
    function (err) {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
        return
      }
      res.send('District Successfully Added')
    },
  )
})

// API 4: Get district by ID
app.get('/districts/:districtId/', (req, res) => {
  const districtId = req.params.districtId
  const query = 'SELECT * FROM district WHERE district_id = ?'
  db.get(query, [districtId], (err, row) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
      return
    }
    if (!row) {
      res.status(404).send('District not found')
      return
    }
    res.send(row)
  })
})

// API 5: Delete district by ID
app.delete('/districts/:districtId/', (req, res) => {
  const districtId = req.params.districtId
  const query = 'DELETE FROM district WHERE district_id = ?'
  db.run(query, [districtId], function (err) {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
      return
    }
    res.send('District deleted successfully')
  })
})

// API 6: Update district by ID
app.put('/districts/:districtId/', (req, res) => {
  const districtId = req.params.districtId
  const {district_name, state_id, cases, cured, active, deaths} = req.body
  const query =
    'UPDATE district SET district_name = ?, state_id = ?, cases = ?, cured = ?, active = ?, deaths = ? WHERE district_id = ?'
  db.run(
    query,
    [district_name, state_id, cases, cured, active, deaths, districtId],
    function (err) {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
        return
      }
      res.send('District updated successfully')
    },
  )
})

// API 7: Get statistics of a state
app.get('/states/:stateId/stats/', (req, res) => {
  const stateId = req.params.stateId
  const query =
    'SELECT SUM(cases) as total_cases, SUM(cured) as total_cured, SUM(active) as total_active, SUM(deaths) as total_deaths FROM district WHERE state_id = ?'
  db.get(query, [stateId], (err, row) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
      return
    }
    if (!row) {
      res.status(404).send('State not found')
      return
    }
    res.send(row)
  })
})

// API 8: Get state name of a district
app.get('/districts/:districtId/details/', (req, res) => {
  const districtId = req.params.districtId
  const query =
    'SELECT state.state_name FROM state INNER JOIN district ON state.state_id = district.state_id WHERE district.district_id = ?'
  db.get(query, [districtId], (err, row) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
      return
    }
    if (!row) {
      res.status(404).send('District not found')
      return
    }
    res.send({stateName: row.state_name})
  })
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// Export the Express instance
module.exports = app
