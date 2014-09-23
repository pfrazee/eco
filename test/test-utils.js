var multicb = require('multicb')
var equal = require('deep-equal')
var msgpack = require('msgpack-js')
var eco = require('../lib')

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

exports.simulator = function(t, dbs) {
  var sim = {}

  var runCounter = 0

  sim.run = function(numNodes, syncFreq, numSyncs, decl, ops, finalState, cb) {
    var feeds = [], idStrings
    var objs = []; objs.length = numNodes
    var topology = []

    var runLetter = String.fromCharCode(65 + (runCounter++))
    var logentries = []
    var log = function() {
      logentries.push(Array.prototype.slice.call(arguments))
      // var entry = ['RUN_'+runLetter].concat(arguments)
      // console.log.apply(console, entry)
    }

    log('Starting Simulation')
    log('numNodes', numNodes)
    log('syncFreq', syncFreq)
    log('numSyncs', numSyncs)
    log('decl', decl)
    log('ops', ops)

    if (numNodes < 2)
      return cb(new Error('Must have at least 2 nodes'))

    setup()

    function setup() {
      // build a topology
      for (var i = 0; i < numNodes; i++) {
        for (var j = 0; j < numNodes; j++) {
          if (i !== j) topology.push([i, j])
        }
      }

      // create feeds
      log('creating', numNodes, 'feeds')
      for (var i=0; i < numNodes; i++)
        feeds.push(exports.makefeed())
      var ids = feeds.map(function(feed) { return feed.id })
      idStrings = ids.map(function(buf) { return buf.toString('hex') })

      // create object
      log('creating object')
      eco.create(dbs[0], feeds[0], {members: ids}, function(err, obj0) {
        if (err) return cb(err)
        objs[0] = obj0
        obj0.declare(decl, function(err, changes) {
          if (err) return cb(err)
          if (!changes.length) return cb(new Error('owner feed failed to construct object'))

          // open object in non-owner feeds
          log('opening object in nonowner feeds')
          var done = multicb()
          feeds.forEach(function(feed, i) {
            if (i === 0) return // skip 1
            var cb2 = done()
            
            // replicate
            feeds[0].msgs.forEach(feed.addExisting.bind(feed))
            
            // reconstruct
            eco.open(dbs[i], feed, obj0.getId(), function(err, obj) {
              if (err) return cb2(err)
              objs[i] = obj
              obj.applyMessages(feed.msgs.slice(1), function(err, changes) {
                if (err) return cb2(err)
                if (!changes.length) return cb2(new Error('member feed failed to construct object'))
                cb2()
              })
            })
          })
          done(function() {
            log('created objects', objs.length)
            doNextOp()
          })
        })
      })
    }

    var syncCounter = 0
    function doNextOp() {
      log('object states', objs.map(function(obj) { return obj.get() }))

      // run next op or stop at end
      var op = ops.shift()
      if (!op) return checkFinal()
      doOp()

      function doOp() {
        log('executing', op)
        // run on a random node
        var nodei = Math.floor(Math.random() * numNodes)
        log('using node', nodei)
        applyOp(objs[nodei], op, doSync)
      }

      function doSync(err) {
        if (err) return cb(err)

        // time to sync?
        syncCounter++
        if (syncCounter < syncFreq)
          return doNextOp() // not yet
        syncCounter = 0

        // run a random syncset
        log('syncing...')
        var top = topology.slice()
        var starts = feeds.map(function(feed) { return feed.msgs.length })
        for (var i=0; i < numSyncs; i++) {
          // choose a random edge and sync
          var s = top.splice(Math.floor(Math.random() * top.length), 1)[0]
          log('...', s)
          feeds[s[0]].msgs.forEach(feeds[s[1]].addExisting.bind(feeds[s[1]]))
        }

        // apply the messages of any updated feeds
        var noupdates = true
        var done = multicb()
        feeds.forEach(function(feed, i) {
          if (feed.msgs.length > starts[i]) {
            log('node', i, 'apply', feed.msgs.length - starts[i])
            log('obj', i, 'internal state', objs[i].getInternalState().data)
            log('obj', i, 'internal meta', objs[i].getInternalState().meta)
            objs[i].applyMessages(feed.msgs.slice(starts[i]), done())
            noupdates = false
          }
        })
        done(function(err, changes) {
          if (err) return cb(err)
          log('changes...')
          changes.forEach(function(change, i) { log.apply(null, change[1]) })
          doNextOp() // keep going
        })
        if (noupdates) // this can happen if none of the syncs involved changed nodes
          done()()
      }
    }

    function checkFinal() {
      // do a final full sync
      log('final full sync')
      var starts = feeds.map(function(feed) { return feed.msgs.length })
      for (var i=0; i < numNodes; i++) {
        for (var j=0; j < numNodes; j++) {
          feeds[i].msgs.forEach(feeds[j].addExisting.bind(feeds[j]))
        }
      }
      log('starts', starts)

      // apply the messages
      var noupdates = true
      var done = multicb()
      feeds.forEach(function(feed, i) {
        if (feed.msgs.length > starts[i]) {
          log('node', i, 'apply', feed.msgs.length - starts[i])
          log('obj', i, 'internal state', objs[i].getInternalState().data)
          log('obj', i, 'internal meta', objs[i].getInternalState().meta)
          objs[i].applyMessages(feed.msgs.slice(starts[i]), done())
          noupdates = false
        }
      })
      done(function(err, changes) {
        if (err) return cb(err)
        log('changes', changes.map(function(change) { return change[1] }))
        log('expected state', (finalState === true) ? 'convergent' : finalState)
        log('final states', objs.map(function(obj) { return obj.get() }))

        for (var i=0; i < numNodes; i++) {
          var s = objs[i].get()
          for (var k in s) {
            if (Array.isArray(s[k]))
              s[k] = s[k].sort() // sort for comparison
          }

          if (finalState === true) {
            finalState = s // just checking convergence, so use this node's result for the next nodes
            log('expecting convergence to', s)
          }
          else {
            var passes = equal(s, finalState)
            t.assert(passes)
            if (!passes) { // OH NO
              console.error('FAIL DUMP FOR RUN_' + runLetter)
              logentries.forEach(function(entry) { console.error.apply(console, entry) })
              console.error('MESSAGE HISTORIES')
              feeds.forEach(function(feed) {
                feed.msgs.forEach(function(msg) {
                  console.error(msgpack.decode(msg.message), 'authi:', idStrings.indexOf(msg.author.toString('hex')))
                })
              })
            }
          }
        }
        cb()
      })
      if (noupdates) // this can happen if none of the syncs involved changed nodes
        done()()
    }
  }

  function applyOp(obj, op, cb) {
    var k = op[1]
    var state = obj.get()
    switch (op[0]) {
      case 'set': state[k] = op[2]; break
      case 'inc': state[k] = (state[k]||0) + op[2]; break
      case 'dec': state[k] = (state[k]||0) - op[2]; break
      case 'add': state[k].push(op[2]); break
      case 'rem': state[k] = (state[k]||[]); var i = state[k].indexOf(op[2]); if (i!==-1) { state[k].splice(i, 1); } break
      case 'setkey': state[k] = state[k] || {}; state[k][op[2]] = op[3]; break
      case 'inckey': state[k] = state[k] || {}; state[k][op[2]] = (state[k][op[2]]||0) + op[3]; break
      case 'deckey': state[k] = state[k] || {}; state[k][op[2]] = (state[k][op[2]]||0) - op[3]; break
    }
    obj.put(state, cb)
  }

  sim.cleanup = function(cb) {
    var done = multicb()
    for (var i=0; i < dbs.length; i++) {
      dbs[i].close(done())
    }
    done(cb)
  }

  return sim
}