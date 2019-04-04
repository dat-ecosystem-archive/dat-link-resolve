const assert = require('assert')
const stringKey = require('dat-encoding').toStr
const get = require('simple-get')
const parseUrl = require('parse-dat-url')
const datDns = require('dat-dns')()
const debug = require('debug')('dat-link-resolve')

module.exports = resolve

function resolve (link) {
  assert.ok(link, 'dat-link-resolve: link required')

  let key = null

  try {
    // validates + removes dat://
    // also works for http urls with keys in them

    key = stringKey(link)
  } catch (e) { } // needs lookup

  return new Promise(async (resolve, reject) => {
    if (key) return resolve(key)
    try {
      resolve(await lookup())
    } catch (e) {
      reject(e)
    }
  })

  function lookup () {
    return new Promise((resolve, reject) => {
      const urlp = parseUrl(link)

      debug('resolveKey', link, urlp)
      get({
        url: `https://${urlp.host}${urlp.path}`,
        json: true,
        timeout: 1500
      }, function (err, resp, body) {
        // no resource at given URL
        if (err || resp.statusCode !== 200) {
          return resolveDns()
        }

        // first check if key is in header response
        key = resp.headers['hyperdrive-key'] || resp.headers['dat-key']
        if (key) {
          debug('Received key from http header:', key)
          return resolve(key)
        }

        // else fall back to parsing the body
        try {
          key = stringKey(body.url)
          debug('Received key via json:', key, typeof body, body && typeof body.url)
          if (key) resolve(key)
        } catch (e) { }
        // fall back to datDns
        resolveDns()
      })

      async function resolveDns () {
        debug('resolveDns', urlp.host)
        try {
          key = await datDns.resolveName(urlp.host)
          resolve(key)
        } catch (err) {
          if (err) debug('datDns.resolveName() error')
          reject(err)
        }
      }
    })
  }
}
