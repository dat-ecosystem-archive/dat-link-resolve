var test = require('tape')
var enc = require('dat-encoding')
var datResolve = require('..')

// Strings that do not require lookup
var stringKeys = [
  {type: 'valid', key: '6161616161616161616161616161616161616161616161616161616161616161'},
  {type: 'valid', key: Buffer.from('6161616161616161616161616161616161616161616161616161616161616161', 'hex')},
  {type: 'valid', key: 'dat://6161616161616161616161616161616161616161616161616161616161616161'},
  {type: 'valid', key: 'datproject.org/6161616161616161616161616161616161616161616161616161616161616161'},
  {type: 'valid', key: 'dat://6161616161616161616161616161616161616161616161616161616161616161/'},
  {type: 'valid', key: 'datproject.org/6161616161616161616161616161616161616161616161616161616161616161/'},
  {type: 'valid', key: 'host.com/whatever/6161616161616161616161616161616161616161616161616161616161616161'}
]

var stringBadKeys = [
  {type: 'invalid', key: '616161616161616161616161616161616161616161616161616161616161616'},
  {type: 'invalid', key: '61616161616161616161616161616161616161616161616161616161616161612'}
]

test('resolve bad key without http', function (t) {
  t.plan(2 * stringBadKeys.length) // 2 tests for 2 keys
  stringBadKeys.forEach(function (key) {
    datResolve(key.key, function (err, newKey) {
      t.ok(err, 'expected error')
      t.notOk(newKey, 'not a key')
    })
  })
})

test('resolve key without http', function (t) {
  t.plan(3 * 7) // 3 tests for 7 keys
  stringKeys.forEach(function (key) {
    datResolve(key.key, function (err, newKey) {
      t.error(err, 'no error')
      t.equal(newKey, '6161616161616161616161616161616161616161616161616161616161616161', 'link correct')
      t.ok(enc.encode(newKey), 'valid key')
    })
  })
})

test('resolve beaker browser without protocol', function (t) {
  datResolve('beakerbrowser.com', function (err, key) {
    t.error(err, 'no error')
    t.ok(key, 'got key')
    t.end()
  })
})

test('resolve beaker browser http', function (t) {
  datResolve('http://beakerbrowser.com', function (err, key) {
    t.error(err, 'no error')
    t.ok(key, 'got key')
    t.end()
  })
})

test('resolve beaker browser https', function (t) {
  datResolve('https://beakerbrowser.com', function (err, key) {
    t.error(err, 'no error')
    t.ok(key, 'got key')
    t.end()
  })
})

test('resolve beaker browser dat', function (t) {
  datResolve('dat://beakerbrowser.com', function (err, key) {
    t.error(err, 'no error')
    t.ok(key, 'got key')
    t.end()
  })
})
