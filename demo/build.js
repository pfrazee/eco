(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */
module.exports = React.createClass({displayName: 'exports',
    getInitialState: function() {
        return this.props.obj
    },
    handleInc: function(e) {
        this.props.obj[this.props.key]++
        this.props.onChange('green', this.props.key+': inc')
        this.setState(this.props.obj)
    },
    handleDec: function(e) {
        this.props.obj[this.props.key]--
        this.props.onChange('red', this.props.key+': dec')
        this.setState(this.props.obj)
    },
    render: function() {
        return React.DOM.div({className: "counter field"}, 
            "Counter", React.DOM.br(null), 
            React.DOM.input({type: "text", value: this.state[this.props.key], readOnly: true}), 
            React.DOM.button({onClick: this.handleInc}, "+"), React.DOM.button({onClick: this.handleDec}, "-")
        );
    }
})
},{}],2:[function(require,module,exports){
/** @jsx React.DOM */
module.exports = React.createClass({displayName: 'exports',
    getInitialState: function() {
        return this.props.obj
    },
    handleAdd: function(e) {
        var v = this.refs.entry.getDOMNode().value
        if (!v) return
        
        this.props.obj[this.props.key].push(v)
        this.props.onChange('green', this.props.key+': add '+v)

        this.refs.entry.getDOMNode().value = ''
        this.setState(this.props.obj)
    },
    render: function() {
        var values = this.props.obj[this.props.key].map(function(v, i) {
            return React.DOM.li({key: ('gset'+i)}, v)
        })
        return React.DOM.div({className: "growset set field"}, 
            "Growset", React.DOM.br(null), 
            React.DOM.ul(null, values), 
            React.DOM.input({type: "text", ref: "entry"}), 
            React.DOM.button({onClick: this.handleAdd}, "add")
        );
    }
})
},{}],3:[function(require,module,exports){
/** @jsx React.DOM */
module.exports = React.createClass({displayName: 'exports',
    getInitialState: function() {
        return this.props.obj
    },
    handleAdd: function(e) {
        var v = this.refs.entry.getDOMNode().value
        if (!v) return
        
        this.props.obj[this.props.key].push(v)
        this.props.onChange('green', this.props.key+': add '+v)

        this.refs.entry.getDOMNode().value = ''
        this.setState(this.props.obj)
    },
    handleRemove: function(e) {
        var i = e.target.dataset.index
        if (i == void 0) return

        var v = this.props.obj[this.props.key][i]
        this.props.obj[this.props.key].splice(i, 1)
        this.props.onChange('red', this.props.key+': remove '+v)

        this.setState(this.props.obj)        
    },
    render: function() {
        var values = this.props.obj[this.props.key].map(function(v, i) {
            return React.DOM.li({key: ('oset'+i)}, v, " ", React.DOM.button({onClick: this.handleRemove, 'data-index': i}, "remove"))
        }.bind(this))
        return React.DOM.div({className: "onceset set field"}, 
            "Onceset", React.DOM.br(null), 
            React.DOM.ul(null, values), 
            React.DOM.input({type: "text", ref: "entry"}), 
            React.DOM.button({onClick: this.handleAdd}, "add")
        );
    }
})
},{}],4:[function(require,module,exports){
/** @jsx React.DOM */
module.exports = React.createClass({displayName: 'exports',
    getInitialState: function() {
        return this.props.obj
    },
    handleSet: function(e) {
        var v = this.refs.reg.getDOMNode().value
        this.props.obj[this.props.key] = v
        this.props.onChange('green', this.props.key+': set '+v)
        this.setState(this.props.obj)
    },
    render: function() {
        return React.DOM.div({className: "register field"}, 
            "Register", React.DOM.br(null), 
            React.DOM.input({type: "text", defaultValue: this.state[this.props.key], ref: "reg"}), 
            React.DOM.button({onClick: this.handleSet}, "set")
        );
    }
})
},{}],5:[function(require,module,exports){
/** @jsx React.DOM */
module.exports = React.createClass({displayName: 'exports',
    getInitialState: function() {
        return this.props.obj
    },
    handleAdd: function(e) {
        var v = this.refs.entry.getDOMNode().value
        if (!v) return

        this.props.obj[this.props.key].push(v)
        this.props.onChange('green', this.props.key+': add '+v)

        this.refs.entry.getDOMNode().value = ''
        this.setState(this.props.obj)
    },
    handleRemove: function(e) {
        var i = e.target.dataset.index
        if (i == void 0) return

        var v = this.props.obj[this.props.key][i]
        this.props.obj[this.props.key].splice(i, 1)
        this.props.onChange('red', this.props.key+': remove '+v)
        
        this.setState(this.props.obj)
    },
    render: function() {
        var values = this.props.obj[this.props.key].map(function(v, i) {
            return React.DOM.li({key: ('orset'+i)}, v, " ", React.DOM.button({onClick: this.handleRemove, 'data-index': i}, "remove"))
        }.bind(this))
        return React.DOM.div({className: "orset set field"}, 
            "Set", React.DOM.br(null), 
            React.DOM.ul(null, values), 
            React.DOM.input({type: "text", ref: "entry"}), 
            React.DOM.button({onClick: this.handleAdd}, "add")
        );
    }
})
},{}],6:[function(require,module,exports){
/** @jsx React.DOM */
var eco = require('../lib')
var Counter = require('./com/counter')
var Register = require('./com/register')
var Growset = require('./com/growset')
var Onceset = require('./com/onceset')
var Set = require('./com/set')

var objects = [
    {counter: 0, reg: 'foo', gset: ['a'], oset: ['apple'], orset: ['orange'] },
    {counter: 1, reg: 'bar', gset: ['b', 'c'], oset: [], orset: [] }
]
window.objects = objects

var Object = React.createClass({displayName: 'Object',
    getInitialState: function() {
        return { changes: [] }
    },
    onChange: function(color, text) {
        this.state.changes.push({ color: color, text: text })
        this.setState(this.state)
    },
    handleCommit: function() {
        // TODO commit eco
        this.setState({ changes: [] })
    },
    render: function() {
        var changes = this.state.changes.map(function(change, i) {
            return React.DOM.div({key: i, style: ({color: change.color})}, change.text)
        })
        return React.DOM.div({className: "object"}, 
            Counter({obj: this.props.obj, key: "counter", onChange: this.onChange}), 
            Register({obj: this.props.obj, key: "reg", onChange: this.onChange}), 
            Growset({obj: this.props.obj, key: "gset", onChange: this.onChange}), 
            Onceset({obj: this.props.obj, key: "oset", onChange: this.onChange}), 
            Set({obj: this.props.obj, key: "orset", onChange: this.onChange}), 
            changes, 
            React.DOM.button({onClick: this.handleCommit}, "commit changes")
        )
    }
})
var objectNodes = objects.map(function(obj, i) {
    return (Object({obj: obj, key: ('obj'+i)}))
})

React.renderComponent(
    React.DOM.div(null, 
        objectNodes, 
        React.DOM.button(null, "Add replica")
    ),
    document.getElementById('app')
)


},{"../lib":7,"./com/counter":1,"./com/growset":2,"./com/onceset":3,"./com/register":4,"./com/set":5}],7:[function(require,module,exports){
var makeObject = require('./object')
var msglib = require('./message')
var msgpack = require('msgpack-js')

exports.create = function(db, feed, opts, cb) {
  if (!db) return cb(new Error('leveldb instance is required'))
  if (!feed) return cb(new Error('feed instance is required'))
  if (typeof opts == 'function') {
    cb = opts
    opts = null
  }
  if (!opts) opts = {}
  if (!opts.members) opts.members = [feed.id]
  if (opts.members[0].toString('hex') != feed.id.toString('hex'))
    opts.members.unshift(feed.id)

  // initialize state
  var state = {
    id: null,
    seq: 0,
    nodei: 0,
    members: opts.members,
    history: [],
    buffer: [],
    meta: {},
    data: {}
  }

  // publish init message
  var initmsg = msgpack.encode({
    seq: ++state.seq,
    op: 'init',
    args: [{ members: state.members.map(function(id) { return { $feed: id, $rel: 'eco-member' } }) }]
  })
  feed.add('eco', initmsg, function(err, msg, id) {
    if (err) return cb(err)
    state.id = id
    state.history.push({ id: id, seq: 1, authi: 0 })
    db.put(id, msgpack.encode(state), function(err) {
      if (err) return cb(err)
      cb(null, makeObject(db, feed, state))
    })
  })
}

exports.open = function(db, feed, objid, cb) {
  // try to load the object state from storage
  db.get(objid, function(err, state) {
    if (err && err.notFound) return pullFromFeed()
    if (err) return cb(err)
    
    state = msgpack.decode(state)
    if (!state || !state.id || typeof state.seq == 'undefined' || !state.members || !state.history || !state.meta || !state.data)
      return cb(new Error('Invalid read state; make sure the provided id is correct'))

    // create object
    cb(null, makeObject(db, feed, state))
  })

  function pullFromFeed() {
    // try to get the init message
    feed.get(objid, function(err, msg) {
      if (err) return cb(err)
      
      var msgData = msgpack.decode(msg.message)
      if (!msgData) return cb(new Error('Failed to decode init message'))
      var members = msgData.args[0].members.map(function(m) { return m.$feed })

      // initialize state
      var state = {
        id: objid,
        seq: msgData.seq,
        nodei: null,
        members: members,
        history: [{ id: objid, seq: 1, authi: 0 }],
        buffer: [],
        meta: {},
        data: {}
      }

      // try to find self in members
      var memberIdStrings = members.map(function(m) { return m.toString('hex') })
      state.nodei = memberIdStrings.indexOf(feed.id.toString('hex'))

      // create object
      cb(null, makeObject(db, feed, state))
    })
  }
}
},{"./message":8,"./object":9,"msgpack-js":22}],8:[function(require,module,exports){
exports.create = function(objid, previd, path, op) {
  return {
    obj: { $msg: objid, $rel: 'eco-object' },
    prev: { $msg: previd, $rel: 'eco-prev' },
    seq: null,
    path: path,
    op: op,
    args: Array.prototype.slice.call(arguments, 4) || []
  }
}

exports.validate = function(msg) {
  if (!msg)
    return new Error('Message is null')
  if (!msg.seq || typeof msg.seq != 'number')
    return new Error('Message `seq` is required and must be a number')
  if (typeof msg.path != 'string')
    return new Error('`path` must be a string')
  if (!msg.op || typeof msg.op != 'string')
    return new Error('`op` is required and must be a string')
  if (!msg.args)
    msg.args = []
}
},{}],9:[function(require,module,exports){
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
      publish(msglib.create(state.id, state.id, '', 'declare', key, types[key]), done())
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

  // Batch apply messages
  obj.applyMessages = function(messages, cb) {
    // apply each message
    var done = multicb()
    for (var i = 0; i < messages.length; i++)
      applyMessage(messages[i], done())
    done(function(err, results) {
      if (err) cb(err)
      else {
        var changes = r2changes(results)
        // apply any buffered messages
        drainBuffer(function(err, changes2) {
          if (err) cb(err)
          else {
            if (changes2 && changes2.length)
              changes = changes.concat(changes2)
            cb(null, changes)
          }
        })
      }
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
      if (err) return cb(err)
      applyMessage(msg, cb)
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

  // Has the message been handled yet?
  function hasHandled(msgId, endSeq) {
    msgId = msgId.toString('hex')
    endSeq = endSeq || state.history.length

    // try to find the message in the history
    for (var i = endSeq-1; i >= 0; i--) {
      if (!state.history[i])
        continue

      if (Array.isArray(state.history[i])) {
        // branch, check all
        for (var j=0; j < state.history[i].length; j++) {
          if (state.history[i][j].id.toString('hex') == msgId)
            return true
        }
      } else {
        // linear
        if (state.history[i].id.toString('hex') == msgId)
          return true
      }
    }
    return false
  }

  // Places the message in the buffer to be run after a causal dependency is handled
  function bufferMessage(depId, msg, seq) {
    state.buffer.push({ depId: depId, msg: msg, seq: seq })
  }

  // Runs any buffered messages that have been recently handled
  function drainBuffer(cb) {
    if (!state.buffer.length)
      return cb()
    var done = multicb()
    var wait = false
    state.buffer.forEach(function(entry) {
      if (hasHandled(entry.depId, entry.seq)) {
        // dep has been handled, run it now
        applyMessage(entry.msg, done())
        wait = true
      }
    })
    if (!wait)
      return cb()
    done(cb)
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

  // Apply a message received from the feed
  function applyMessage(msg, cb) {
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

    if (msgData.path === '') {
      // operation on the object
      var result = objApply(msg.id, msgData, msg.author, authi, msgData.seq)
      addHistory(msg, msgData, authi)
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
      // havent received the declaration message yet, put it in the queue
      bufferMessage(msgData.prev.$msg, msg, msgData.seq)
      return cb()
    }
    var type = types[meta.type]
    if (!type) return cb(new Error('Unrecognized type "' + meta.type + '" in object meta'))

    // run op
    var result = type.apply(state, msgData, authi)

    // update meta
    addHistory(msg, msgData, authi)
    if (msgData.seq > state.meta[msgData.path].seq)
      state.meta[msgData.path].seq = msgData.seq

    if (result) {
      if (result instanceof Error)
        return cb(result)

      // update prev link if the message was used
      if (Array.isArray(result))
        state.meta[msgData.path].prev = msg.id

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

  // Applies a message to the local object
  function objApply(msgId, msg, author, authi, seq) {
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
        seq:    seq,
        prev:   msgId
      }
      state.meta[key] = meta
      state.data[key] = type.initialize(msg, meta)
      obj.emit('declare', meta)
      return [key, undefined, state.data[key]]
    }
  }

  return obj
}

},{"./message":8,"./types":13,"./util":18,"./vclock":19,"events":41,"msgpack-js":22,"multicb":36}],10:[function(require,module,exports){
var msglib = require('../message')

// Provide an initial value for the type given a declaration message
exports.initialize = function(msg, meta) {
  return 0
}

// Apply an update message to the current value
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var amt = +msg.args[0] || 0
  var old = state.data[msg.path] || 0

  if (msg.op == 'inc') {
    state.data[msg.path] = old + amt
    return [old, state.data[msg.path]]
  }

  if (msg.op == 'dec') {
    state.data[msg.path] = old - amt
    return [old, state.data[msg.path]]
  }

  return new Error('Unknown operation for the Counter type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `meta`: the metadata of the value to update
//   - `meta.key`: the name of the value
//   - `meta.author`: the member who declared the value
//   - `meta.authi`: the index of the author in the member set
//   - `meta.vts`: the latest timestamp of the value
exports.diff = function(state, meta, current, other) {
  var diff = (+other) - (+current)
  if (!diff)
    return

  var op = 'inc'
  if (diff < 0) {
    op = 'dec'
    diff = -diff
  }
  
  return [msglib.create(state.id, meta.prev, meta.key, op, diff)]
}
},{"../message":8}],11:[function(require,module,exports){
var msglib = require('../message')

// Provide an initial value for the type given a declaration message
exports.initialize = function(msg) {
  return {}
}

// Apply an update message to the current value
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var k   = msg.args[0]
  var amt = +msg.args[1] || 0
  var data = state.data[msg.path]
  var old = data[k] || 0

  if (msg.op == 'inc') {
    data[k] = old + amt
    return [[k, old], [k, data[k]]]
  }

  if (msg.op == 'dec') {
    data[k] = old - amt
    return [[k, old], [k, data[k]]]
  }

  return new Error('Unknown operation for the CounterSet type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `meta`: the metadata of the value to update
//   - `meta.key`: the name of the value
//   - `meta.author`: the member who declared the value
//   - `meta.authi`: the index of the author in the member set
//   - `meta.vts`: the latest timestamp of the value
exports.diff = function(state, meta, current, other) {
  var msgs = []

  if (!other || typeof other != 'object')
    return

  for (var k in other) {
    var cv = current[k] || 0
    var ov = other[k]

    var diff = (+ov) - (+cv)
    if (diff === 0) {
      // only allow 0 if the current value is undefined
      if (typeof(current[k]) != 'undefined')
        continue
    } else if (!diff)
      continue // dont use a falsey but not-zero value

    var op = 'inc'
    if (diff < 0) {
      op = 'dec'
      diff = -diff
    }
    
    msgs.push(msglib.create(state.id, meta.prev, meta.key, op, k, diff))
  }

  return msgs
}
},{"../message":8}],12:[function(require,module,exports){
var msglib = require('../message')
var util   = require('../util')

// Provide an initial value for the type given a declaration message
exports.initialize = function(msg) {
  return []
}

// Apply an update message to the current value
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var v = msg.args[0]

  if (msg.op == 'add') {
    // does it exist yet?
    if (state.data[msg.path].indexOf(v) === -1) {
      // new add
      state.data[msg.path].push(v)
      return [undefined, v]
    }
    return
  }

  return new Error('Unknown operation for the GrowSet type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `meta`: the metadata of the value to update
//   - `meta.key`: the name of the value
//   - `meta.author`: the member who declared the value
//   - `meta.authi`: the index of the author in the member set
//   - `meta.vts`: the latest timestamp of the value
exports.diff = function(state, meta, current, other) {
  var msgs = []

  if (!Array.isArray(other))
    return

  var added = {}
  util.diffset(current, other, function(v) {
    if (v && typeof(v) == 'object' || typeof v == 'undefined')
      throw new Error('Sets can only contain values, not objects')

    var vk = util.valueToKey(v)
    if (!added[vk]) {
      msgs.push(msglib.create(state.id, meta.prev, meta.key, 'add', v))
      added[vk] = true
    }
  })
  
  return msgs
}
},{"../message":8,"../util":18}],13:[function(require,module,exports){
module.exports = {
  counter:    require('./counter'),
  counterset: require('./counterset'),
  growset:    require('./growset'),
  map:        require('./map'),
  onceset:    require('./onceset'),
  register:   require('./register'),
  set:        require('./set')
}
},{"./counter":10,"./counterset":11,"./growset":12,"./map":14,"./onceset":15,"./register":16,"./set":17}],14:[function(require,module,exports){
var mts    = require('monotonic-timestamp')
var msglib = require('../message')
var util   = require('../util')

function gentag(state) {
  return state.nodei + '-' + mts()
}

// Provide an initial value for the type given a declaration message
exports.initialize = function(msg) {
  return {}
}

// Apply an update message to the current value
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var key     = msg.args[0]
  var v       = msg.args[1]
  var addTag  = msg.args[2]
  var remTags = msg.args[3]
  var meta = state.meta[msg.path]
  var data = state.data[msg.path]
  if (!meta.seqs) meta.seqs = {}
  if (!meta.added) meta.added = {}
  if (!meta.removed) meta.removed = {}
  meta.added[key] = meta.added[key] || []
  meta.removed[key] = meta.removed[key] || []
  meta.seqs[key] = meta.seqs[key] || [-1, -1]

  if (msg.op == 'set') {
    // has the tag been removed yet?
    if (meta.removed[key].indexOf(addTag) !== -1)
      return false // no change

    // update the observed tags
    remTags.forEach(function(remTag) {
      if (meta.removed[key].indexOf(remTag) === -1)
        meta.removed[key].push(remTag) // add to removed
      var i = meta.added[key].indexOf(remTag)
      if (i !== -1)
        meta.added[key].splice(i, 1) // remove from added
    })

    // have the current value's tags been cleared?
    if (!meta.added[key].length) {
      // new value
      var old  = (typeof data[key] != 'undefined') ? util.deepclone(data[key]) : undefined
      if (v !== void 0) data[key] = v
      else delete data[key]
      meta.added[key].push(addTag)
      meta.seqs[key] = [msg.seq, authi] // track the seq
      return [[key, old], [key, v]]
    }

    // is this tag the one we've already seen?
    if (meta.added[key].indexOf(addTag) === -1) {
      // no, so there's been a concurrent change - last write
      meta.added[key].push(addTag) // track the tag no matter what (it's been observed)
      if (meta.seqs[key][0] > msg.seq || (meta.seqs[key][0] === msg.seq && meta.seqs[key][1] < authi))
        return true // existing stamp is greater, abort but persist meta updates

      // new value
      var old  = (typeof data[key] != 'undefined') ? util.deepclone(data[key]) : undefined
      if (v !== void 0) data[key] = v
      else delete data[key]
      meta.seqs[key] = [msg.seq, authi] // track the seq
      return [[key, old], [key, v]]
    }

    return true // no change, but persist meta updates
  }

  return new Error('Unknown operation for the Map type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `meta`: the metadata of the value to update
//   - `meta.key`: the name of the value
//   - `meta.author`: the member who declared the value
//   - `meta.authi`: the index of the author in the member set
//   - `meta.vts`: the latest timestamp of the value
exports.diff = function(state, meta, current, other) {
  var msgs = []

  if (!other || typeof other != 'object')
    return

  // find adds/updates
  for (var k in other) {
    var cv = current[k]
    var ov = other[k]

    if (ov && typeof ov == 'object')
      throw new Error('Object members can only be set to values, not sub-objects')

    if (cv === ov)
      continue
  
    var oldtags = (meta.added && k in meta.added) ? meta.added[k] : []
    msgs.push(msglib.create(state.id, meta.prev, meta.key, 'set', k, ov, gentag(state), oldtags))
  }

  // find removals
  for (var k in current) {
    if (k in other)
      continue
    
    var oldtags = (meta.added && k in meta.added) ? meta.added[k] : []
    msgs.push(msglib.create(state.id, meta.prev, meta.key, 'set', k, undefined, gentag(state), oldtags))
  }

  return msgs
}

/*
1: This leaves the possibility of dropped messages if the application applies them out of order.
For example, if we had the following sequence:
1. set a=1 from bob, vts=[1, 0]
2. set b=2 from alice, vts=[1, 1]
3. set c=3 from bob, vts=[2, 1]
If a node somehow applied #2 and #3 before #1, the vts would become [2, 1]. The #1 update would not apply after that.
*/
},{"../message":8,"../util":18,"monotonic-timestamp":21}],15:[function(require,module,exports){
var msglib = require('../message')
var util   = require('../util')

// Provide an initial value for the type given a declaration message
exports.initialize = function(msg) {
  return []
}

// Apply an update message to the current value
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var v    = msg.args[0]
  var meta = state.meta[msg.path]
  if (!meta.removed) meta.removed = []

  if (msg.op == 'add') {
    // has it been added yet?
    var exists = (state.data[msg.path].indexOf(v) !== -1)
    var removed = (meta.removed.indexOf(v) !== -1)
    if (!exists && !removed) {
      // new add
      state.data[msg.path].push(v)
      return [undefined, v]
    }
    return false // nothing changed
  }

  if (msg.op == 'remove') {
    // has it been removed yet?
    if (meta.removed.indexOf(v) === -1) {
      // new remove
      meta.removed.push(v)
      var i = state.data[msg.path].indexOf(v)
      if (i !== -1) state.data[msg.path].splice(i, 1)
      return [v, undefined]
    }
    return false // nothing changed
  }

  return new Error('Unknown operation for the OnceSet type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `meta`: the metadata of the value to update
//   - `meta.key`: the name of the value
//   - `meta.author`: the member who declared the value
//   - `meta.authi`: the index of the author in the member set
//   - `meta.vts`: the latest timestamp of the value
exports.diff = function(state, meta, current, other) {
  var msgs = []

  if (!Array.isArray(other))
    return

  var added = {}, removed = {}
  util.diffset(current, other,
    function(v) {
      if (v && typeof(v) == 'object' || typeof v == 'undefined')
        throw new Error('Sets can only contain values, not objects')

      var vk = util.valueToKey(v)
      if (!added[vk]) {
        msgs.push(msglib.create(state.id, meta.prev, meta.key, 'add', v))
        added[vk] = true
      }
    },
    function(v) {
      var vk = util.valueToKey(v)
      if (!removed[vk]) {
        msgs.push(msglib.create(state.id, meta.prev, meta.key, 'remove', v))
        removed[vk] = true
      }      
    }
  )
  
  return msgs
}
},{"../message":8,"../util":18}],16:[function(require,module,exports){
var msglib = require('../message')
var util   = require('../util')
var vclib  = require('../vclock')

// Provide an initial value for the type given a declaration message
exports.initialize = function(msg) {
  return null
}

// Apply an update message to the current value
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var v    = msg.args[0]
  var meta = state.meta[msg.path]
  meta.seq = meta.seq || -1

  if (meta.seq > msg.seq || (meta.seq === msg.seq && meta.authi < authi)) {
    // existing definition's timestamp dominates, abort
    return
  }

  var old  = util.deepclone(state.data[msg.path] || null)
  if (msg.op == 'set') {
    state.data[msg.path] = v
    meta.seq = msg.seq
    meta.authi = authi // track authi
    return [old, v]
  }

  return new Error('Unknown operation for the Register type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `meta`: the metadata of the value to update
//   - `meta.key`: the name of the value
//   - `meta.author`: the member who declared the value
//   - `meta.authi`: the index of the author in the member set
//   - `meta.vts`: the latest timestamp of the value
exports.diff = function(state, meta, current, other) {
  if (current === other)
    return
  if (other && typeof other == 'object')
    throw new Error('Registers can only be set to values, not objects')
  return [msglib.create(state.id, meta.prev, meta.key, 'set', other)]
}
},{"../message":8,"../util":18,"../vclock":19}],17:[function(require,module,exports){
var mts    = require('monotonic-timestamp')
var msglib = require('../message')
var util   = require('../util')

function gentag(state) {
  return state.nodei + '-' + mts()
}

// Provide an initial value for the type given a declaration message
exports.initialize = function(msg) {
  return []
}

// Apply an update message to the current value
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var v    = msg.args[0]
  var vk   = util.valueToKey(v)
  var meta = state.meta[msg.path]
  var data = state.data[msg.path]
  if (!meta.added) meta.added = {}
  if (!meta.removed) meta.removed = {}
  meta.added[vk] = meta.added[vk] || []
  meta.removed[vk] = meta.removed[vk] || []

  if (msg.op == 'add') {
    var tagArg = msg.args[1]

    // has the tag been removed yet?
    if (meta.removed[vk].indexOf(tagArg) !== -1)
      return false // no change

    // has the value been added yet?
    if (!meta.added[vk].length) {
      // new add
      meta.added[vk].push(tagArg)
      data.push(v)
      return [undefined, v]
    }

    // has the tag been observed yet?
    if (meta.added[vk].indexOf(tagArg) === -1) {
      // observe the tag
      meta.added[vk].push(tagArg)
      return true // signal a persist() to update the metadata, but dont emit a change
    }

    return false // no change
  }

  if (msg.op == 'remove') {
    var tagsArg = msg.args[1]
    if (!Array.isArray(tagsArg))
      return new Error('Invalid "tags" argument for the Set `remove` operation')

    // update the observed tags
    tagsArg.forEach(function(tagArg) {
      if (meta.removed[vk].indexOf(tagArg) === -1)
        meta.removed[vk].push(tagArg) // add to removed
      var i = meta.added[vk].indexOf(tagArg)
      if (i !== -1)
        meta.added[vk].splice(i, 1) // remove from added
    })

    // has the value been removed?
    if (meta.added[vk].length === 0) {
      // new remove
      var i = data.indexOf(v)
      if (i !== -1) data.splice(i, 1)
      return [v, undefined]
    }
    return false // nothing changed
  }

  return new Error('Unknown operation for the Set type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.meta`: metadata about object's types
// - `meta`: the metadata of the value to update
//   - `meta.key`: the name of the value
//   - `meta.author`: the member who declared the value
//   - `meta.authi`: the index of the author in the member set
//   - `meta.vts`: the latest timestamp of the value
exports.diff = function(state, meta, current, other) {
  var msgs = []

  if (!Array.isArray(other))
    return

  var added = {}, removed = {}
  util.diffset(current, other,
    function(v) {
      if (v && typeof(v) == 'object' || typeof v == 'undefined')
        throw new Error('Sets can only contain values, not objects')

      var vk = util.valueToKey(v)
      if (!added[vk]) {
        msgs.push(msglib.create(state.id, meta.prev, meta.key, 'add', v, gentag(state)))
        added[vk] = true
      }
    },
    function(v) {
      var vk = util.valueToKey(v)
      if (!removed[vk]) {
        if (!meta.added[vk] || !meta.added[vk].length) {
          console.error('OH SHITS', state, meta, current, other)
          throw new Error('Trying to remove `'+v+'` from Set but can not find tags for it; this must be an internal bug in ECO. Please let us know it happened!')
        }
        msgs.push(msglib.create(state.id, meta.prev, meta.key, 'remove', v, meta.added[vk]))
        removed[vk] = true
      }      
    }
  )
  
  return msgs
}
},{"../message":8,"../util":18,"monotonic-timestamp":21}],18:[function(require,module,exports){
exports.deepclone = function(v) {
  return require('clone')(v)
}

exports.diffset = function(a, b, add, remove) {
  var inboth = {}
  b.forEach(function(v) {
    var i = a.indexOf(v)
    if (i === -1) {
      // doesnt yet exist, add
      if (add)
        add(v)
    } else {
      // store index
      inboth[i] = true
    }
  })
  if (!remove) return
  a.forEach(function(v, i) {
    if (!inboth[i] && b.indexOf(v) === -1 /*see [1]*/) {
      // no longer exists, remove
      remove(v)
    }
  })
}

exports.valueToKey = function(v) {
  if (v === null) return '__null__'
  return '__'+(typeof v)+'__'+v
}

/*
1: check inboth[1] and b.indexOf.
This guards against duplicates in `a` causing a remove, even though the value is present in both `a` and `b`
If we remove `b.indexOf`, then `diffset([1, 1], [1])` would result in a remove of 1 because the second 1 in `a` would not have an `inboth` entry
*/
},{"clone":20}],19:[function(require,module,exports){
exports.compare = function(a, b) {
  if (a.length != b.length) throw new Error('Inconsistent vector lengths')
  var r = 0
  for (var i=0; i < a.length; i++) {
    if (r === 0) {
      if (a[i] < b[i]) r = -1
      if (a[i] > b[i]) r = 1
    } else {
      if (a[i] < b[i] && r == 1) return 0
      if (a[i] > b[i] && r == -1) return 0
    }
  }
  return r
}

exports.mergeLeft = function(a, b) {
  if (a.length != b.length) throw new Error('Inconsistent vector lengths')
  for (var i=0; i < a.length; i++) {
    a[i] = Math.max(a[i], b[i])
  }
  return a
}

exports.test = function(a, op, b) {
  if (op == '>')
    return exports.compare(a, b) == 1
  if (op == '<')
    return exports.compare(a, b) == -1
  throw new Error('Vclock.js test() only supports "<" and ">"')
}
},{}],20:[function(require,module,exports){
(function (Buffer){
'use strict';

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

// shim for Node's 'util' package
// DO NOT REMOVE THIS! It is required for compatibility with EnderJS (http://enderjs.com/).
var util = {
  isArray: function (ar) {
    return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
  },
  isDate: function (d) {
    return typeof d === 'object' && objectToString(d) === '[object Date]';
  },
  isRegExp: function (re) {
    return typeof re === 'object' && objectToString(re) === '[object RegExp]';
  },
  getRegExpFlags: function (re) {
    var flags = '';
    re.global && (flags += 'g');
    re.ignoreCase && (flags += 'i');
    re.multiline && (flags += 'm');
    return flags;
  }
};


if (typeof module === 'object')
  module.exports = clone;

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/

function clone(parent, circular, depth, prototype) {
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth == 0)
      return parent;

    var child;
    if (typeof parent != 'object') {
      return parent;
    }

    if (util.isArray(parent)) {
      child = [];
    } else if (util.isRegExp(parent)) {
      child = new RegExp(parent.source, util.getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (util.isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      child = new Buffer(parent.length);
      parent.copy(child);
      return child;
    } else {
      if (typeof prototype == 'undefined') child = Object.create(Object.getPrototypeOf(parent));
      else child = Object.create(prototype);
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (var i in parent) {
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

}).call(this,require("buffer").Buffer)
},{"buffer":37}],21:[function(require,module,exports){
// If `Date.now()` is invoked twice quickly, it's possible to get two
// identical time stamps. To avoid generation duplications, subsequent
// calls are manually ordered to force uniqueness.

var _last = 0
var _count = 1
var adjusted = 0
var _adjusted = 0

module.exports =
function timestamp() {
  /**
  Returns NOT an accurate representation of the current time.
  Since js only measures time as ms, if you call `Date.now()`
  twice quickly, it's possible to get two identical time stamps.
  This function guarantees unique but maybe inaccurate results
  on each call.
  **/
  //uncomment this wen
  var time = Date.now()
  //time = ~~ (time / 1000) 
  //^^^uncomment when testing...

  /**
  If time returned is same as in last call, adjust it by
  adding a number based on the counter. 
  Counter is incremented so that next call get's adjusted properly.
  Because floats have restricted precision, 
  may need to step past some values...
  **/
  if (_last === time)  {
    do {
      adjusted = time + ((_count++) / (_count + 999))
    } while (adjusted === _adjusted)
    _adjusted = adjusted
  }
  // If last time was different reset timer back to `1`.
  else {
    _count = 1
    adjusted = time
  }
  _adjusted = adjusted
  _last = time
  return adjusted
}

},{}],22:[function(require,module,exports){
"use strict";

var bops = require('bops');

exports.encode = function (value) {
  var toJSONed = []
  var size = sizeof(value)
  if(size == 0)
    return undefined
  var buffer = bops.create(size);
  encode(value, buffer, 0);
  return buffer;
};

exports.decode = decode;

// http://wiki.msgpack.org/display/MSGPACK/Format+specification
// I've extended the protocol to have two new types that were previously reserved.
//   buffer 16  11011000  0xd8
//   buffer 32  11011001  0xd9
// These work just like raw16 and raw32 except they are node buffers instead of strings.
//
// Also I've added a type for `undefined`
//   undefined  11000100  0xc4

function Decoder(buffer, offset) {
  this.offset = offset || 0;
  this.buffer = buffer;
}
Decoder.prototype.map = function (length) {
  var value = {};
  for (var i = 0; i < length; i++) {
    var key = this.parse();
    value[key] = this.parse();
  }
  return value;
};
Decoder.prototype.buf = function (length) {
  var value = bops.subarray(this.buffer, this.offset, this.offset + length);
  this.offset += length;
  return value;
};
Decoder.prototype.raw = function (length) {
  var value = bops.to(bops.subarray(this.buffer, this.offset, this.offset + length));
  this.offset += length;
  return value;
};
Decoder.prototype.array = function (length) {
  var value = new Array(length);
  for (var i = 0; i < length; i++) {
    value[i] = this.parse();
  }
  return value;
};
Decoder.prototype.parse = function () {
  var type = this.buffer[this.offset];
  var value, length;
  // FixRaw
  if ((type & 0xe0) === 0xa0) {
    length = type & 0x1f;
    this.offset++;
    return this.raw(length);
  }
  // FixMap
  if ((type & 0xf0) === 0x80) {
    length = type & 0x0f;
    this.offset++;
    return this.map(length);
  }
  // FixArray
  if ((type & 0xf0) === 0x90) {
    length = type & 0x0f;
    this.offset++;
    return this.array(length);
  }
  // Positive FixNum
  if ((type & 0x80) === 0x00) {
    this.offset++;
    return type;
  }
  // Negative Fixnum
  if ((type & 0xe0) === 0xe0) {
    value = bops.readInt8(this.buffer, this.offset);
    this.offset++;
    return value;
  }
  switch (type) {
  // raw 16
  case 0xda:
    length = bops.readUInt16BE(this.buffer, this.offset + 1);
    this.offset += 3;
    return this.raw(length);
  // raw 32
  case 0xdb:
    length = bops.readUInt32BE(this.buffer, this.offset + 1);
    this.offset += 5;
    return this.raw(length);
  // nil
  case 0xc0:
    this.offset++;
    return null;
  // false
  case 0xc2:
    this.offset++;
    return false;
  // true
  case 0xc3:
    this.offset++;
    return true;
  // undefined
  case 0xc4:
    this.offset++;
    return undefined;
  // uint8
  case 0xcc:
    value = this.buffer[this.offset + 1];
    this.offset += 2;
    return value;
  // uint 16
  case 0xcd:
    value = bops.readUInt16BE(this.buffer, this.offset + 1);
    this.offset += 3;
    return value;
  // uint 32
  case 0xce:
    value = bops.readUInt32BE(this.buffer, this.offset + 1);
    this.offset += 5;
    return value;
  // uint64
  case 0xcf:
    value = bops.readUInt64BE(this.buffer, this.offset + 1);
    this.offset += 9;
    return value;
  // int 8
  case 0xd0:
    value = bops.readInt8(this.buffer, this.offset + 1);
    this.offset += 2;
    return value;
  // int 16
  case 0xd1:
    value = bops.readInt16BE(this.buffer, this.offset + 1);
    this.offset += 3;
    return value;
  // int 32
  case 0xd2:
    value = bops.readInt32BE(this.buffer, this.offset + 1);
    this.offset += 5;
    return value;
  // int 64
  case 0xd3:
    value = bops.readInt64BE(this.buffer, this.offset + 1);
    this.offset += 9;
    return value;
  // map 16
  case 0xde:
    length = bops.readUInt16BE(this.buffer, this.offset + 1);
    this.offset += 3;
    return this.map(length);
  // map 32
  case 0xdf:
    length = bops.readUInt32BE(this.buffer, this.offset + 1);
    this.offset += 5;
    return this.map(length);
  // array 16
  case 0xdc:
    length = bops.readUInt16BE(this.buffer, this.offset + 1);
    this.offset += 3;
    return this.array(length);
  // array 32
  case 0xdd:
    length = bops.readUInt32BE(this.buffer, this.offset + 1);
    this.offset += 5;
    return this.array(length);
  // buffer 16
  case 0xd8:
    length = bops.readUInt16BE(this.buffer, this.offset + 1);
    this.offset += 3;
    return this.buf(length);
  // buffer 32
  case 0xd9:
    length = bops.readUInt32BE(this.buffer, this.offset + 1);
    this.offset += 5;
    return this.buf(length);
  // float
  case 0xca:
    value = bops.readFloatBE(this.buffer, this.offset + 1);
    this.offset += 5;
    return value;
  // double
  case 0xcb:
    value = bops.readDoubleBE(this.buffer, this.offset + 1);
    this.offset += 9;
    return value;
  }
  throw new Error("Unknown type 0x" + type.toString(16));
};
function decode(buffer) {
  var decoder = new Decoder(buffer);
  var value = decoder.parse();
  if (decoder.offset !== buffer.length) throw new Error((buffer.length - decoder.offset) + " trailing bytes");
  return value;
}

function encodeableKeys (value) {
  return Object.keys(value).filter(function (e) {
    return 'function' !== typeof value[e] || !!value[e].toJSON
  })
}

function encode(value, buffer, offset) {
  var type = typeof value;
  var length, size;

  // Strings Bytes
  if (type === "string") {
    value = bops.from(value);
    length = value.length;
    // fix raw
    if (length < 0x20) {
      buffer[offset] = length | 0xa0;
      bops.copy(value, buffer, offset + 1);
      return 1 + length;
    }
    // raw 16
    if (length < 0x10000) {
      buffer[offset] = 0xda;
      bops.writeUInt16BE(buffer, length, offset + 1);
      bops.copy(value, buffer, offset + 3);
      return 3 + length;
    }
    // raw 32
    if (length < 0x100000000) {
      buffer[offset] = 0xdb;
      bops.writeUInt32BE(buffer, length, offset + 1);
      bops.copy(value, buffer, offset + 5);
      return 5 + length;
    }
  }

  if (bops.is(value)) {
    length = value.length;
    // buffer 16
    if (length < 0x10000) {
      buffer[offset] = 0xd8;
      bops.writeUInt16BE(buffer, length, offset + 1);
      bops.copy(value, buffer, offset + 3);
      return 3 + length;
    }
    // buffer 32
    if (length < 0x100000000) {
      buffer[offset] = 0xd9;
      bops.writeUInt32BE(buffer, length, offset + 1);
      bops.copy(value, buffer, offset + 5);
      return 5 + length;
    }
  }

  if (type === "number") {
    // Floating Point
    if ((value << 0) !== value) {
      buffer[offset] =  0xcb;
      bops.writeDoubleBE(buffer, value, offset + 1);
      return 9;
    }

    // Integers
    if (value >=0) {
      // positive fixnum
      if (value < 0x80) {
        buffer[offset] = value;
        return 1;
      }
      // uint 8
      if (value < 0x100) {
        buffer[offset] = 0xcc;
        buffer[offset + 1] = value;
        return 2;
      }
      // uint 16
      if (value < 0x10000) {
        buffer[offset] = 0xcd;
        bops.writeUInt16BE(buffer, value, offset + 1);
        return 3;
      }
      // uint 32
      if (value < 0x100000000) {
        buffer[offset] = 0xce;
        bops.writeUInt32BE(buffer, value, offset + 1);
        return 5;
      }
      // uint 64
      if (value < 0x10000000000000000) {
        buffer[offset] = 0xcf;
        bops.writeUInt64BE(buffer, value, offset + 1);
        return 9;
      }
      throw new Error("Number too big 0x" + value.toString(16));
    }
    // negative fixnum
    if (value >= -0x20) {
      bops.writeInt8(buffer, value, offset);
      return 1;
    }
    // int 8
    if (value >= -0x80) {
      buffer[offset] = 0xd0;
      bops.writeInt8(buffer, value, offset + 1);
      return 2;
    }
    // int 16
    if (value >= -0x8000) {
      buffer[offset] = 0xd1;
      bops.writeInt16BE(buffer, value, offset + 1);
      return 3;
    }
    // int 32
    if (value >= -0x80000000) {
      buffer[offset] = 0xd2;
      bops.writeInt32BE(buffer, value, offset + 1);
      return 5;
    }
    // int 64
    if (value >= -0x8000000000000000) {
      buffer[offset] = 0xd3;
      bops.writeInt64BE(buffer, value, offset + 1);
      return 9;
    }
    throw new Error("Number too small -0x" + value.toString(16).substr(1));
  }

  // undefined
  if (type === "undefined") {
    buffer[offset] = 0xc4;
    return 1;
  }

  // null
  if (value === null) {
    buffer[offset] = 0xc0;
    return 1;
  }

  // Boolean
  if (type === "boolean") {
    buffer[offset] = value ? 0xc3 : 0xc2;
    return 1;
  }

  if('function' === typeof value.toJSON)
    return encode(value.toJSON(), buffer, offset)

  // Container Types
  if (type === "object") {

    size = 0;
    var isArray = Array.isArray(value);

    if (isArray) {
      length = value.length;
    }
    else {
      var keys = encodeableKeys(value)
      length = keys.length;
    }

    if (length < 0x10) {
      buffer[offset] = length | (isArray ? 0x90 : 0x80);
      size = 1;
    }
    else if (length < 0x10000) {
      buffer[offset] = isArray ? 0xdc : 0xde;
      bops.writeUInt16BE(buffer, length, offset + 1);
      size = 3;
    }
    else if (length < 0x100000000) {
      buffer[offset] = isArray ? 0xdd : 0xdf;
      bops.writeUInt32BE(buffer, length, offset + 1);
      size = 5;
    }

    if (isArray) {
      for (var i = 0; i < length; i++) {
        size += encode(value[i], buffer, offset + size);
      }
    }
    else {
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        size += encode(key, buffer, offset + size);
        size += encode(value[key], buffer, offset + size);
      }
    }

    return size;
  }
  if(type === "function")
    return undefined
  throw new Error("Unknown type " + type);
}

function sizeof(value) {
  var type = typeof value;
  var length, size;

  // Raw Bytes
  if (type === "string") {
    // TODO: this creates a throw-away buffer which is probably expensive on browsers.
    length = bops.from(value).length;
    if (length < 0x20) {
      return 1 + length;
    }
    if (length < 0x10000) {
      return 3 + length;
    }
    if (length < 0x100000000) {
      return 5 + length;
    }
  }

  if (bops.is(value)) {
    length = value.length;
    if (length < 0x10000) {
      return 3 + length;
    }
    if (length < 0x100000000) {
      return 5 + length;
    }
  }

  if (type === "number") {
    // Floating Point
    // double
    if (value << 0 !== value) return 9;

    // Integers
    if (value >=0) {
      // positive fixnum
      if (value < 0x80) return 1;
      // uint 8
      if (value < 0x100) return 2;
      // uint 16
      if (value < 0x10000) return 3;
      // uint 32
      if (value < 0x100000000) return 5;
      // uint 64
      if (value < 0x10000000000000000) return 9;
      throw new Error("Number too big 0x" + value.toString(16));
    }
    // negative fixnum
    if (value >= -0x20) return 1;
    // int 8
    if (value >= -0x80) return 2;
    // int 16
    if (value >= -0x8000) return 3;
    // int 32
    if (value >= -0x80000000) return 5;
    // int 64
    if (value >= -0x8000000000000000) return 9;
    throw new Error("Number too small -0x" + value.toString(16).substr(1));
  }

  // Boolean, null, undefined
  if (type === "boolean" || type === "undefined" || value === null) return 1;

  if('function' === typeof value.toJSON)
    return sizeof(value.toJSON())

  // Container Types
  if (type === "object") {
    if('function' === typeof value.toJSON)
      value = value.toJSON()

    size = 0;
    if (Array.isArray(value)) {
      length = value.length;
      for (var i = 0; i < length; i++) {
        size += sizeof(value[i]);
      }
    }
    else {
      var keys = encodeableKeys(value)
      length = keys.length;
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        size += sizeof(key) + sizeof(value[key]);
      }
    }
    if (length < 0x10) {
      return 1 + size;
    }
    if (length < 0x10000) {
      return 3 + size;
    }
    if (length < 0x100000000) {
      return 5 + size;
    }
    throw new Error("Array or object too long 0x" + length.toString(16));
  }
  if(type === "function")
    return 0
  throw new Error("Unknown type " + type);
}



},{"bops":23}],23:[function(require,module,exports){
var proto = {}
module.exports = proto

proto.from = require('./from.js')
proto.to = require('./to.js')
proto.is = require('./is.js')
proto.subarray = require('./subarray.js')
proto.join = require('./join.js')
proto.copy = require('./copy.js')
proto.create = require('./create.js')

mix(require('./read.js'), proto)
mix(require('./write.js'), proto)

function mix(from, into) {
  for(var key in from) {
    into[key] = from[key]
  }
}

},{"./copy.js":26,"./create.js":27,"./from.js":28,"./is.js":29,"./join.js":30,"./read.js":32,"./subarray.js":33,"./to.js":34,"./write.js":35}],24:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],25:[function(require,module,exports){
module.exports = to_utf8

var out = []
  , col = []
  , fcc = String.fromCharCode
  , mask = [0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]
  , unmask = [
      0x00
    , 0x01
    , 0x02 | 0x01
    , 0x04 | 0x02 | 0x01
    , 0x08 | 0x04 | 0x02 | 0x01
    , 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x40 | 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
  ]

function to_utf8(bytes, start, end) {
  start = start === undefined ? 0 : start
  end = end === undefined ? bytes.length : end

  var idx = 0
    , hi = 0x80
    , collecting = 0
    , pos
    , by

  col.length =
  out.length = 0

  while(idx < bytes.length) {
    by = bytes[idx]
    if(!collecting && by & hi) {
      pos = find_pad_position(by)
      collecting += pos
      if(pos < 8) {
        col[col.length] = by & unmask[6 - pos]
      }
    } else if(collecting) {
      col[col.length] = by & unmask[6]
      --collecting
      if(!collecting && col.length) {
        out[out.length] = fcc(reduced(col, pos))
        col.length = 0
      }
    } else { 
      out[out.length] = fcc(by)
    }
    ++idx
  }
  if(col.length && !collecting) {
    out[out.length] = fcc(reduced(col, pos))
    col.length = 0
  }
  return out.join('')
}

function find_pad_position(byt) {
  for(var i = 0; i < 7; ++i) {
    if(!(byt & mask[i])) {
      break
    }
  }
  return i
}

function reduced(list) {
  var out = 0
  for(var i = 0, len = list.length; i < len; ++i) {
    out |= list[i] << ((len - i - 1) * 6)
  }
  return out
}

},{}],26:[function(require,module,exports){
module.exports = copy

var slice = [].slice

function copy(source, target, target_start, source_start, source_end) {
  target_start = arguments.length < 3 ? 0 : target_start
  source_start = arguments.length < 4 ? 0 : source_start
  source_end = arguments.length < 5 ? source.length : source_end

  if(source_end === source_start) {
    return
  }

  if(target.length === 0 || source.length === 0) {
    return
  }

  if(source_end > source.length) {
    source_end = source.length
  }

  if(target.length - target_start < source_end - source_start) {
    source_end = target.length - target_start + source_start
  }

  if(source.buffer !== target.buffer) {
    return fast_copy(source, target, target_start, source_start, source_end)
  }
  return slow_copy(source, target, target_start, source_start, source_end)
}

function fast_copy(source, target, target_start, source_start, source_end) {
  var len = (source_end - source_start) + target_start

  for(var i = target_start, j = source_start;
      i < len;
      ++i,
      ++j) {
    target[i] = source[j]
  }
}

function slow_copy(from, to, j, i, jend) {
  // the buffers could overlap.
  var iend = jend + i
    , tmp = new Uint8Array(slice.call(from, i, iend))
    , x = 0

  for(; i < iend; ++i, ++x) {
    to[j++] = tmp[x]
  }
}

},{}],27:[function(require,module,exports){
module.exports = function(size) {
  return new Uint8Array(size)
}

},{}],28:[function(require,module,exports){
module.exports = from

var base64 = require('base64-js')

var decoders = {
    hex: from_hex
  , utf8: from_utf
  , base64: from_base64
}

function from(source, encoding) {
  if(Array.isArray(source)) {
    return new Uint8Array(source)
  }

  return decoders[encoding || 'utf8'](source)
}

function from_hex(str) {
  var size = str.length / 2
    , buf = new Uint8Array(size)
    , character = ''

  for(var i = 0, len = str.length; i < len; ++i) {
    character += str.charAt(i)

    if(i > 0 && (i % 2) === 1) {
      buf[i>>>1] = parseInt(character, 16)
      character = '' 
    }
  }

  return buf 
}

function from_utf(str) {
  var bytes = []
    , tmp
    , ch

  for(var i = 0, len = str.length; i < len; ++i) {
    ch = str.charCodeAt(i)
    if(ch & 0x80) {
      tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
      for(var j = 0, jlen = tmp.length; j < jlen; ++j) {
        bytes[bytes.length] = parseInt(tmp[j], 16)
      }
    } else {
      bytes[bytes.length] = ch 
    }
  }

  return new Uint8Array(bytes)
}

function from_base64(str) {
  return new Uint8Array(base64.toByteArray(str)) 
}

},{"base64-js":24}],29:[function(require,module,exports){

module.exports = function(buffer) {
  return buffer instanceof Uint8Array;
}

},{}],30:[function(require,module,exports){
module.exports = join

function join(targets, hint) {
  if(!targets.length) {
    return new Uint8Array(0)
  }

  var len = hint !== undefined ? hint : get_length(targets)
    , out = new Uint8Array(len)
    , cur = targets[0]
    , curlen = cur.length
    , curidx = 0
    , curoff = 0
    , i = 0

  while(i < len) {
    if(curoff === curlen) {
      curoff = 0
      ++curidx
      cur = targets[curidx]
      curlen = cur && cur.length
      continue
    }
    out[i++] = cur[curoff++] 
  }

  return out
}

function get_length(targets) {
  var size = 0
  for(var i = 0, len = targets.length; i < len; ++i) {
    size += targets[i].byteLength
  }
  return size
}

},{}],31:[function(require,module,exports){
var proto
  , map

module.exports = proto = {}

map = typeof WeakMap === 'undefined' ? null : new WeakMap

proto.get = !map ? no_weakmap_get : get

function no_weakmap_get(target) {
  return new DataView(target.buffer, 0)
}

function get(target) {
  var out = map.get(target.buffer)
  if(!out) {
    map.set(target.buffer, out = new DataView(target.buffer, 0))
  }
  return out
}

},{}],32:[function(require,module,exports){
module.exports = {
    readUInt8:      read_uint8
  , readInt8:       read_int8
  , readUInt16LE:   read_uint16_le
  , readUInt32LE:   read_uint32_le
  , readInt16LE:    read_int16_le
  , readInt32LE:    read_int32_le
  , readFloatLE:    read_float_le
  , readDoubleLE:   read_double_le
  , readUInt16BE:   read_uint16_be
  , readUInt32BE:   read_uint32_be
  , readInt16BE:    read_int16_be
  , readInt32BE:    read_int32_be
  , readFloatBE:    read_float_be
  , readDoubleBE:   read_double_be
}

var map = require('./mapped.js')

function read_uint8(target, at) {
  return target[at]
}

function read_int8(target, at) {
  var v = target[at];
  return v < 0x80 ? v : v - 0x100
}

function read_uint16_le(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, true)
}

function read_uint32_le(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, true)
}

function read_int16_le(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, true)
}

function read_int32_le(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, true)
}

function read_float_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, true)
}

function read_double_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, true)
}

function read_uint16_be(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, false)
}

function read_uint32_be(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, false)
}

function read_int16_be(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, false)
}

function read_int32_be(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, false)
}

function read_float_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, false)
}

function read_double_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, false)
}

},{"./mapped.js":31}],33:[function(require,module,exports){
module.exports = subarray

function subarray(buf, from, to) {
  return buf.subarray(from || 0, to || buf.length)
}

},{}],34:[function(require,module,exports){
module.exports = to

var base64 = require('base64-js')
  , toutf8 = require('to-utf8')

var encoders = {
    hex: to_hex
  , utf8: to_utf
  , base64: to_base64
}

function to(buf, encoding) {
  return encoders[encoding || 'utf8'](buf)
}

function to_hex(buf) {
  var str = ''
    , byt

  for(var i = 0, len = buf.length; i < len; ++i) {
    byt = buf[i]
    str += ((byt & 0xF0) >>> 4).toString(16)
    str += (byt & 0x0F).toString(16)
  }

  return str
}

function to_utf(buf) {
  return toutf8(buf)
}

function to_base64(buf) {
  return base64.fromByteArray(buf)
}


},{"base64-js":24,"to-utf8":25}],35:[function(require,module,exports){
module.exports = {
    writeUInt8:      write_uint8
  , writeInt8:       write_int8
  , writeUInt16LE:   write_uint16_le
  , writeUInt32LE:   write_uint32_le
  , writeInt16LE:    write_int16_le
  , writeInt32LE:    write_int32_le
  , writeFloatLE:    write_float_le
  , writeDoubleLE:   write_double_le
  , writeUInt16BE:   write_uint16_be
  , writeUInt32BE:   write_uint32_be
  , writeInt16BE:    write_int16_be
  , writeInt32BE:    write_int32_be
  , writeFloatBE:    write_float_be
  , writeDoubleBE:   write_double_be
}

var map = require('./mapped.js')

function write_uint8(target, value, at) {
  return target[at] = value
}

function write_int8(target, value, at) {
  return target[at] = value < 0 ? value + 0x100 : value
}

function write_uint16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, true)
}

function write_uint32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, true)
}

function write_int16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, true)
}

function write_int32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, true)
}

function write_float_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, true)
}

function write_double_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, true)
}

function write_uint16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, false)
}

function write_uint32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, false)
}

function write_int16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, false)
}

function write_int32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, false)
}

function write_float_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, false)
}

function write_double_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, false)
}

},{"./mapped.js":31}],36:[function(require,module,exports){


module.exports = function() {
  var n = 0, m = 0, _cb, results = [], _err;

  return function(cb) {
    if (cb) {
      results.length = m

      if(_err) {
        var err = _err; _err = null
        return cb(err)
      }
      if(n == m)
        return cb(null, results)

      _cb = cb
      return
    }

    var i = m++
    return function (err) {
      if (err) {
        _err = err
        n = -1 // stop
        if (_cb) _cb(err)
      } else {
        n++
        results[i] = Array.prototype.slice.call(arguments)
        if (n === m && _cb)
          _cb(null, results)
      }
    }
  }
}

},{}],37:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":38,"ieee754":39,"is-array":40}],38:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],39:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],40:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],41:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[6]);
