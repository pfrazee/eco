exports.create = function() {
  var register = {}

  register.initialize = function(msg) {
    // :TODO: return initial value
  }

  register.apply = function(obj, state, msg) {
    // :TODO: apply the update
    // :TODO: emit change event
    // :TODO: return true if update occurred
  }

  register.diff = function(obj, schema, current, other) {
    // :TODO: check for changes and return a list of operation messages
  }

  return register
}