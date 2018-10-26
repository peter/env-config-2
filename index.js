const assert = require('assert')
const fs = require('fs')
const dotenv = require('dotenv')

function getDotEnvConfig () {
  const path = '.env'
  if (!fs.existsSync(path)) return
  return dotenv.parse(fs.readFileSync(path))
}

function getValue (configCandidates, key) {
  return configCandidates.map(obj => obj ? obj[key] : undefined).find(v => v !== undefined)
}

function isBoolean (value) {
  return [true, false].includes(value)
}

function toBoolean (value) {
  if (value && !['0', 'f', 'false'].includes(value.toString().toLowerCase())) {
    return true
  } else {
    return false
  }
}

function isInteger (value) {
  return (typeof value === 'number' && Number.isInteger(value)) ||
    (typeof value === 'string' && value.match(/^[1-9][0-9]*$/))
}

function toInteger (value) {
  return parseInt(value)
}

function isFloat (value) {
  return (typeof value === 'number' && value % 1 !== 0) ||
    (typeof value === 'string' && !isNaN(Number(value)))
}

function toFloat (value) {
  return parseFloat(value)
}

function typeCast (value, defaultValue) {
  if (isBoolean(defaultValue)) {
    return toBoolean(value)
  } else if (isInteger(defaultValue)) {
    return toInteger(value)
  } else if (isFloat(defaultValue)) {
    return toFloat(value)
  } else {
    return value
  }
}

function generateConfig (defaultConfig) {
  const configCandidates = [process.env, getDotEnvConfig(), defaultConfig]
  const missingEnvVars = []
  const config = Object.keys(defaultConfig).reduce((acc, key) => {
    const value = getValue(configCandidates, key)
    const defaultValue = defaultConfig[key]
    if (value === undefined) missingEnvVars.push(key)
    acc[key] = typeCast(value, defaultValue)
    return acc
  }, {})
  assert(missingEnvVars.length === 0, `Config is missing the following environment variables: ${missingEnvVars.join(', ')}`)
  return config
}

module.exports = {
  generateConfig
}
