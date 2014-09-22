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
        msgs.push(msglib.create(state.id, meta.key, 'add', v, gentag(state)))
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
        msgs.push(msglib.create(state.id, meta.key, 'remove', v, meta.added[vk]))
        removed[vk] = true
      }      
    }
  )
  
  return msgs
}