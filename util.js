function optionsWithDefaults (options, defaultOptions) {
  return Object.assign({}, defaultOptions, options)
}

module.exports = {
  optionsWithDefaults
}
