const assert = require('assert')
const fs = require('fs')
const dotenv = require('dotenv')
const {optionsWithDefaults} = require('./util')
const {isObject, isArray, typeDefName, typeCast} = require('./types')

const dotEnvPath = '.env'

function getDotEnvConfig (options = {}) {
  const path = options.dotEnvPath || dotEnvPath
  if (!fs.existsSync(path)) return
  return dotenv.parse(fs.readFileSync(path))
}

function getValue (configCandidates, key) {
  return configCandidates.map(obj => obj ? obj[key] : undefined).find(v => v !== undefined)
}

function isMissing (key, value) {
  if (value == null) {
    return true
  } else if (isArray(value) || typeof value === 'string') {
    return value.length === 0
  } else if (isObject(value)) {
    return Object.keys(value).length === 0
  } else {
    return false
  }
}

function getEnvironments (options) {
  return [process.env, getDotEnvConfig(options)]
}

function generateEnvConfig (options = {}) {
  const defaultOptions = {
    dotEnvPath,
    isMissing,
    typeCast,
    getEnvironments,
    required: [],
    defaults: {},
    types: {},
    typeDefs: {}
  }
  options = optionsWithDefaults(options, defaultOptions)
  const {defaults} = options
  const missingKeys = []
  const configCandidates = options.getEnvironments(options).concat([defaults])
  const configKeys = options.required.concat(Object.keys(defaults)).concat(Object.keys(options.types))
  const config = configKeys.reduce((acc, key) => {
    const value = getValue(configCandidates, key)
    const type = options.types[key] || typeDefName(defaults[key])
    if (options.required.includes(key) && options.isMissing(key, value)) missingKeys.push(key)
    try {
      acc[key] = options.typeCast(value, type, options)
    } catch (castError) {
      throw new Error(`Could not type cast key ${key} - ${castError.message}`)
    }
    return acc
  }, {})
  assert(missingKeys.length === 0, `Config is missing the following keys that can be set as environment variables: ${missingKeys.join(', ')}`)
  return config
}

module.exports = {
  getDotEnvConfig,
  getEnvironments,
  isMissing,
  generateEnvConfig
}
