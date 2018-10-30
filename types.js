const {optionsWithDefaults} = require('./util')

const TRUE_VALUES = ['t', 'true', 'True', 'TRUE', '1']
const FALSE_VALUES = ['f', 'false', 'False', 'FALSE', '0']

function isJsonString (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

function isArray (value) {
  return Array.isArray(value)
}

// See: https://stackoverflow.com/questions/5876332/how-can-i-differentiate-between-an-object-literal-other-javascript-objects
function isObject (value) {
  return value != null && typeof value === 'object' && value.constructor === Object
}

function typeOf (value) {
  for (let [typeName, type] of Object.entries(typeDefs)) {
    if (type.isType(value)) return typeName
  }
  return undefined
}

const typeDefs = {
  boolean: {
    isType: v => [true, false].includes(v),
    cast (v) {
      if (v && TRUE_VALUES.includes(v)) {
        return true
      } else {
        return false
      }
    },
    error: v => {
      if (!TRUE_VALUES.includes(v) && !FALSE_VALUES.includes(v)) {
        return `must be one of ${TRUE_VALUES.join(', ')} or ${FALSE_VALUES.join(', ')}`
      }
    }
  },
  integer: {
    isType: v => typeof v === 'number' && Number.isInteger(v),
    cast: v => parseInt(v),
    isValid: v => v.match(/(?:^[0-9]$)|(?:^[1-9][0-9]*$)/)
  },
  float: {
    isType: v => typeof v === 'number' && v % 1 !== 0,
    cast: v => parseFloat(v),
    isValid: v => !isNaN(parseFloat(v))
  },
  json: {
    isType: v => isObject(v) || isArray(v),
    cast: v => JSON.parse(v),
    isValid: v => isJsonString(v)
  }
}

function typeCast (value, type, options = {}) {
  options = optionsWithDefaults(options, {typeDefs: {}})
  if (typeof value !== 'string' || type == null) return value
  const typeDef = options.typeDefs[type] || typeDefs[type]
  if (!typeDef) throw new Error(`type ${type} is not supported so cannot cast value ${value}`)
  const defaultError = (v) => typeDef.isValid(v) ? undefined : `must be valid ${type}`
  const errorMessage = (typeDef.error || defaultError)(value)
  if (errorMessage) throw new Error(errorMessage)
  return typeDef.cast(value)
}

module.exports = {
  isObject,
  isArray,
  typeDefs,
  typeOf,
  typeCast
}
