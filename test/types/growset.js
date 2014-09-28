'use strict'
var tape = require('tape')
var equal = require('deep-equal')
var level = require('level')
var sublevel = require('level-sublevel')
var memdown = require('memdown')
var msgpack = require('msgpack-js')
var eco = require('../../lib')
var tutil = require('../test-utils')

module.exports = function(opts) {
  tape('growset - one member', function(t) {
    var db = tutil.makedb()
    var feed = tutil.makefeed()

    // create a new object
    eco.create(db, feed, function(err, obj) {
      if (err) throw err

      // declare
      console.log('obj1 declaring gset')
      obj.declare({ gset: 'growset' }, function(err, changes) {
        if (err) throw err

        console.log('changes', changes)
        t.equal(feed.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj.get().gset, []))

        // add 'a', 1, true
        console.log('obj1 setting gset to ["a", 1, true]')
        obj.put({ gset: ['a', 1, true] }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed.msgs[2].message)
          var umsg2 = msgpack.decode(feed.msgs[3].message)
          var umsg3 = msgpack.decode(feed.msgs[4].message)
          console.log('obj1', obj.get().gset)
          console.log('changes', changes)
          console.log('update message 1', umsg1)
          console.log('update message 2', umsg2)
          console.log('update message 3', umsg3)

          t.equal(feed.msgs.length, 5)
          t.equal(changes.length, 3)
          t.equal(changes[0][0], 'gset')
          t.equal(changes[0][1], void 0)
          t.equal(changes[0][2], 'a')
          t.equal(changes[1][0], 'gset')
          t.equal(changes[1][1], void 0)
          t.equal(changes[1][2], 1)
          t.equal(changes[2][0], 'gset')
          t.equal(changes[2][1], void 0)
          t.equal(changes[2][2], true)
          t.equal(umsg1.path, 'gset')
          t.equal(umsg1.op, 'add')
          t.equal(umsg1.args[0], 'a')
          t.equal(umsg2.path, 'gset')
          t.equal(umsg2.op, 'add')
          t.equal(umsg2.args[0], 1)
          t.equal(umsg3.path, 'gset')
          t.equal(umsg3.op, 'add')
          t.equal(umsg3.args[0], true)
          t.assert(equal(obj.get().gset, ['a', 1, true]))

          // add 0, 'aa'
          console.log('obj1 setting gset to ["a", "aa", 0, true]')
          obj.put({ gset: ['a', 'aa', 0, true] }, function(err, changes) { // note, the 1 value is not included, but not lost
            if (err) throw err
            var umsg1 = msgpack.decode(feed.msgs[5].message)
            var umsg2 = msgpack.decode(feed.msgs[6].message)
            console.log('obj1', obj.get().gset)
            console.log('changes', changes)
            console.log('update message 1', umsg1)
            console.log('update message 2', umsg2)

            t.equal(feed.msgs.length, 7)
            t.equal(changes.length, 2)
            t.equal(changes[0][0], 'gset')
            t.equal(changes[0][1], undefined)
            t.equal(changes[0][2], 'aa')
            t.equal(changes[1][0], 'gset')
            t.equal(changes[1][1], undefined)
            t.equal(changes[1][2], 0)
            t.equal(umsg1.path, 'gset')
            t.equal(umsg1.op, 'add')
            t.equal(umsg1.args[0], 'aa')
            t.equal(umsg2.path, 'gset')
            t.equal(umsg2.op, 'add')
            t.equal(umsg2.args[0], 0)
            t.assert(equal(obj.get().gset, ['a', 1, true, 'aa', 0]))

            db.close(t.end)
          })
        })        
      })
    })
  })
  tape('growset - two members, updated concurrently by both', function(t) {
    var db1 = tutil.makedb()
    var db2 = tutil.makedb()
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members:[feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring gset')
      obj1.declare({ gset: 'growset' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj1.get().gset, []))

        // increment
        console.log('obj1 setting gset to ["a", 1, true]')
        obj1.put({ gset: ['a', 1, true] }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed1.msgs[2].message)
          var umsg2 = msgpack.decode(feed1.msgs[3].message)
          var umsg3 = msgpack.decode(feed1.msgs[4].message)
          console.log('obj1', obj1.get().gset)
          console.log('changes', changes)
          console.log('update message 1', umsg1)
          console.log('update message 2', umsg2)
          console.log('update message 3', umsg3)

          t.equal(feed1.msgs.length, 5)
          t.equal(changes.length, 3)
          t.assert(equal(obj1.get().gset, ['a', 1, true]))

          // replicate the feeds
          console.log('replicating feed1 to feed2')
          feed1.msgs.forEach(feed2.addExisting.bind(feed2))

          // recreate the object
          eco.open(db2, feed2, obj1.getId(), function(err, obj2) {
            if (err) throw err

            // bring history up to date
            obj2.applyMessages(feed2.msgs.slice(1), function(err, changes) {
              if (err) throw err

              console.log('feed2 changes', changes)
              t.equal(feed2.msgs.length, 5)
              t.equal(changes.length, 4)
              t.assert(equal(obj2.get().gset, ['a', 1, true]))

              // add false, 2, 3
              console.log('obj2 setting gset to ["a", 1, true, false, 2, 3]')
              obj2.put({ gset: ['a', 1, true, false, 2, 3] }, function(err, changes) {
                if (err) throw err
                var umsg1 = msgpack.decode(feed2.msgs[5].message)
                var umsg2 = msgpack.decode(feed2.msgs[6].message)
                var umsg3 = msgpack.decode(feed2.msgs[7].message)
                console.log('obj2', obj2.get())
                console.log('feed2 changes', changes)
                console.log('feed2 update message 1', umsg1)
                console.log('feed2 update message 2', umsg2)
                console.log('feed2 update message 3', umsg3)

                t.equal(feed2.msgs.length, 8)
                t.equal(changes.length, 3)
                t.assert(equal(obj2.get().gset, ['a', 1, true, false, 2, 3]))

                // add false, 2, 4
                console.log('obj1 setting gset to [false, 2, 4]')
                obj1.put({ gset: [false, 2, 4] }, function(err, changes) { // note, failed to include previous adds, wont lose them
                  if (err) throw err
                  var umsg1 = msgpack.decode(feed1.msgs[5].message)
                  var umsg2 = msgpack.decode(feed1.msgs[6].message)
                  var umsg3 = msgpack.decode(feed1.msgs[7].message)
                  console.log('obj1', obj1.get())
                  console.log('feed1 changes', changes)
                  console.log('feed1 update message 1', umsg1)
                  console.log('feed1 update message 2', umsg2)
                  console.log('feed1 update message 3', umsg3)

                  t.equal(feed1.msgs.length, 8)
                  t.equal(changes.length, 3)
                  t.assert(equal(obj1.get().gset, ['a', 1, true, false, 2, 4]))

                  // replicate the feeds
                  console.log('replicating feed1 to feed2')
                  feed1.msgs.forEach(feed2.addExisting.bind(feed2))
                  console.log('replicating feed2 to feed1')
                  feed2.msgs.forEach(feed1.addExisting.bind(feed1))

                  // bring feed1 history up to date
                  obj1.applyMessages(feed1.msgs.slice(8), function(err, changes) {
                    if (err) throw err

                    console.log('obj1', obj1.get())
                    console.log('feed1 changes', changes)
                    t.equal(feed1.msgs.length, 11)
                    t.equal(changes.length, 1)
                    t.assert(equal(obj1.get().gset, ['a', 1, true, false, 2, 4, 3]))

                    // bring feed2 history up to date
                    obj2.applyMessages(feed2.msgs.slice(8), function(err, changes) {
                      if (err) throw err

                      console.log('obj2', obj2.get())
                      console.log('feed2 changes', changes)
                      t.equal(feed2.msgs.length, 11)
                      t.equal(changes.length, 1)
                      t.assert(equal(obj2.get().gset, ['a', 1, true, false, 2, 3, 4]))

                      db1.close(function() { db2.close(t.end) })
                    })
                  })
                })
              })
            })        
          })
        })
      })
    })
  })
}

if(!module.parent)
  module.exports({ })
