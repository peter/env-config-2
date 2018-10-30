const {typeCast} = require('./types')

test('typeCast - can cast booleans', () => {
  expect(typeCast('true', 'boolean')).toEqual(true)
  expect(typeCast('false', 'boolean')).toEqual(false)
  expect(typeCast('f', 'boolean')).toEqual(false)
  expect(typeCast('0', 'boolean')).toEqual(false)
  expect(typeCast('1', 'boolean')).toEqual(true)
  expect(typeCast('FALSE', 'boolean')).toEqual(false)
})

test('typeCast - can cast integers', () => {
  expect(typeCast('0', 'integer')).toEqual(0)
  expect(typeCast('1', 'integer')).toEqual(1)
  expect(typeCast('2', 'integer')).toEqual(2)
  expect(typeCast('99', 'integer')).toEqual(99)
})

test('typeCast - can cast floats', () => {
  expect(typeCast('3.14', 'float')).toEqual(3.14)
  expect(typeCast('2', 'float')).toEqual(2.0)
})

test('typeCast - passes through null/undefined', () => {
  expect(typeCast('foo', null)).toEqual('foo')
  expect(typeCast('foo', undefined)).toEqual('foo')
  expect(typeCast(null, undefined)).toEqual(null)
  expect(typeCast(undefined, undefined)).toEqual(undefined)
})

test('typeCast - raises error for unsupported types', () => {
  expect(() => typeCast('foo', 'unsupported-type')).toThrowError(/supported/)
})
