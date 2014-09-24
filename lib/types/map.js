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

  for (var k in other) {
    var cv = current[k]
    var ov = other[k]

    if (ov && typeof ov == 'object')
      throw new Error('Object members can only be set to values, not sub-objects')

    if (cv === ov)
      continue
    
    var oldtags = (meta.added && k in meta.added) ? meta.added[k] : []
    msgs.push(msglib.create(state.id, meta.key, 'set', k, ov, gentag(state), oldtags))
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