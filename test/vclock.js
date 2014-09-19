'use strict'
var tape = require('tape');
var equal = require('deep-equal');
var vc = require('../lib/vclock')

module.exports = function(opts) {
  tape('comparison', function(t) {
    t.equal(0, vc.compare([0], [0]))
    t.equal(0, vc.compare([1], [1]))
    t.equal(0, vc.compare([0, 0], [0, 0]))
    t.equal(0, vc.compare([0, 1, 2], [0, 1, 2]))

    t.equal(-1, vc.compare([0], [1]))
    t.equal(-1, vc.compare([0, 0], [1, 1]))
    t.equal(-1, vc.compare([0, 1, 2], [3, 2, 6]))
    t.equal(-1, vc.compare([5, 3, 9], [6, 10, 26]))

    t.equal(1, vc.compare([1], [0]))
    t.equal(1, vc.compare([1, 1], [0, 0]))
    t.equal(1, vc.compare([3, 2, 6], [0, 1, 2]))
    t.equal(1, vc.compare([6, 10, 26], [5, 3, 9]))

    t.equal(0, vc.compare([0, 1], [1, 0]))
    t.equal(0, vc.compare([0, 1], [1, 1]))
    t.equal(0, vc.compare([1, 1], [1, 0]))
    t.equal(0, vc.compare([1, 2, 3], [2, 3, 0]))

    t.equal(true,  vc.test([0], '<', [1]))
    t.equal(false, vc.test([0], '>', [1]))
    t.equal(true,  vc.test([1], '>', [0]))
    t.equal(false, vc.test([1], '<', [0]))

    t.end()
  })
  tape('merge left', function(t) {
    t.assert(equal([1], vc.mergeLeft([1], [1])))
    t.assert(equal([1], vc.mergeLeft([0], [1])))
    t.assert(equal([3], vc.mergeLeft([3], [1])))
    t.assert(equal([1, 2, 3], vc.mergeLeft([0, 0, 0], [1, 2, 3])))
    t.assert(equal([1, 2, 3], vc.mergeLeft([1, 2, 0], [0, 0, 3])))
    t.end()
  })
}

if(!module.parent)
  module.exports({ })
