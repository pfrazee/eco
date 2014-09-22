exports.randomid = function() {
  var arr = new Array(32)
  for (var i=0; i < 32; i++)
    arr[i] = Math.random() * 256;
  return new Buffer(arr)
}

exports.makefeed = function() {
  return {
    id: exports.randomid(),
    add: function(type, message, cb) {
      var mid = exports.randomid()
      var msg = {
        id: mid,
        type: type,
        message: message,
        author: this.id
      }
      this.addExisting(msg)
      setImmediate(function() { cb(null, msg, mid) })
    },
    get: function(id, cb) { // :TODO: a function not yet in ssb, but probably needed
      if (Buffer.isBuffer(id))
        id = id.toString('hex')

      if (id in this.msgMap)
        return cb(null, this.msgs[this.msgMap[id]])

      var err = new Error('not found')
      err.notFound = true
      cb(err)
    },
    addExisting: function(msg) { // non-ssb function used to mimic replication
      if (msg.id.toString('hex') in this.msgMap)
        return
      this.msgMap[msg.id.toString('hex')] = this.msgs.length
      this.msgs.push(msg)
    },
    msgs: [],
    msgMap: {}
  }
}