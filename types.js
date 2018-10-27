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
  return typeof value === 'number' && Number.isInteger(value)
}

function toInteger (value) {
  return parseInt(value)
}

function isFloat (value) {
  return typeof value === 'number' && value % 1 !== 0
}

function toFloat (value) {
  return parseFloat(value)
}

function typeCast (value, exampleValue) {
  if (isBoolean(exampleValue)) {
    return toBoolean(value)
  } else if (isInteger(exampleValue)) {
    return toInteger(value)
  } else if (isFloat(exampleValue)) {
    return toFloat(value)
  } else {
    return value
  }
}

module.exports = {
  isBoolean,
  toBoolean,
  isInteger,
  toInteger,
  isFloat,
  toFloat,
  typeCast
}
