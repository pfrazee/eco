'use strict'
var tape = require('tape');
var equal = require('deep-equal');
var util = require('../lib/util')

module.exports = function(opts) {
  tape('diffset', function(t) {
    var adds, removes
    function reset() { adds = []; removes = [] }
    function add(v) { adds.push(v) }
    function remove(v) { removes.push(v) }

    reset()
    util.diffset([0, 1, 2], [1, 2, 3], add, remove)
    t.assert(equal, adds, [3])
    t.assert(equal, removes, [0])
    console.log('[0, 1, 2] / [1, 2, 3] = add', adds, ', remove', removes)

    reset()
    util.diffset([0, 1, 2], [1, 2, 3], add)
    t.assert(equal, adds, [3])
    t.assert(equal, removes, [])
    console.log('(addonly) [0, 1, 2] / [1, 2, 3] = add', adds)

    reset()
    util.diffset([0, 1, 2], [1, 2, 3], null, remove)
    t.assert(equal, adds, [])
    t.assert(equal, removes, [0])
    console.log('(removeonly) [0, 1, 2] / [1, 2, 3] = remove', removes)

    reset()
    util.diffset([2, 0, 2, 1, 0, 0], [3, 1, 3, 2, 3, 1], add, remove)
    t.assert(equal, adds, [3])
    t.assert(equal, removes, [0])
    console.log('[2, 0, 2, 1, 0, 0] / [3, 1, 3, 2, 3, 1] = add', adds, ', remove', removes)

    reset()
    util.diffset([0, 1, 2], [], add, remove)
    t.assert(equal, adds, [])
    t.assert(equal, removes, [0, 1, 2])
    console.log('[0, 1, 2] / [] = add', adds, ', remove', removes)

    reset()
    util.diffset([], [1, 2, 3], add, remove)
    t.assert(equal, adds, [1, 2, 3])
    t.assert(equal, removes, [])
    console.log('[] / [1, 2, 3] = add', adds, ', remove', removes)

    reset()
    util.diffset([5], [1, 2, 3], add, remove)
    t.assert(equal, adds, [1, 2, 3])
    t.assert(equal, removes, [])
    console.log('[5] / [1, 2, 3] = add', adds, ', remove', removes)

    t.end()
  })
}

if(!module.parent)
  module.exports({ })
