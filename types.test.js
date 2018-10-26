const {typeCast} = require('./types')

test('typeCast - can cast booleans', () => {
  expect(typeCast('true', false)).toEqual(true)
  expect(typeCast('false', false)).toEqual(false)
  expect(typeCast('f', true)).toEqual(false)
  expect(typeCast('0', true)).toEqual(false)
  expect(typeCast('1', false)).toEqual(true)
  expect(typeCast('FALSE', true)).toEqual(false)
})

test('typeCast - can cast integers', () => {
  expect(typeCast('1', 2)).toEqual(1)
  expect(typeCast('2', 2)).toEqual(2)
})

test('typeCast - can cast floats', () => {
  expect(typeCast('3.14', 1.5)).toEqual(3.14)
  expect(typeCast('2', 1.5)).toEqual(2.0)
})

test('typeCast - passes through null/undefined', () => {
  expect(typeCast('foo', null)).toEqual('foo')
  expect(typeCast('foo', undefined)).toEqual('foo')
  expect(typeCast(null, undefined)).toEqual(null)
  expect(typeCast(undefined, undefined)).toEqual(undefined)
})

test('typeCast - passes through unsupported types', () => {
  expect(typeCast('foo', {})).toEqual('foo')
  expect(typeCast('foo', new Date())).toEqual('foo')
})
