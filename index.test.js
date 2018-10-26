const {generateConfig} = require('./index')

test('generateConfig - returns default config if there are no overrides in dotEnv or env', () => {
  expect(generateConfig({fooo: 'bar'})).toEqual({fooo: 'bar'})
})
