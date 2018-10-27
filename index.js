const assert = require('assert')
const fs = require('fs')
const dotenv = require('dotenv')
const {typeCast} = require('./types')

const dotEnvPath = '.env'

function optionsWithDefaults (options, defaultOptions) {
  return Object.assign({}, options, defaultOptions)
}

function getDotEnvConfig (options = {}) {
  const path = options.dotEnvPath || dotEnvPath
  if (!fs.existsSync(path)) return
  return dotenv.parse(fs.readFileSync(path))
}

function getValue (configCandidates, key) {
  return configCandidates.map(obj => obj ? obj[key] : undefined).find(v => v !== undefined)
}

function isMissing (key, value) {
  return value === undefined
}

function getConfigCandidates (defaultConfig, options = {}) {
  return [process.env, getDotEnvConfig(options), defaultConfig]
}

function generateConfig (defaultConfig, options = {}) {
  options = optionsWithDefaults(options, {dotEnvPath, isMissing, typeCast, getConfigCandidates})
  const missingEnvVars = []
  const configCandidates = options.getConfigCandidates(defaultConfig, options)
  const config = Object.keys(defaultConfig).reduce((acc, key) => {
    const value = getValue(configCandidates, key)
    const defaultValue = defaultConfig[key]
    if (options.isMissing(key, value)) missingEnvVars.push(key)
    acc[key] = options.typeCast(value, defaultValue)
    return acc
  }, {})
  assert(missingEnvVars.length === 0, `Config is missing the following environment variables: ${missingEnvVars.join(', ')}`)
  return config
}

module.exports = {
  getDotEnvConfig,
  isMissing,
  getConfigCandidates,
  generateConfig
}
