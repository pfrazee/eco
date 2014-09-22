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
  
  return [msglib.create(state.id, meta.key, op, diff)]
}