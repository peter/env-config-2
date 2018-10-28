const assert = require('assert')
const fs = require('fs')
const dotenv = require('dotenv')
const {typeCast} = require('./types')

const dotEnvPath = '.env'

function optionsWithDefaults (options, defaultOptions) {
  return Object.assign({}, defaultOptions, options)
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
  return value == null
}

function getEnvironments (options) {
  return [process.env, getDotEnvConfig(options)]
}

function generateConfig (options = {}) {
  const defaultOptions = {
    dotEnvPath,
    isMissing,
    typeCast,
    getEnvironments,
    requiredKeys: [],
    defaultConfig: {},
    exampleValues: {}
  }
  options = optionsWithDefaults(options, defaultOptions)
  const {defaultConfig} = options
  const missingKeys = []
  const configCandidates = options.getEnvironments(options).concat([defaultConfig])
  const configKeys = options.requiredKeys.concat(Object.keys(defaultConfig))
  const config = configKeys.reduce((acc, key) => {
    const value = getValue(configCandidates, key)
    const exampleValue = options.exampleValues[key] || defaultConfig[key]
    if (options.requiredKeys.includes(key) && options.isMissing(key, value)) missingKeys.push(key)
    acc[key] = options.typeCast(value, exampleValue)
    return acc
  }, {})
  assert(missingKeys.length === 0, `Config is missing the following keys that can be set as environment variables: ${missingKeys.join(', ')}`)
  return config
}

module.exports = {
  getDotEnvConfig,
  getEnvironments,
  isMissing,
  generateConfig
}
