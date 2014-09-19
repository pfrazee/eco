var msglib = require('../message')
var util   = require('../util')

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
//   - `state.schema`: metadata about object's types
// - `msg`: the message applying the update
//   - `msg.path`: key of the value to update
//   - `msg.op`: operation to run
//   - `msg.args`: arguments to the operation
//   - `msg.obj`: link to the object's declaration message
//   - `msg.vts`: vector timestamp of the message
// - `authi`: index of the message author in the member set
exports.apply = function(state, msg, authi) {
  var key    = msg.args[0]
  var v      = msg.args[1]
  var old    = util.deepclone(state.data[msg.path][key] || null)
  var schema = state.schema[key]

  // :TODO:

  return new Error('Unknown operation for the Map type')
}

// Compare two values and produce update operations to reconcile them
// - `state`: the internal state of the parent object
//   - `state.id`: object id
//   - `state.vclock`: local time
//   - `state.nodei`: index of the local node in the member set
//   - `state.members`: member set of the object
//   - `state.data`: current values
//   - `state.schema`: metadata about object's types
// - `schema`: the type definition of the value to update
//   - `schema.key`: the name of the value
//   - `schema.author`: the member who declared the value
//   - `schema.authi`: the index of the author in the member set
//   - `schema.vts`: the latest timestamp of the value
exports.diff = function(state, schema, current, other) {
  var msgs = []

  if (!Array.isArray(other))
    return

  other.forEach(function(v) {
    if (current.indexOf(v) === -1) {
      msgs.push(msglib.create(state.id, schema.key, 'add', v))
    }
  })
  
  return msgs
}