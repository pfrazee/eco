var makeObject = require('./object')
var msglib = require('./message')
var msgpack = require('msgpack-js')

function newArray(n) {
  var arr = new Array(n)
  for (var i=0; i < n; i++)
    arr[i] = 0
  return arr
}

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
    vclock: newArray(opts.members.length),
    nodei: 0,
    members: opts.members,
    meta: {},
    data: {}
  }

  // publish init message
  state.vclock[state.nodei]++
  var initmsg = msgpack.encode({
    vts: state.vclock,
    op: 'init',
    args: [{ members: state.members.map(function(id) { return { $feed: id, $rel: 'eco-member' } }) }]
  })
  feed.add('eco', initmsg, function(err, msg, id) {
    if (err) return cb(err)
    state.id = id
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
    if (!state || !state.id || !state.vclock || !state.members || !state.meta || !state.data)
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
        vclock: msgData.vts,
        nodei: null,
        members: members,
        meta: {},
        data: {}
      }

      // try to find self in members
      var memberIdStrings = members.map(function(m) { return m.toString('hex') })
      state.nodei = memberIdStrings.indexOf(feed.id.toString('hex'))

      // update vclock
      if (state.nodei !== -1)
        state.vclock[state.nodei]++

      // create object
      cb(null, makeObject(db, feed, state))
    })
  }
}