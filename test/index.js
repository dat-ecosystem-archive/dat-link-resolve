var test = require('tape')
var datResolve = require('..')
var enc = require('dat-encoding')

// Strings that do not require lookup
var stringKeys = [
  { type: 'valid', key: '6161616161616161616161616161616161616161616161616161616161616161' },
  { type: 'valid', key: Buffer.from('6161616161616161616161616161616161616161616161616161616161616161', 'hex') },
  { type: 'valid', key: 'dat://6161616161616161616161616161616161616161616161616161616161616161' },
  { type: 'valid', key: 'datproject.org/6161616161616161616161616161616161616161616161616161616161616161' },
  { type: 'valid', key: 'dat://6161616161616161616161616161616161616161616161616161616161616161/' },
  { type: 'valid', key: 'datproject.org/6161616161616161616161616161616161616161616161616161616161616161/' },
  { type: 'valid', key: 'host.com/whatever/6161616161616161616161616161616161616161616161616161616161616161' }
]

var stringBadKeys = [
  { type: 'invalid', key: '616161616161616161616161616161616161616161616161616161616161616' },
  { type: 'invalid', key: '61616161616161616161616161616161616161616161616161616161616161612' }
]

test('resolve key with path', async function (t) {
  try {
    const newKey = await datResolve('87ed2e3b160f261a032af03921a3bd09227d0a4cde73466c17114816cae43336/path')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve https hostname with path', async function (t) {
  try {
    const newKey = await datResolve('https://beakerbrowser.com/path')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve dat hostname with path', async function (t) {
  try {
    const newKey = await datResolve('dat://beakerbrowser.com/path')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve dat hostname with path and version', async function (t) {
  try {
    const newKey = await datResolve('dat://beakerbrowser.com/path+5')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve dat hostname with version', async function (t) {
  try {
    const newKey = await datResolve('dat://beakerbrowser.com+5')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve hostname with path', async function (t) {
  try {
    const newKey = await datResolve('beakerbrowser.com/path')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve key with version', async function (t) {
  try {
    const newKey = await datResolve('87ed2e3b160f261a032af03921a3bd09227d0a4cde73466c17114816cae43336+5')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve hostname with version', async function (t) {
  try {
    const newKey = await datResolve('beakerbrowser.com+5')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve key without http', function (t) {
  t.plan(2 * 7) // 2 tests for 7 keys (no errors)
  stringKeys.forEach(async function (key) {
    try {
      const newKey = await datResolve(key.key)
      t.equal(newKey, '6161616161616161616161616161616161616161616161616161616161616161', 'link correct')
      t.ok(enc.encode(newKey), 'valid key')
    } catch (err) {
      t.error(err, 'no error')
    }
  })
})

test('resolve beaker browser without protocol', async function (t) {
  try {
    const newKey = await datResolve('beakerbrowser.com')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve beaker browser http', async function (t) {
  try {
    const newKey = await datResolve('http://beakerbrowser.com')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve beaker browser https', async function (t) {
  try {
    const newKey = await datResolve('https://beakerbrowser.com')

    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

test('resolve beaker browser dat', async function (t) {
  try {
    const newKey = await datResolve('dat://beakerbrowser.com')
    t.ok(newKey, 'is a key')
  } catch (err) {
    t.err(err, 'not expected error')
  }
  t.end()
})

// this test is very slow
test('resolve bad key without http', function (t) {
  console.log('test may take awhile...')
  t.plan(1 * stringBadKeys.length) // 1 tests for 2 keys
  stringBadKeys.forEach(async function (key) {
    try {
      const newKey = await datResolve(key.key)
      t.notOk(newKey, 'not a key')
    } catch (err) {
      t.ok(err, 'expected error')
    }
  })
})
