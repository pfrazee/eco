'use strict'
var tape = require('tape');
var equal = require('deep-equal');

module.exports = function(opts) {
  tape('replication (2 nodes)', function(t) {
    var fb = require('../lib/fuddlebutt')
    
    var node1 = fb.instance()
    var node2 = fb.instance()

    node1.add({ message: 'a' })
    node1.add({ message: 'b' })
    node2.add({ message: 'c' })
    node1.add({ message: 'd' })
    node2.add({ message: 'e' })
    node2.add({ message: 'f' })
    node1.add({ message: 'g' })
    node1.add({ message: 'h' })

    node1.sync(node2)

    console.log('node1 feed', node1.getFeed())
    console.log('node2 feed', node2.getFeed())
    t.assert(equal(node1.getFeed(), node2.getFeed()))
    t.end()
  })

  tape('replication (3 nodes)', function(t) {
    var fb = require('../lib/fuddlebutt')
    
    var node1 = fb.instance()
    var node2 = fb.instance()
    var node3 = fb.instance()

    node1.add({ message: 'a' })
    node1.add({ message: 'b' })
    node2.add({ message: 'c' })
    node3.add({ message: 'd' })
    node3.add({ message: 'e' })
    node2.add({ message: 'f' })
    node1.add({ message: 'g' })
    node3.add({ message: 'h' })

    node1.sync(node2)
    node2.sync(node3)
    node1.sync(node3)

    console.log('node1 feed', node1.getFeed())
    console.log('node2 feed', node2.getFeed())
    console.log('node3 feed', node3.getFeed())
    t.assert(equal(node1.getFeed(), node2.getFeed()))
    t.assert(equal(node2.getFeed(), node3.getFeed()))
    t.assert(equal(node3.getFeed(), node1.getFeed()))
    t.end()
  })
}

if(!module.parent)
  module.exports({ })
