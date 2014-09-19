exports.create = function() {
  var onceset = {}

  onceset.initialize = function(msg) {
    // :TODO: return initial value
  }

  onceset.apply = function(obj, state, msg) {
    // :TODO: apply the update
    // :TODO: emit change event
    // :TODO: return true if update occurred
  }

  onceset.diff = function(obj, schema, current, other) {
    // :TODO: check for changes and return a list of operation messages
  }

  return onceset
}