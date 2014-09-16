// Lightweight Fake Scuttlebutt, used for running simulations
var timestamp = require('monotonic-timestamp')

function rand() { return Math.round(Math.random()*100000) }

exports.instance = function() {
  var fb = { id: rand(), mymsgs: [], allmsgs: {}, feeds: {} }

  fb.add = function (msg) {
    msg.timestamp = timestamp()
    this.mymsgs.push(msg)
    this.allmsgs[msg.timestamp] = msg
  }
  fb.sync = function (other) {
    var f = this.feeds[other.id]
    if (!f) { f = this.feeds[other.id] = { id: other.id, seq: 0 } }
    var g = other.feeds[this.id]
    if (!g) { g = other.feeds[this.id] = { id: this.id, seq: 0 } }

    // Copy the messages into a merged timeline
    for (f.seq; f.seq < other.mymsgs.length; f.seq++) {
      var msg = other.mymsgs[f.seq]
      this.allmsgs[msg.timestamp] = msg
    }
    for (g.seq; g.seq < this.mymsgs.length; g.seq++) {
      var msg = this.mymsgs[g.seq]
      other.allmsgs[msg.timestamp] = msg
    }
  }
  fb.getFeed = function() {
    var self = this
    return Object.keys(this.allmsgs)
      .sort(function(a, b) { return (+a) - (+b) })
      .map(function(key) { return self.allmsgs[key] })
  }

  return fb;
};