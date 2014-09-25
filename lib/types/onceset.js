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