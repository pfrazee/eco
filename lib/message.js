exports.create = function(objid, path, op) {
  return {
    obj: { $msg: objid, $rel: 'eco-object' },
    vts: null,
    path: path,
    op: op,
    args: Array.prototype.slice.call(arguments, 2) || []
  }
}

exports.validate = function(msg) {
  if (!msg)
    return new Error('Message is null')
  if (!msg.vts || !Array.isArray(msg.vts))
    return new Error('Vector timestamp `vts` is required and must be an array')
  if (typeof msg.path != 'string')
    return new Error('`path` must be a string')
  if (!msg.op || typeof msg.op != 'string')
    return new Error('`op` is required and must be a string')
  if (!msg.args)
    msg.args = []
}