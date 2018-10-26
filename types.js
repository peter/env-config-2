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

module.exports = {
  typeCast
}