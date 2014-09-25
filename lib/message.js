exports.create = function(objid, previd, path, op) {
  return {
    obj: { $msg: objid, $rel: 'eco-object' },
    prev: { $msg: previd, $rel: 'eco-prev' },
    seq: null,
    path: path,
    op: op,
    args: Array.prototype.slice.call(arguments, 4) || []
  }
}

exports.validate = function(msg) {
  if (!msg)
    return new Error('Message is null')
  if (!msg.seq || typeof msg.seq != 'number')
    return new Error('Message `seq` is required and must be a number')
  if (typeof msg.path != 'string')
    return new Error('`path` must be a string')
  if (!msg.op || typeof msg.op != 'string')
    return new Error('`op` is required and must be a string')
  if (!msg.args)
    msg.args = []
}