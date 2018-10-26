const assert = require('assert')
const fs = require('fs')
const dotenv = require('dotenv')
const {typeCast} = require('./types')

function getDotEnvConfig () {
  const path = '.env'
  if (!fs.existsSync(path)) return
  return dotenv.parse(fs.readFileSync(path))
}

function getValue (configCandidates, key) {
  return configCandidates.map(obj => obj ? obj[key] : undefined).find(v => v !== undefined)
}

function isMissing (key, value) {
  return value === undefined
}

function generateConfig (defaultConfig, options = {}) {
  const configCandidates = [process.env, getDotEnvConfig(), defaultConfig]
  const missingEnvVars = []
  const _isMissing = options.isMissing || isMissing
  const _typeCast = options.typeCast || typeCast
  const config = Object.keys(defaultConfig).reduce((acc, key) => {
    const value = getValue(configCandidates, key)
    const defaultValue = defaultConfig[key]
    if (_isMissing(key, value)) missingEnvVars.push(key)
    acc[key] = _typeCast(value, defaultValue)
    return acc
  }, {})
  assert(missingEnvVars.length === 0, `Config is missing the following environment variables: ${missingEnvVars.join(', ')}`)
  return config
}

module.exports = {
  generateConfig
}
