const fs = require('fs')
const {generateConfig} = require('./index')

function withEnvVars (envVars, fn) {
  const origValues = {}
  for (let [key, value] of Object.entries(envVars)) {
    if (key in process.env) origValues[key] = process.env[key]
    process.env[key] = value
  }
  const result = fn()
  for (let key in envVars) {
    if (key in origValues) {
      process.env[key] = origValues[key]
    } else {
      delete process.env[key]
    }
  }
  return result
}

function dotEnvString (obj) {
  return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('\n')
}

test('generateConfig - returns default config if there are no overrides in dotEnv or env', () => {
  expect(generateConfig({fooo: 'bar'})).toEqual({fooo: 'bar'})
})

test('generateConfig - returns env variable first, then dot-env variable, and last default config', () => {
  const path = '.env'
  const envVars = {FOO: 1, IRRELEVANT: 1}
  const dotEnvVars = {FOO: 2, BAR: 2, IRRELEVANT: 2}
  fs.writeFileSync(path, dotEnvString(dotEnvVars))
  withEnvVars(envVars, () => {
    expect(generateConfig({FOO: 3, BAR: 3, BAZ: 3, NULL: null})).toEqual({FOO: 1, BAR: 2, BAZ: 3, NULL: null})
  })
  fs.unlinkSync(path)
})
