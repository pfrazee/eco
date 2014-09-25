var types   = require('./types')
var msglib  = require('./message')
var vclib   = require('./vclock')
var util    = require('./util')
var multicb = require('multicb')
var msgpack = require('msgpack-js')

module.exports = function(db, feed, state) {
  var obj = new (require('events')).EventEmitter()

  // cache the string forms of hashes for == comparisons
  var idString = state.id.toString('hex')
  var memberIdStrings = state.members.map(function(buf) { return buf.toString('hex') })

  // Public API
  // ==========

  // Declare operation
  obj.declare = function(types, cb) {
    // validate inputs
    if (!types || typeof types != 'object')
      return cb(new Error('`types` is required and must be an object'))

    for (var key in types) {
      var def = types[key]
      
      if (state.meta[key])
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
    done(function(err, results) {
      if (err) return cb(err)
      cb(null, r2changes(results))  // remove the err to create a list of changes
    })
  }

  // Fetch a copy the object state
  obj.get = function() { return util.deepclone(state.data) }

  // Update the object state
  obj.put = function(vs, cb) {
    // diff `vs` against current state and produce a set of operations
    var msgs = []
    for (var k in vs) {
      var meta = state.meta[k]
      if (!meta) return cb(new Error('Cannot put value to undeclared key, "' + k + '"'))

      var type = types[meta.type]
      if (!type)
        return cb(new Error('Unrecognized type "' + meta.type + '" in object meta'))
      var ms = type.diff(state, meta, state.data[k], vs[k])
      if (ms && ms.length)
        msgs = msgs.concat(ms)
    }

    if (!msgs.length)
      return cb(null, [])

    // publish the updates
    var done = multicb()
    msgs.forEach(function(msg) { publish(msg, done()) })
    done(function(err, results) {
      if (err) return cb(err)
      cb(null, r2changes(results))  // remove the err to create a list of changes
    })
  }

  // Apply a message received from the feed
  obj.applyMessage = function(msg, opts, cb) {
    if (typeof opts == 'function') {
      cb = opts
      opts = null
    }
    if (!opts) opts = {}

    var msgData = msgpack.decode(msg.message)
    if (!msgData || !msgData.obj || msgData.obj.$rel != 'eco-object')
      return cb() // not an update message
    if (!msgData.obj.$msg || msgData.obj.$msg.toString('hex') != idString)
      return cb() // not an update message for this object

    var err = msglib.validate(msgData)
    if (err) return cb(err)

    // lookup author node
    var authi = memberIdStrings.indexOf(msg.author.toString('hex'))
    if (authi === -1) return cb() // not by an object member

    // update metadata
    if (msgData.seq > state.seq)
      state.seq = msgData.seq
    addHistory(msg, msgData, authi)

    if (msgData.path === '') {
      // operation on the object
      var result = apply(msgData, msg.author, authi, msgData.seq)
      if (result instanceof Error)
        return cb(result)
      if (result) {
        // store new state
        return persist(function(err) {
          if (err) return cb(err)
          if (Array.isArray(result))
            cb(false, result[0], result[1], result[2], { author: msg.author, authi: authi, seq: msgData.seq })
          else
            cb()
        })
      }
      return cb()
    }

    // operation on a value
    var meta = state.meta[msgData.path]
    if (!meta || typeof state.data[msgData.path] == 'undefined') {
      // :TODO: buffer updates if declaration msg dependency is not met
      return cb(new Error('Received an update for "'+msgData.path+'", which does not yet exist')) // temporary
    }
    var type = types[meta.type]
    if (!type) return cb(new Error('Unrecognized type "' + meta.type + '" in object meta'))
    var result = type.apply(state, msgData, authi)

    // update meta
    if (msgData.seq > state.meta[msgData.path].seq)
      state.meta[msgData.path].seq = msgData.seq

    if (result) {
      if (result instanceof Error)
        return cb(result)

      // store new state
      persist(function(err) {
        if (err) return cb(err)
        if (Array.isArray(result))
          cb(false, msgData.path, result[0], result[1], { author: msg.author, authi: authi, seq: msgData.seq })
        else
          cb()
      })
      if (Array.isArray(result)) // a visible change? (as signified by a diff array)
        obj.emit('change', msgData.path, result[0], result[1], { author: msg.author, authi: authi, seq: msgData.seq })
    } else
      cb()
  }

  // Batch apply messages
  obj.applyMessages = function(messages, opts, cb) {
    if (typeof opts == 'function') {
      cb = opts
      opts = null
    }
    var done = multicb()
    for (var i = 0; i < messages.length; i++)
      obj.applyMessage(messages[i], opts, done())
    done(function(err, results) {
      if (err) cb(err)
      else { cb(null, r2changes(results)) } // remove the err to create a list of changes
    })
  }

  // Create a stream which emits change events
  obj.createChangeStream = function() {
    // :TODO:
  }

  // Getters
  obj.getId = function() { return state.id }
  obj.getSeq = function() { return state.seq }
  obj.getMembers = function() { return state.members }
  obj.getOwner = function() { return state.members[0] }
  obj.getHistory = function(opts, cb) {
    if (typeof opts == 'function') {
      cb = opts
      opts = null
    }
    if (!opts) opts = {}

    // just ids, authi, and seq numbers
    var h = util.deepclone(state.history)
    if (!opts.includeMsg) {
      if (cb) return cb(null, h)
      return h
    }

    // pull and parse messages
    var done = multicb()
    h.forEach(function(entry) {
      if (Array.isArray(entry)) {
        entry.forEach(function(branch) {
          var cb2 = done()
          feed.get(branch.id, function(err, msg) {
            if (err) return cb2(err)
            branch.msg = msgpack.decode(msg.message)
            cb2()
          })
        })
      } else {
        var cb2 = done()
        feed.get(entry.id, function(err, msg) {
          if (err) return cb2(err)
          entry.msg = msgpack.decode(msg.message)
          cb2()
        })
      }
    })
    done(function(err) {
      if (err) cb(err)
      else cb(null, h)
    })
  }
  obj.typeof = function(key) { return state.meta[key].type }
  obj.getInternalState = function() { return state }

  // Get keys of all objects changed since seq
  obj.updatedSince = function(seq) {
    var ks = []
    for (var k in state.meta) {
      if (seq < state.meta[k].seq)
        ks.push(k)
    }
    return ks
  }

  // Private methods
  // ===============

  // Adds a message to the feed
  function publish(msg, cb) {
    msg.seq = ++state.seq
    feed.add('eco', msgpack.encode(msg), function(err, msg) {
      obj.applyMessage(msg, cb)
    })
  }

  // Converts a batch of results from applyMessage into a list of changes
  function r2changes(results) {
    return results.map(function(res) { return res.slice(1) }).filter(function(changes) { return changes.length })
  }

  // Adds the message to the history of the object
  function addHistory(msg, msgData, authi) {
    // var prev = (msgData.prev && msgData.prev.$msg) ? msgData.prev.$msg.toString('hex') : null
    var entry = { id: msg.id, authi: authi, seq: msgData.seq }
    var index = entry.seq - 1 // seq is 1-based

    // branch in history?
    if (state.history[index]) {
      if (!Array.isArray(state.history[index]))
        state.history[index] = [state.history[index]]
      
      // insert in order of author index
      for (var i=0; i < state.history[index].length; i++) {
        var other = state.history[index][i]
        if (other.id.toString('hex') == entry.id.toString('hex'))
          return // dup
        if (other.authi > entry.authi)
          return state.history[index].splice(i, 0, entry)
      }
      return state.history[index].push(entry) // append
    }

    // linear
    state.history[index] = entry
  }

  // Queues a state-write to the db
  var pqueue
  function persist(cb) {
    // is there a queue?
    if (pqueue)
      return pqueue.push(cb) // wait until the current op finishes
    
    // start a queue
    pqueue = []

    // write
    db.put(state.id, msgpack.encode(state), function(err, res) {
      // call cb
      cb(err, res)

      // clear the queue
      if (pqueue.length === 0)
        pqueue = null // no need to write again
      else {
        // persist() was called while a persist was in progress, meaning the state changed
        // write again
        db.put(state.id, msgpack.encode(state), function(err, res) {
          var pq = pqueue
          pqueue = null // queue cleared
          pq.forEach(function(cb) { cb(err, res) })
        })
      }
    })
  }

  // Applies a message to the local object
  function apply(msg, author, authi, seq) {
    var key = msg.args[0]
    var def = msg.args[1]

    if (msg.op == 'declare') return declare()
    return new Error('Unknown operation for the Object type')

    function declare() {
      var type = types[def.type]
      if (!type)
        return new Error('Unrecognized type "' + def.type + '" in object declare op')

      // conflict check
      var meta = state.meta[key]
      if (meta) {
        if (meta.authi <= authi)
          return false // existing authority is greater, abort
      }

      meta = {
        key:    key,
        type:   def.type,
        author: author,
        authi:  authi,
        seq:    seq
      }
      state.meta[key] = meta
      state.data[key] = type.initialize(msg, meta)
      obj.emit('declare', meta)
      return [key, undefined, state.data[key]]
    }
  }

  return obj
}
