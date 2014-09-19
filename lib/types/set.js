exports.create = function() {
  var set = {}

  set.initialize = function(msg) {
    // :TODO: return initial value
  }

  set.apply = function(obj, state, msg) {
    // :TODO: apply the update
    // :TODO: emit change event
    // :TODO: return true if update occurred
  }

  set.diff = function(obj, schema, current, other) {
    // :TODO: check for changes and return a list of operation messages
  }

  return set
}