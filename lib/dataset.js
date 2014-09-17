var types  = require('./types')
var msglib = require('./message')
var vclib  = require('./vclock')

exports.dataset = function(ssb, feed, opts) {
  var dataset = {}
  var vclock = []
  var vci

  // :TODO: initialize from opts
  // - participants
  // - vclock and vci
  // - path
  // - queue an init message if none

  // :TODO: hook apply() into ssb db add event

  // Declare operation
  dataset.declare = function(key, def, cb) {
    if (key && typeof key == 'object') {
      for (var k in key)
        this.declare(k, key[k])
      return
    }

    if (!key || typeof key != 'string')
      throw new Error('`key` is required and must be a string')
    if (typeof def == 'string')
      def = { type: def }
    if (!def || typeof def != 'object')
      throw new Error('`def` is required and must be an object')
    if (!def.type || typeof def.type != 'string')
      throw new Error('`def.type` is required and must be a string')

    queue(msglib.create('', 'declare', key, def), cb) // :TODO: path
  }

  // Remove operation
  dataset.remove = function(key, cb) {
    queue(msglib.create('', 'remove', key), cb) // :TODO: path
  }

  // Increments local dimension in vector clock and generates a new timestamp
  function stamp() {
    vclock[vci]++
    return vclock.map(function(v) { return v }) // duplicate array
  }

  // Adds a message to the feed
  function queue(msg, cb) {
    msg.vts = stamp()
    feed.add('object', msg, cb)
  }

  // Applies a message to the local dataset
  dataset.apply = function(msg) {
    msglib.validate(msg)
    var objName = msg.args[0]
    var obj = this[objName]

    if (msg.op == 'declare') return declare()
    if (msg.op == 'remove') return remove()
    throw new Error('Unrecognized op "' + msg.op + '" in dataset')

    function declare() {
      var def = msg.args[1]
      var type = types[def.type]
      if (!type)
        throw new Error('Unrecognized type "' + def.type + '" in dataset declare op')

      if (obj) {
        var cmp = vclib.compare(obj.vts, msg.vts)
        if (cmp > 0) {
          return // Existing definition's vector timestamp dominates, abort
        } else if (cmp < 0) {
          // New definition's vector timestamp dominates, use as-is
        } else {
          // Concurrent ops, take greatest authority
          // :TODO:
        }
      }
      dataset[objName] = type.create(def)
      // :TODO: emit change
      return
    }

    function remove() {
      if (obj) {
        var cmp = vclib.compare(obj.vts, msg.vts)
        if (cmp > 0) {
          return // Existing definition's vector timestamp dominates, abort
        } else if (cmp < 0) {
          // New definition's vector timestamp dominates, use as-is
        } else {
          // Concurrent ops, take greatest authority
          // :TODO:
        }
      }
      dataset[objName] = null
      // :TODO: emit change
      break
    }
  }

  return dataset
}
