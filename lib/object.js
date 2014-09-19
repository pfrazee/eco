var types   = require('./types')
var msglib  = require('./message')
var vclib   = require('./vclock')
var util    = require('./util')
var multicb = require('multicb')
var msgpack = require('msgpack')

module.exports = function(db, ssb, feed, state) {
  var obj = new require('events').EventEmitter

  // cache the string forms of member hashes for comparisons
  var memberIdStrings = state.members.map(function(buf) { return buf.toString('hex') })

  // when messages are added to the feed, apply to the object
  ssb.pre(function (op, add) {
    if (op.type != 'put' || op.value.type != 'eco') return

    var msg = msgpack.unpack(op.value.message)
    if (!msg || !msg.obj || msg.obj.$msg != obj.getId()) return

    var err = msglib.validate(msg)
    if (err) return obj.emit('error', err, msg)

    // :TODO: update vclock (merge and stamp)

    var authi = memberIdStrings.indexOf(op.value.author.toString('hex'))
    if (msg.path === '') {
      // Operation on the object
      if (apply(msg, op.value.author, authi))
        persist()
    } else {
      // Operation on a value
      var schema = state.schema[msg.path]
      // :TODO: buffer updates if declaration msg dependency is not met
      if (!schema || typeof state.data[msg.path] == 'undefined') {
        obj.emit('error', new Error('Received an update for "'+msg.path+'", which does not yet exist'), msg)
        return
      }

      var type = types[schema.type]
      var result = type.apply(state, msg, authi)
      if (result) {
        if (result instanceof Error) {
          obj.emit('error', result, msg)
        } else {
          // :TODO: update the vts
          persist()
          obj.emit('change', msg.path, result[0], result[1], { author: op.value.author, authi: authi, vts: msg.vts })
        }
      }
    }
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

    // publish declaration messages
    var done = multicb()
    for (var key in types)
      publish(msglib.create(state.id, '', 'declare', key, types[key]), done())
    done(cb)
  }

  // Get the type of the value
  obj.typeof = function(key) { return state.schema[key] }

  // Fetch a copy the object state
  obj.get = function() { return util.deepclone(state.data) }

  // Update the object state
  obj.put = function(vs, cb) {
    // diff `vs` against current state and produce a set of operations
    var msgs = []
    for (var k in vs) {
      var schema = state.schema[k]
      if (!schema) return cb(new Error('Cannot put value to undeclared key, "' + k + '"'))

      var type = types[schema.type]
      var ms = type.diff(state, schema, state.data[k], vs[k])
      if (ms && ms.length)
        msgs = msgs.concat(ms)
    }

    if (!msgs.length)
      return cb()

    // publish the updates
    var done = multicb()
    msgs.forEach(function(msg) { publish(msg, done()) })
    done(cb)
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
    var ks = []
    for (var k in state.schema) {
      if (vclib.test(vts, '<', state.schema[k].vts))
        ks.push(k)
    }
    return ks
  }

  // Private methods
  // ===============

  // Increments local dimension in vector clock and generates a new timestamp
  function stamp() {
    state.vclock[state.nodei]++
    return state.vclock.map(function(v) { return v }) // duplicate array
  }

  // Adds a message to the feed
  function publish(msg, cb) {
    msg.vts = stamp()
    feed.add('eco', msgpack.pack(msg), cb)
  }

  // Queues a state-write to the db
  function persist() {
    // :TODO: add to queue
    // :TODO: execute each queued persist, in order
  }

  // Applies a message to the local object
  function apply(msg, author, authi) {
    var key = msg.args[0]
    var def = msg.args[1]

    if (msg.op == 'declare') return declare()
    this.emit('error', new Error('Unknown operation for the Object type'), msg)
    return false

    function declare() {
      var type = types[def.type]
      if (!type) {
        this.emit('error', new Error('Unrecognized type "' + def.type + '" in object declare op'))
        return false
      }

      // conflict check
      var schema = state.schema[key]
      if (schema) {
        if (schema.authi <= authi)
          return false // existing authority is greater, abort
      }

      schema = {
        key:    key,
        author: author,
        authi:  authi,
        vts:    msg.vts
      }
      state.schemas[key] = schema
      state.data[key]    = type.initialize(msg)
      obj.emit('declare', schema)
      return true
    }
  }

  return obj
}
