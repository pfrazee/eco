exports.compare = function(a, b) {
  if (a.length != b.length) throw new Error('Inconsistent vector lengths')
  var r
  for (var i=0; i < a.length; i++) {
    if (a[i] == b[i])
      return 0
    if (r == void 0) {
      r = (a[i] < b[i]) ? -1 : 1
    } else {
      if (a[i] < b[i] && r == 1)
        return 0
      if (a[i] > b[i] && r == -1)
        return 0
    }
  }
  return r
}

exports.mergeLeft = function(a, b) {
  if (a.length != b.length) throw new Error('Inconsistent vector lengths')
  for (var i=0; i < a.length; i++) {
    a[i] = Math.max(a[i], b[i])
  }
  return a
}

exports.test = function(a, op, b) {
  if (op == '>')
    return exports.compare(a, b) == 1
  if (op == '<')
    return exports.compare(a, b) == -1
  throw new Error('Vclock.js test() only supports "<" and ">"')
}