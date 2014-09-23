'use strict'
var tape = require('tape')
var level = require('level')
var memdown = require('memdown')
var multicb = require('multicb')
var tutil = require('./test-utils')

function factorial(num) {
  if (num === 0) { return 1; }
  else { return num * factorial( num - 1 ); }
}

function runsims(sim, numNodes, syncFreq, numSyncs, cb) {
  var done = multicb()

  var involvesConcurrency = (factorial(numNodes) != numSyncs || syncFreq != 1)

  sim.run(numNodes, syncFreq, numSyncs, { my_counter: 'counter' }, [
    ['inc', 'my_counter', 1],
    ['inc', 'my_counter', 1],
    ['inc', 'my_counter', 2],
    ['inc', 'my_counter', 1],
    ['inc', 'my_counter', 3],
    ['inc', 'my_counter', 1],
    ['inc', 'my_counter', 4],
    ['inc', 'my_counter', 1]
  ], { my_counter: 14 }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_counter: 'counter' }, [
    ['inc', 'my_counter', 1],
    ['dec', 'my_counter', 1],
    ['inc', 'my_counter', 2],
    ['inc', 'my_counter', 1],
    ['dec', 'my_counter', 3],
    ['inc', 'my_counter', 1],
    ['dec', 'my_counter', 4],
    ['inc', 'my_counter', 1]
  ], { my_counter: -2 }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_counterset: 'counterset' }, [
    ['inckey', 'my_counterset', 0, 1],
    ['inckey', 'my_counterset', 'a', 1],
    ['inckey', 'my_counterset', 0, 2],
    ['inckey', 'my_counterset', 'b', 1],
    ['inckey', 'my_counterset', 'a', 3],
    ['inckey', 'my_counterset', 0, 1],
    ['inckey', 'my_counterset', 'a', 4],
    ['inckey', 'my_counterset', 0, 1]
  ], { my_counterset: { 0: 5, a: 8, b: 1 } }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_counterset: 'counterset' }, [
    ['inckey', 'my_counterset', 0, 1],
    ['inckey', 'my_counterset', 'a', 1],
    ['deckey', 'my_counterset', 0, 2],
    ['deckey', 'my_counterset', 'b', 1],
    ['inckey', 'my_counterset', 'a', 3],
    ['inckey', 'my_counterset', 0, 1],
    ['deckey', 'my_counterset', 'a', 4],
    ['inckey', 'my_counterset', 0, 1]
  ], { my_counterset: { 0: 1, a: 0, b: -1 } }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_gset: 'growset' }, [
    ['add', 'my_gset', 1],
    ['add', 'my_gset', 1],
    ['add', 'my_gset', 2],
    ['add', 'my_gset', 1],
    ['add', 'my_gset', 3],
    ['add', 'my_gset', 1],
    ['add', 'my_gset', 4],
    ['add', 'my_gset', 1]
  ], { my_gset: [1, 2, 3, 4] }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_map: 'map' }, [
    ['setkey', 'my_map', 0, 0],
    ['setkey', 'my_map', 'a', 1],
    ['setkey', 'my_map', 'b', 2],
    ['setkey', 'my_map', 'c', 3]
  ], { my_map: { 0: 0, a: 1, b: 2, c: 3 } }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_map: 'map' }, [
    ['setkey', 'my_map', 0, 1],
    ['setkey', 'my_map', 'a', 1],
    ['setkey', 'my_map', 0, 2],
    ['setkey', 'my_map', 'b', 1],
    ['setkey', 'my_map', 'a', 3],
    ['setkey', 'my_map', 0, undefined],
    ['setkey', 'my_map', 'a', 4],
    ['setkey', 'my_map', 0, 1]
  ], (involvesConcurrency) ? true : { my_map: { 0: 1, a: 4, b: 1 } }, done())
  // if there's concurrency, just make sure it converges (the final state is unpredictable)

  sim.run(numNodes, syncFreq, numSyncs, { my_oset: 'onceset' }, [
    ['add', 'my_oset', 1],
    ['add', 'my_oset', 1],
    ['add', 'my_oset', 2],
    ['add', 'my_oset', 1],
    ['add', 'my_oset', 3],
    ['add', 'my_oset', 1],
    ['add', 'my_oset', 4],
    ['add', 'my_oset', 1]
  ], { my_oset: [1, 2, 3, 4] }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_oset: 'onceset' }, [
    ['add', 'my_oset', 1],
    ['rem', 'my_oset', 1],
    ['add', 'my_oset', 2],
    ['add', 'my_oset', 1],
    ['add', 'my_oset', 3],
    ['add', 'my_oset', 2],
    ['add', 'my_oset', 4],
    ['rem', 'my_oset', 3]
  ], (involvesConcurrency) ? true : { my_oset: [2, 4] }, done())
  // if there's concurrency, just make sure it converges (the final state is unpredictable)

  sim.run(numNodes, syncFreq, numSyncs, { my_reg: 'register' }, [
    ['set', 'my_reg', 1],
    ['set', 'my_reg', 1],
    ['set', 'my_reg', 2],
    ['set', 'my_reg', 1],
    ['set', 'my_reg', 3],
    ['set', 'my_reg', 1],
    ['set', 'my_reg', 4],
    ['set', 'my_reg', 1]
  ], (involvesConcurrency) ? true : { my_reg: 1 }, done())
  // if there's concurrency, just make sure it converges (the final state is unpredictable)

  sim.run(numNodes, syncFreq, numSyncs, { my_set: 'set' }, [
    ['add', 'my_set', 1],
    ['add', 'my_set', 1],
    ['add', 'my_set', 2],
    ['add', 'my_set', 1],
    ['add', 'my_set', 3],
    ['add', 'my_set', 1],
    ['add', 'my_set', 4],
    ['add', 'my_set', 1]
  ], { my_set: [1, 2, 3, 4] }, done())

  sim.run(numNodes, syncFreq, numSyncs, { my_set: 'set' }, [
    ['add', 'my_set', 1],
    ['rem', 'my_set', 1],
    ['add', 'my_set', 2],
    ['add', 'my_set', 1],
    ['add', 'my_set', 3],
    ['add', 'my_set', 2],
    ['add', 'my_set', 4],
    ['rem', 'my_set', 3]
  ], (involvesConcurrency) ? true : { my_set: [1, 2, 4] }, done())
  // if there's concurrency, just make sure it converges (the final state is unpredictable)

  done(cb)
}

module.exports = function(opts) {
  var dbs = [
    level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' }),
    level(__dirname + '/db2', { db: memdown, valueEncoding: 'binary' }),
    level(__dirname + '/db3', { db: memdown, valueEncoding: 'binary' })
  ]
  for (var syncFreq=1; syncFreq <= 8; syncFreq++) {
    for (var numSyncs=1; numSyncs <= factorial(2); numSyncs++) {
      (function(syncFreq, numSyncs) {
        tape('sim: numNodes=2, syncFreq='+syncFreq+', numSyncs='+numSyncs, function(t) {
          var sim = tutil.simulator(t, dbs)
          runsims(sim, 2, syncFreq, numSyncs, t.end)
        })
      })(syncFreq, numSyncs)
    }
  }
  tape('sim: numNodes=2, syncFreq=10000, numSyncs=2', function(t) {
    var sim = tutil.simulator(t, dbs)
    runsims(sim, 2, 10000, 2, t.end)
  })
  tape('sim: numNodes=2, syncFreq=10000, numSyncs=1', function(t) {
    var sim = tutil.simulator(t, dbs)
    runsims(sim, 2, 10000, 1, t.end)
  })
  for (var syncFreq=1; syncFreq <= 8; syncFreq++) {
    for (var numSyncs=1; numSyncs <= factorial(3); numSyncs++) {
      (function(syncFreq, numSyncs) {
        tape('sim: numNodes=3, syncFreq='+syncFreq+', numSyncs='+numSyncs, function(t) {
          var sim = tutil.simulator(t, dbs)
          runsims(sim, 3, syncFreq, numSyncs, t.end)
        })
      })(syncFreq, numSyncs)
    }
  }
  tape('sim: numNodes=3, syncFreq=10000, numSyncs=3', function(t) {
    var sim = tutil.simulator(t, dbs)
    runsims(sim, 3, 10000, 3, t.end)
  })
  tape('sim: numNodes=3, syncFreq=10000, numSyncs=2', function(t) {
    var sim = tutil.simulator(t, dbs)
    runsims(sim, 3, 10000, 2, t.end)
  })
  tape('sim: numNodes=3, syncFreq=10000, numSyncs=1', function(t) {
    var sim = tutil.simulator(t, dbs)
    runsims(sim, 3, 10000, 1, t.end)
  })
}

if(!module.parent)
  module.exports({ })
