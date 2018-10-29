const fs = require('fs')
const {getDotEnvConfig, generateConfig} = require('./index')

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

function withDotEnvFile (dotEnvVars, fn, options = {}) {
  const path = options.dotEnvPath || '.env'
  fs.writeFileSync(path, dotEnvString(dotEnvVars))
  const result = fn()
  fs.unlinkSync(path)
  return result
}

function withEnv (options, fn) {
  withEnvVars(options.envVars, () => withDotEnvFile(options.dotEnvVars, fn, options))
}

function dotEnvString (obj) {
  return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('\n')
}

test('generateConfig - empty env - returns default config', () => {
  const defaultConfig = {fooo: 'bar'}
  expect(generateConfig({defaultConfig})).toEqual({fooo: 'bar'})
})

test('generateConfig - precedence - returns env variable first, then dot-env variable, and last default config', () => {
  const envVars = {FOO: 1, IRRELEVANT: 1}
  const dotEnvVars = {FOO: 2, BAR: 2, IRRELEVANT: 2}
  const defaultConfig = {FOO: 3, BAR: 3, BAZ: 3, NULL: null}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateConfig({defaultConfig})).toEqual({FOO: 1, BAR: 2, BAZ: 3, NULL: null})
  })
})

test('generateConfig - requiredKeys - throws error if not set', () => {
  const envVars = {FOO: 1}
  const dotEnvVars = {}
  const defaultConfig = {}
  const requiredKeys = ['BAR']
  withEnv({envVars, dotEnvVars}, () => {
    expect(() => generateConfig({defaultConfig, requiredKeys})).toThrowError(/\bBAR\b/)
  })
})

test('generateConfig - requiredKeys - does not throw error if set', () => {
  const requiredKeys = ['BAR']

  withEnv({envVars: {FOO: 1, BAR: 1}, dotEnvVars: {}}, () => {
    const defaultConfig = {}
    expect(generateConfig({defaultConfig, requiredKeys})).toEqual({BAR: '1'})
  })

  withEnv({envVars: {FOO: 1, BAR: 1}, dotEnvVars: {}}, () => {
    const defaultConfig = {BAR: 2}
    expect(generateConfig({defaultConfig, requiredKeys})).toEqual({BAR: 1})
  })

  withEnv({envVars: {FOO: 1, BAR: 1}, dotEnvVars: {}}, () => {
    const defaultConfig = {FOO: 2, BAR: 2}
    expect(generateConfig({defaultConfig, requiredKeys})).toEqual({FOO: 1, BAR: 1})
  })
})

test('generateConfig - exampleValues - can specify types', () => {
  const requiredKeys = ['BAR']

  withEnv({envVars: {BAR: 1}, dotEnvVars: {}}, () => {
    const exampleValues = {BAR: 9}
    expect(generateConfig({exampleValues, requiredKeys})).toEqual({BAR: 1})
  })
})

test('generateConfig - getEnvironments - can make dot-env file take precedence over env vars', () => {
  function getEnvironments (options) {
    return [getDotEnvConfig(options), process.env]
  }

  const dotEnvVars = {FOO: 1}
  const envVars = {FOO: 2, BAR: 2}
  const defaultConfig = {FOO: 3, BAR: 3, BAZ: 3}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateConfig({defaultConfig, getEnvironments})).toEqual({FOO: 1, BAR: 2, BAZ: 3})
  })
})

test('generateConfig - getEnvironments - can disable env vars', () => {
  function getEnvironments (options) {
    return [getDotEnvConfig(options)]
  }

  const dotEnvVars = {FOO: 1}
  const envVars = {FOO: 2, BAR: 2}
  const defaultConfig = {FOO: 3, BAR: 3, BAZ: 3}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateConfig({defaultConfig, getEnvironments})).toEqual({FOO: 1, BAR: 3, BAZ: 3})
  })
})

test('generateConfig - dotEnvPath - can set a custom file path', () => {
  const envVars = {}
  const dotEnvVars = {FOO: 1}
  const defaultConfig = {FOO: 3}
  const dotEnvPath = '.env.custom'
  withEnv({envVars, dotEnvVars, dotEnvPath}, () => {
    expect(generateConfig({defaultConfig, dotEnvPath})).toEqual({FOO: 1})
  })
})
