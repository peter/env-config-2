const fs = require('fs')
const {getDotEnvConfig, generateEnvConfig} = require('./index')

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

test('generateEnvConfig - empty env - returns default config', () => {
  const defaults = {fooo: 'bar'}
  expect(generateEnvConfig({defaults})).toEqual({fooo: 'bar'})
})

test('generateEnvConfig - precedence - returns env variable first, then dot-env variable, and last default config', () => {
  const envVars = {FOO: '1', IRRELEVANT: '1'}
  const dotEnvVars = {FOO: '2', BAR: '2', IRRELEVANT: '2'}
  const defaults = {FOO: 3, BAR: 3, BAZ: 3, NULL: null}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateEnvConfig({defaults})).toEqual({FOO: 1, BAR: 2, BAZ: 3, NULL: null})
  })
})
test('generateEnvConfig - options validation - throws error if option with invalid type is passed', () => {
  expect(() => generateEnvConfig({required: {}})).toThrowError(/expected option required to have type array/i)
  expect(() => generateEnvConfig({types: []})).toThrowError(/expected option types to have type object/i)
})

test('generateEnvConfig - required - throws error if not set or empty', () => {
  const envVars = {FOO: '1'}
  const dotEnvVars = {}
  const defaults = {}
  const required = ['BAR']
  withEnv({envVars, dotEnvVars}, () => {
    expect(() => generateEnvConfig({defaults, required})).toThrowError(/\bBAR\b/)
  })

  withEnv({envVars: {BAR: ''}, dotEnvVars}, () => {
    expect(() => generateEnvConfig({defaults, required})).toThrowError(/\bBAR\b/)
  })
})

test('generateEnvConfig - required - does not throw error if set', () => {
  const required = ['BAR']

  withEnv({envVars: {FOO: '1', BAR: '1'}, dotEnvVars: {}}, () => {
    const defaults = {}
    expect(generateEnvConfig({defaults, required})).toEqual({BAR: '1'})
  })

  withEnv({envVars: {FOO: '1', BAR: '1'}, dotEnvVars: {}}, () => {
    const defaults = {BAR: 2}
    expect(generateEnvConfig({defaults, required})).toEqual({BAR: 1})
  })

  withEnv({envVars: {}, dotEnvVars: {}}, () => {
    const defaults = {BAR: 2}
    expect(generateEnvConfig({defaults, required})).toEqual({BAR: 2})
  })
})

test('generateEnvConfig - types - can specify for keys that are not in defaults', () => {
  const required = ['BAR']

  withEnv({envVars: {BAR: '1'}, dotEnvVars: {}}, () => {
    const types = {BAR: 'integer'}
    expect(generateEnvConfig({types, required})).toEqual({BAR: 1})
  })
})

test('generateEnvConfig - getEnvironments - can make dot-env file take precedence over env vars', () => {
  function getEnvironments (options) {
    return [getDotEnvConfig(options), process.env]
  }

  const dotEnvVars = {FOO: '1'}
  const envVars = {FOO: '2', BAR: '2'}
  const defaults = {FOO: 3, BAR: 3, BAZ: 3}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateEnvConfig({defaults, getEnvironments})).toEqual({FOO: 1, BAR: 2, BAZ: 3})
  })
})

test('generateEnvConfig - getEnvironments - can disable env vars', () => {
  function getEnvironments (options) {
    return [getDotEnvConfig(options)]
  }

  const dotEnvVars = {FOO: '1'}
  const envVars = {FOO: '2', BAR: '2'}
  const defaults = {FOO: 3, BAR: 3, BAZ: 3}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateEnvConfig({defaults, getEnvironments})).toEqual({FOO: 1, BAR: 3, BAZ: 3})
  })
})

test('generateEnvConfig - dotEnvPath - can set a custom file path', () => {
  const envVars = {}
  const dotEnvVars = {FOO: '1'}
  const defaults = {FOO: 3}
  const dotEnvPath = '.env.custom'
  withEnv({envVars, dotEnvVars, dotEnvPath}, () => {
    expect(generateEnvConfig({defaults, dotEnvPath})).toEqual({FOO: 1})
  })
})

test('generateEnvConfig - typeDefs - can provide custom types', () => {
  const envVars = {FOO: '2018-10-30T19:12:48.969Z'}
  const dotEnvVars = {}
  const types = {FOO: 'date'}
  const typeDefs = {
    date: {
      cast: v => new Date(v),
      isValid: v => true
    }
  }
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateEnvConfig({types, typeDefs})).toEqual({FOO: new Date('2018-10-30T19:12:48.969Z')})
  })
})
