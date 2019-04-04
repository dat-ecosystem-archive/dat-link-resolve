const assert = require('assert')
const stringKey = require('dat-encoding').toStr
const get = require('simple-get')
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
      // if it starts with http or dat: use as is, otherwise prepend http://
      const urlLink = (link.indexOf('http') && link.indexOf('dat:')) ? ('http://' + link) : link

      function resolveName () {
        debug('resolveName', urlLink)
        datDns.resolveName(urlLink).then((key) => {
          debug('resolved', key)
          if (key) return resolve(key)
        }).catch((err) => {
          if (err) debug('datDns.resolveName() error')
          reject(err)
        })
      }

      debug('resolveKey', link, urlLink)
      get({
        url: urlLink.replace('dat://', 'http://'),
        json: true,
        timeout: 1500
      }, function (err, resp, body) {
        // no ressource at given URL
        if (err || resp.statusCode !== 200) {
          return resolveName()
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
        } catch (e) {
          // fall back to datDns
          resolveName()
        }
      })
    })
  }
}
