var makeObject = require('./object')
var msglib = require('./message')
var msgpack = require('msgpack')

exports.create = function(db, ssb, feed, opts, cb) {
  if (!db) return cb(new Error('leveldb instance is required'))
  if (!ssb) return cb(new Error('ssb instance is required'))
  if (!feed) return cb(new Error('feed instance is required'))
  if (typeof opts == 'function') {
    cb = opts
    opts = null
  }
  if (!opts) opts = {}
  if (!opts.members) opts.members = [feed.id]
  if (opts.members[0].toString('hex') != feed.id.toString('hex'))
    opts.members.unshift(feed.id)

  // Initialize state
  var state = {
    id: null,
    vclock: new Array(opts.members.length),
    nodeindex: 0,
    members: opts.members,
    schema: {},
    data: {}
  }

  // Publish init message
  state.vclock[state.nodeindex]++
  var initmsg = msgpack.pack({
    vts: state.vclock,
    op: 'init',
    args: [{ members: state.members.map(function(id) { return { $feed: id, $rel: 'eco-member' } }) }]
  })
  feed.add('eco', initmsg, function(err, msg, id) {
    if (err) return cb(err)
    state.id = id
    db.put(id, state, function(err) {
      if (err) return cb(err)
      cb(null, makeObject(db, ssb, feed, state))
    })
  })
}

exports.open = function(db, ssb, feed, messageid, cb) {
  db.get(messageid, function(err, state) {
    if (err) return cb(err)
    if (!state || !state.id || !state.vclock || !state.members || !state.schema || !state.data)
      return cb(new Error('Invalid read state; make sure the provided id is correct'))
    cb(null, makeObject(db, ssb, feed, state))
  })
}