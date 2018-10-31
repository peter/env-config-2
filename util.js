function isArray (value) {
  return Array.isArray(value)
}

// See: https://stackoverflow.com/questions/5876332/how-can-i-differentiate-between-an-object-literal-other-javascript-objects
function isObject (value) {
  return value != null && typeof value === 'object' && value.constructor === Object
}

function typeOf (value) {
  if (isArray(value)) {
    return 'array'
  } else {
    return typeof value
  }
}

function validateOptions (options, defaultOptions) {
  for (let [key, value] of Object.entries(options || {})) {
    const defaultValue = defaultOptions[key]
    const actualType = typeOf(value)
    const expectedType = typeOf(defaultValue)
    if (defaultValue != null && actualType !== expectedType) {
      throw new Error(`Expected option ${key} to have type ${expectedType} but it had type ${actualType}`)
    }
  }
}

function optionsWithDefaults (options, defaultOptions) {
  validateOptions(options, defaultOptions)
  return Object.assign({}, defaultOptions, options)
}

module.exports = {
  isArray,
  isObject,
  typeOf,
  validateOptions,
  optionsWithDefaults
}
