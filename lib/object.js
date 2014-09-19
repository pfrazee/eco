var types  = require('./types')
var msglib = require('./message')
var vclib  = require('./vclock')
var multicb = require('multicb')
var msgpack = require('msgpack')

module.exports = function(db, ssb, feed, state) {
  var obj = new require('events').EventEmitter

  // When messages are added to the feed, apply to the object
  ssb.pre(function (op, add) {
    if (op.type != 'put' || op.value.type != 'eco') return

    var msg = msgpack.unpack(op.value.message)
    if (!msg || !msg.obj || msg.obj.$msg != obj.getId()) return

    var err = msglib.validate(msg)
    if (err) return // :TODO: emit error

    // :TODO: look up who should apply using the path

    apply(msg)
  })

  // Public API
  // ==========

  // Declare operation
  obj.declare = function(types, cb) {
    // validate inputs
    if (!types || typeof types != 'object')
      return cb(new Error('`types` is required and must be an object'))

    for (var key in types) {
      var def = types[key]
      
      if (state.schema[key])
        return cb(new Error('key already used'))

      if (typeof def == 'string')
        def = types[key] = { type: def }
      
      if (!def || typeof def != 'object')
        return cb(new Error('bad types object'))
      
      if (!def.type || typeof def.type != 'string')
        return cb(new Error('bad types object'))
    }

    var done = multicb()
    for (var key in types)
      publish(msglib.create(obj, '', 'declare', key, types[key]), done)
    done(cb)
  }

  // Get the type of the CRDT
  obj.typeof = function(key) { return state.schema[key] }

  // Fetch a copy the object state
  obj.get = function() { return deepclone(state.data) }

  // Update the object state
  obj.put = function(vs, cb) {
    // :TODO: diff vs against current state and produce a set of operations
    // :TODO: publish the operations 
  }

  // Create a stream which emits change events
  obj.createChangeStream = function() {
    // :TODO:
  }

  // Getters
  obj.getId = function() { return state.id }
  obj.getVClock = function() { return state.vclock }
  obj.getMembers = function() { return state.members }
  obj.getOwner = function() { return state.members[0] }

  // Get keys of all objects changed since vts
  obj.updatedSince = function(vts) {
    // :TODO:
  }

  // Private methods
  // ===============

  // Increments local dimension in vector clock and generates a new timestamp
  function stamp() {
    state.vclock[state.nodeindex]++
    return state.vclock.map(function(v) { return v }) // duplicate array
  }

  // Adds a message to the feed
  function publish(msg, cb) {
    msg.vts = stamp()
    feed.add('eco', msgpack.pack(msg), cb)
  }

  // Applies a message to the local object
  function apply(msg) {
    var key = msg.args[0]
    var crdt = this[key] // :TODO: where are the crdts kept?

    if (msg.op == 'declare') return declare()
    this.emit('error', new Error('Unknown operation for the Object type'), msg)

    function declare() {
      var def = msg.args[1]
      var type = types[def.type]
      if (!type)
        throw new Error('Unrecognized type "' + def.type + '" in object declare op')

      if (crdt) {
        var cmp = vclib.compare(crdt.vts, msg.vts)
        if (cmp > 0) {
          return // Existing definition's vector timestamp dominates, abort
        } else if (cmp < 0) {
          // New definition's vector timestamp dominates, use as-is
        } else {
          // Concurrent ops, take greatest authority
          // :TODO:
        }
      }
      // obj[key] = type.create(def) :TODO: where are object defs kept?
      // :TODO: emit change
      return
    }
  }

  function deepclone(v) {
    return JSON.parse(JSON.stringify(v)) // replace with anything you know is faster
  }

  return obj
}
