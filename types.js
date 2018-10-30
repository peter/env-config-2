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

const types = {
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

function typeCast (value, exampleValue) {
  if (typeof value !== 'string' || exampleValue == null) return value
  for (let [typeName, type] of Object.entries(types)) {
    const defaultError = (v) => type.isValid(v) ? undefined : `must be valid ${typeName}`
    if (type.isType(exampleValue)) {
      const errorMessage = (type.error || defaultError)(value)
      if (errorMessage) throw new Error(errorMessage)
      return type.cast(value)
    }
  }
  if (typeof exampleValue !== 'string') {
    throw new Error(`value ${value} of type ${typeof value} with example value ${exampleValue} of type ${typeof exampleValue} - the example type is not supported`)
  } else {
    return value
  }
}

module.exports = {
  isObject,
  isArray,
  types,
  typeCast
}
