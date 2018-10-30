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
  const envDefaults = {fooo: 'bar'}
  expect(generateEnvConfig({envDefaults})).toEqual({fooo: 'bar'})
})

test('generateEnvConfig - precedence - returns env variable first, then dot-env variable, and last default config', () => {
  const envVars = {FOO: '1', IRRELEVANT: '1'}
  const dotEnvVars = {FOO: '2', BAR: '2', IRRELEVANT: '2'}
  const envDefaults = {FOO: 3, BAR: 3, BAZ: 3, NULL: null}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateEnvConfig({envDefaults})).toEqual({FOO: 1, BAR: 2, BAZ: 3, NULL: null})
  })
})

test('generateEnvConfig - requiredKeys - throws error if not set or empty', () => {
  const envVars = {FOO: '1'}
  const dotEnvVars = {}
  const envDefaults = {}
  const requiredKeys = ['BAR']
  withEnv({envVars, dotEnvVars}, () => {
    expect(() => generateEnvConfig({envDefaults, requiredKeys})).toThrowError(/\bBAR\b/)
  })

  withEnv({envVars: {BAR: ''}, dotEnvVars}, () => {
    expect(() => generateEnvConfig({envDefaults, requiredKeys})).toThrowError(/\bBAR\b/)
  })
})

test('generateEnvConfig - requiredKeys - does not throw error if set', () => {
  const requiredKeys = ['BAR']

  withEnv({envVars: {FOO: '1', BAR: '1'}, dotEnvVars: {}}, () => {
    const envDefaults = {}
    expect(generateEnvConfig({envDefaults, requiredKeys})).toEqual({BAR: '1'})
  })

  withEnv({envVars: {FOO: '1', BAR: '1'}, dotEnvVars: {}}, () => {
    const envDefaults = {BAR: 2}
    expect(generateEnvConfig({envDefaults, requiredKeys})).toEqual({BAR: 1})
  })

  withEnv({envVars: {}, dotEnvVars: {}}, () => {
    const envDefaults = {BAR: 2}
    expect(generateEnvConfig({envDefaults, requiredKeys})).toEqual({BAR: 2})
  })
})

test('generateEnvConfig - types - can specify for keys that are not in envDefaults', () => {
  const requiredKeys = ['BAR']

  withEnv({envVars: {BAR: '1'}, dotEnvVars: {}}, () => {
    const types = {BAR: 'integer'}
    expect(generateEnvConfig({types, requiredKeys})).toEqual({BAR: 1})
  })
})

test('generateEnvConfig - getEnvironments - can make dot-env file take precedence over env vars', () => {
  function getEnvironments (options) {
    return [getDotEnvConfig(options), process.env]
  }

  const dotEnvVars = {FOO: '1'}
  const envVars = {FOO: '2', BAR: '2'}
  const envDefaults = {FOO: 3, BAR: 3, BAZ: 3}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateEnvConfig({envDefaults, getEnvironments})).toEqual({FOO: 1, BAR: 2, BAZ: 3})
  })
})

test('generateEnvConfig - getEnvironments - can disable env vars', () => {
  function getEnvironments (options) {
    return [getDotEnvConfig(options)]
  }

  const dotEnvVars = {FOO: '1'}
  const envVars = {FOO: '2', BAR: '2'}
  const envDefaults = {FOO: 3, BAR: 3, BAZ: 3}
  withEnv({envVars, dotEnvVars}, () => {
    expect(generateEnvConfig({envDefaults, getEnvironments})).toEqual({FOO: 1, BAR: 3, BAZ: 3})
  })
})

test('generateEnvConfig - dotEnvPath - can set a custom file path', () => {
  const envVars = {}
  const dotEnvVars = {FOO: '1'}
  const envDefaults = {FOO: 3}
  const dotEnvPath = '.env.custom'
  withEnv({envVars, dotEnvVars, dotEnvPath}, () => {
    expect(generateEnvConfig({envDefaults, dotEnvPath})).toEqual({FOO: 1})
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
