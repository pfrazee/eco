exports.create = function() {
  var map = {}

  map.set = function(k, v) {
    if (k && typeof k == 'object') {
      for (var kk in k)
        this.set(kk, k[kk])
      return
    }
  }

  map.get = function(k) {
  }

  map.remove = function(k) {
  }

  map.isMV = function(k) {
  }

  map.apply = function(msg) {
  }

  return map
}