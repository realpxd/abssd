const logger = require('../utils/logger')

// Use the countriesnow.space API endpoints as requested
// States: POST https://countriesnow.space/api/v0.1/countries/states  { country: 'India' }
// Cities:  POST https://countriesnow.space/api/v0.1/countries/state/cities { country: 'India', state: 'STATE_NAME' }

const fetchFn = global.fetch || require('node-fetch')

exports.getStates = async (req, res) => {
  try {
    const url = 'https://countriesnow.space/api/v0.1/countries/states'
    const resp = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India' }),
    })
    if (!resp.ok) {
      throw new Error(`countriesnow API returned ${resp.status}`)
    }
    const json = await resp.json()
    // Expected shape: { error: false, msg: '...', data: { name: 'India', states: [ { name: 'State' }, ... ] } }
    const states = (json?.data?.states || []).map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean)
    return res.json({ success: true, data: states })
  } catch (error) {
    logger.error('getStates error', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch states' })
  }
}

exports.getCitiesByState = async (req, res) => {
  try {
    const stateParam = req.params.state
    if (!stateParam) return res.status(400).json({ success: false, message: 'State is required' })

    const url = 'https://countriesnow.space/api/v0.1/countries/state/cities'
    const resp = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India', state: stateParam }),
    })
    if (!resp.ok) {
      throw new Error(`countriesnow API returned ${resp.status}`)
    }
    const json = await resp.json()
    // Expected shape: { error: false, msg: '...', data: [ 'City1', 'City2' ] }
    const cities = Array.isArray(json?.data) ? json.data : []
    return res.json({ success: true, data: cities })
  } catch (error) {
    logger.error('getCitiesByState error', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch cities for state' })
  }
}
const fetch = global.fetch || require('node-fetch')

// Get city/state from Indian postal pincode API
exports.getByPincode = async (req, res) => {
  try {
    const { pincode } = req.params
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Invalid pincode' })
    }

    const resp = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`)
    const data = await resp.json()
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to lookup pincode' })
    }

    const result = data[0]
    if (result.Status !== 'Success' || !result.PostOffice || result.PostOffice.length === 0) {
      return res.status(404).json({ success: false, message: 'Pincode not found' })
    }

    // Take the first PostOffice entry
    const office = result.PostOffice[0]
    const city = office.District || office.Name || ''
    const state = office.State || ''

    res.status(200).json({ success: true, data: { city, state } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching pincode info' })
  }
}
