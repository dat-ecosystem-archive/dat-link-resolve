var assert = require('assert')
var stringKey = require('dat-encoding').toStr
var nets = require('nets')
var datDns = require('dat-dns')()
var debug = require('debug')('dat-link-resolve')

module.exports = resolve

function parseUrl (key, link, named) {
  var response = { key: key, link: link }
  var matches = link.match(new RegExp((named ? '' : key) + '(\\+[0-9]+)?(/.*)?$'))
  if (matches) {
    if (matches[1]) { response.version = parseInt(matches[1], 10) }
    if (matches[2]) { response.path = matches[2] }
  }
  return response
}

function resolve (link, options, cb) {
  assert.ok(link, 'dat-link-resolve: link required')
  if (!cb && options) {
    cb = options
    options = {}
  } else if (typeof options === 'boolean') {
    options = { verbose: options }
  }
  assert.equal(typeof options, 'object', 'dat-link-resolve: options must be an object')
  assert.equal(typeof cb, 'function', 'dat-link-resolve: callback required')

  var key = null

  try {
    // validates + removes dat://
    // also works for http urls with keys in them
    key = stringKey(link)
    if (options.verbose) {
      cb(null, parseUrl(key, link))
    } else {
      cb(null, key)
    }
  } catch (e) {
    lookup()
  }

  function lookup () {
    // if it starts with http or dat: use as is, otherwise prepend http://
    var urlLink = (link.indexOf('http') && link.indexOf('dat:')) ? ('http://' + link) : link

    function resolveName () {
      datDns.resolveName(urlLink, function (err, key) {
        debug('resolveName', urlLink, err, key)
        if (key) {
          if (options.verbose) {
            cb(null, parseUrl(key, link, true))
          } else {
            cb(null, key)
          }
          return
        }
        debug('datDns.resolveName() error', err)
        cb(err)
      })
    }

    debug('resolveKey', link, urlLink)
    nets({ url: urlLink, json: true }, function (err, resp, body) {
      // no ressource at given URL
      if (err || resp.statusCode !== 200) {
        return resolveName()
      }

      // first check if key is in header response
      key = resp.headers['hyperdrive-key'] || resp.headers['dat-key']
      if (key) {
        debug('Received key from http header:', key)
        if (options.verbose) {
          cb(null, { key: key })
        } else {
          cb(null, key)
        }
        return
      }

      // else fall back to parsing the body
      try {
        key = stringKey(body.url)
        debug('Received key via json:', key, typeof body, body && typeof body.url)
        if (key) {
          if (options.verbose) {
            cb(null, { key: key })
          } else {
            cb(null, key)
          }
          return
        }
      } catch (e) {
        // fall back to datDns
        resolveName()
      }
    })
  }
}
