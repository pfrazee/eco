exports.deepclone = function(v) {
  return JSON.parse(JSON.stringify(v)) // dont hate me because Im beautiful
}

exports.diffset = function(a, b, add, remove) {
  var inboth = {}
  b.forEach(function(v) {
    var i = a.indexOf(v)
    if (i === -1) {
      // doesnt yet exist, add
      if (add)
        add(v)
    } else {
      // store index
      inboth[i] = true
    }
  })
  if (!remove) return
  a.forEach(function(v, i) {
    if (!inboth[i] && b.indexOf(v) === -1 /*see [1]*/) {
      // no longer exists, remove
      remove(v)
    }
  })
}

/*
1: check inboth[1] and b.indexOf.
This guards against duplicates in `a` causing a remove, even though the value is present in both `a` and `b`
If we remove `b.indexOf`, then `diffset([1, 1], [1])` would result in a remove of 1 because the second 1 in `a` would not have an `inboth` entry
*/