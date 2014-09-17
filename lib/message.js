exports.create = function(path, op) {
  return {
    vts: null,
    path: path,
    op: op,
    args: Array.prototype.slice.call(arguments, 2) || []
  }
}

exports.validate = function(msg) {
  if (!msg.vts || !Array.isArray(msg.vts))
    throw new Error('Vector timestamp `vts` is required and must be an array')
  if (typeof msg.path != 'string')
    throw new Error('`path` must be a string')
  if (!msg.op || typeof msg.op != 'string')
    throw new Error('`op` is required and must be a string')
  if (!msg.args)
    msg.args = []
}