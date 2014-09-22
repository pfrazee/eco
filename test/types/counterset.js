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
  tape('counterset - one member', function(t) {
    var db = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var feed = tutil.makefeed()

    // create a new object
    eco.create(db, feed, function(err, obj) {
      if (err) throw err

      // declare
      console.log('obj1 declaring counts')
      obj.declare({ counts: 'counterset' }, function(err, changes) {
        if (err) throw err

        console.log('changes', changes)
        t.equal(feed.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj.get().counts, {}))

        // change by {a: +1, b: 0, c: -1}
        console.log('obj1 setting counts to {a: 1, b: 0, c: -1}')
        obj.put({ counts: { a: 1, b: 0, c: -1 } }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed.msgs[2].message)
          var umsg2 = msgpack.decode(feed.msgs[3].message)
          var umsg3 = msgpack.decode(feed.msgs[4].message)
          console.log('changes', changes)
          console.log('update message 1', umsg1)
          console.log('update message 2', umsg2)
          console.log('update message 3', umsg3)

          t.equal(feed.msgs.length, 5)
          t.equal(changes.length, 3)
          t.equal(changes[0][0], 'counts')
          t.equal(changes[0][1][0], 'a')
          t.equal(changes[0][1][1], 0)
          t.equal(changes[0][2][0], 'a')
          t.equal(changes[0][2][1], 1)
          t.equal(changes[1][0], 'counts')
          t.equal(changes[1][1][0], 'b')
          t.equal(changes[1][1][1], 0)
          t.equal(changes[1][2][0], 'b')
          t.equal(changes[1][2][1], 0)
          t.equal(changes[2][1][0], 'c')
          t.equal(changes[2][1][1], 0)
          t.equal(changes[2][2][0], 'c')
          t.equal(changes[2][2][1], -1)
          t.equal(umsg1.path, 'counts')
          t.equal(umsg1.op, 'inc')
          t.equal(umsg1.args[0], 'a')
          t.equal(umsg1.args[1], 1)
          t.equal(umsg2.path, 'counts')
          t.equal(umsg2.op, 'inc')
          t.equal(umsg2.args[0], 'b')
          t.equal(umsg2.args[1], 0)
          t.equal(umsg3.path, 'counts')
          t.equal(umsg3.op, 'dec')
          t.equal(umsg3.args[0], 'c')
          t.equal(umsg3.args[1], 1)
          t.assert(equal(obj.get().counts, {a:1,b:0,c:-1}))

          // change by { a: -5, b: +10, c: +1, d: 100 }
          console.log('obj1 setting counts to { a: -4, b: 10, c: 0, d: 100 }')
          obj.put({ counts: { a: -4, b: 10, c: 0, d: 100 } }, function(err, changes) {
            if (err) throw err
            var umsg1 = msgpack.decode(feed.msgs[5].message)
            var umsg2 = msgpack.decode(feed.msgs[6].message)
            var umsg3 = msgpack.decode(feed.msgs[7].message)
            var umsg4 = msgpack.decode(feed.msgs[8].message)
            console.log('changes', changes)
            console.log('update message 1', umsg1)
            console.log('update message 2', umsg2)
            console.log('update message 3', umsg3)
            console.log('update message 4', umsg4)

            t.equal(feed.msgs.length, 9)
            t.equal(changes.length, 4)
            t.equal(changes[0][0], 'counts')
            t.equal(changes[0][1][0], 'a')
            t.equal(changes[0][1][1], 1)
            t.equal(changes[0][2][0], 'a')
            t.equal(changes[0][2][1], -4)
            t.equal(changes[1][0], 'counts')
            t.equal(changes[1][1][0], 'b')
            t.equal(changes[1][1][1], 0)
            t.equal(changes[1][2][0], 'b')
            t.equal(changes[1][2][1], 10)
            t.equal(changes[2][0], 'counts')
            t.equal(changes[2][1][0], 'c')
            t.equal(changes[2][1][1], -1)
            t.equal(changes[2][2][0], 'c')
            t.equal(changes[2][2][1], 0)
            t.equal(changes[3][0], 'counts')
            t.equal(changes[3][1][0], 'd')
            t.equal(changes[3][1][1], 0)
            t.equal(changes[3][2][0], 'd')
            t.equal(changes[3][2][1], 100)
            t.equal(umsg1.path, 'counts')
            t.equal(umsg1.op, 'dec')
            t.equal(umsg1.args[0], 'a')
            t.equal(umsg1.args[1], 5)
            t.equal(umsg2.path, 'counts')
            t.equal(umsg2.op, 'inc')
            t.equal(umsg2.args[0], 'b')
            t.equal(umsg2.args[1], 10)
            t.equal(umsg3.path, 'counts')
            t.equal(umsg3.op, 'inc')
            t.equal(umsg3.args[0], 'c')
            t.equal(umsg3.args[1], 1)
            t.equal(umsg4.path, 'counts')
            t.equal(umsg4.op, 'inc')
            t.equal(umsg4.args[0], 'd')
            t.equal(umsg4.args[1], 100)
            t.assert(equal(obj.get().counts, {a:-4,b:10,c:0,d:100}))

            db.close(t.end)
          })
        })        
      })
    })
  })
  tape('counterset - two members, updated by one user', function(t) {
    var db1 = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/../db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring counts')
      obj1.declare({ counts: 'counterset' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj1.get().counts, {}))

        // change by {a: +1, b: 0, c: -1}
        console.log('obj1 setting counts to {a: 1, b: 0, c: -1}')
        obj1.put({ counts: { a: 1, b: 0, c: -1 } }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed1.msgs[2].message)
          var umsg2 = msgpack.decode(feed1.msgs[3].message)
          var umsg3 = msgpack.decode(feed1.msgs[4].message)
          console.log('changes', changes)
          console.log('update message 1', umsg1)
          console.log('update message 2', umsg2)
          console.log('update message 3', umsg3)

          t.equal(feed1.msgs.length, 5)
          t.equal(changes.length, 3)
          t.assert(equal(obj1.get().counts, {a:1,b:0,c:-1}))

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
              t.assert(equal(obj2.get().counts, {a:1,b:0,c:-1}))

              // change by { a: -5, b: +10, c: +1, d: 100 }
              console.log('obj1 setting counts to { a: -4, b: 10, c: 0, d: 100 }')
              obj1.put({ counts: { a: -4, b: 10, c: 0, d: 100 } }, function(err, changes) {
                if (err) throw err
                var umsg1 = msgpack.decode(feed1.msgs[5].message)
                var umsg2 = msgpack.decode(feed1.msgs[6].message)
                var umsg3 = msgpack.decode(feed1.msgs[7].message)
                var umsg4 = msgpack.decode(feed1.msgs[8].message)
                console.log('changes', changes)
                console.log('update message 1', umsg1)
                console.log('update message 2', umsg2)
                console.log('update message 3', umsg3)
                console.log('update message 4', umsg4)

                t.equal(feed1.msgs.length, 9)
                t.equal(changes.length, 4)
                t.assert(equal(obj1.get().counts, {a:-4,b:10,c:0,d:100}))

                // replicate the feeds
                console.log('replicating feed1 to feed2')
                feed1.msgs.forEach(feed2.addExisting.bind(feed2))

                // bring history up to date
                obj2.applyMessages(feed2.msgs.slice(5), function(err, changes) {
                  if (err) throw err

                  console.log('feed2 changes', changes)
                  t.equal(feed1.msgs.length, 9)
                  t.equal(changes.length, 4)
                  t.assert(equal(obj2.get().counts, {a:-4,b:10,c:0,d:100}))

                  db1.close(function() { db2.close(t.end) })
                })
              })
            })        
          })
        })
      })
    })
  })
  tape('counterset - two members, updated sequentially by both', function(t) {
    var db1 = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/../db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members: [feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring counts')
      obj1.declare({ counts: 'counterset' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj1.get().counts, {}))

        // change by {a: +1, b: 0, c: -1}
        console.log('obj1 setting counts to {a: 1, b: 0, c: -1}')
        obj1.put({ counts: { a: 1, b: 0, c: -1 } }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed1.msgs[2].message)
          var umsg2 = msgpack.decode(feed1.msgs[3].message)
          var umsg3 = msgpack.decode(feed1.msgs[4].message)
          console.log('changes', changes)
          console.log('update message 1', umsg1)
          console.log('update message 2', umsg2)
          console.log('update message 3', umsg3)

          t.equal(feed1.msgs.length, 5)
          t.equal(changes.length, 3)
          t.assert(equal(obj1.get().counts, {a:1,b:0,c:-1}))

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
              t.assert(equal(obj2.get().counts, {a:1,b:0,c:-1}))

              // change by { a: -5, b: +10, c: +1, d: 100 }
              console.log('obj2 setting counts to { a: -4, b: 10, c: 0, d: 100 }')
              obj2.put({ counts: { a: -4, b: 10, c: 0, d: 100 } }, function(err, changes) {
                if (err) throw err
                var umsg1 = msgpack.decode(feed2.msgs[5].message)
                var umsg2 = msgpack.decode(feed2.msgs[6].message)
                var umsg3 = msgpack.decode(feed2.msgs[7].message)
                var umsg4 = msgpack.decode(feed2.msgs[8].message)
                console.log('changes', changes)
                console.log('update message 1', umsg1)
                console.log('update message 2', umsg2)
                console.log('update message 3', umsg3)
                console.log('update message 4', umsg4)

                t.equal(feed2.msgs.length, 9)
                t.equal(changes.length, 4)
                t.assert(equal(obj2.get().counts, {a:-4,b:10,c:0,d:100}))

                // replicate the feeds
                console.log('replicating feed2 to feed1')
                feed2.msgs.forEach(feed1.addExisting.bind(feed1))

                // bring history up to date
                obj1.applyMessages(feed1.msgs.slice(5), function(err, changes) {
                  if (err) throw err

                  console.log('feed1 changes', changes)
                  t.equal(feed1.msgs.length, 9)
                  t.equal(changes.length, 4)
                  t.assert(equal(obj1.get().counts, {a:-4,b:10,c:0,d:100}))

                  db1.close(function() { db2.close(t.end) })
                })
              })
            })        
          })
        })
      })
    })
  })
  tape('counterset - two members, updated concurrently by both', function(t) {
    var db1 = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/../db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members: [feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring counts')
      obj1.declare({ counts: 'counterset' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj1.get().counts, {}))

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
            t.equal(feed2.msgs.length, 2)
            t.equal(changes.length, 1)
            t.assert(equal(obj2.get().counts, {}))

            // change by {a: +1, b: 0, c: -1}
            console.log('obj1 setting counts to {a: 1, b: 0, c: -1}')
            obj1.put({ counts: { a: 1, b: 0, c: -1 } }, function(err, changes) {
              if (err) throw err
              var umsg1 = msgpack.decode(feed1.msgs[2].message)
              var umsg2 = msgpack.decode(feed1.msgs[3].message)
              var umsg3 = msgpack.decode(feed1.msgs[4].message)
              console.log('changes', changes)
              console.log('update message 1', umsg1)
              console.log('update message 2', umsg2)
              console.log('update message 3', umsg3)

              t.equal(feed1.msgs.length, 5)
              t.equal(changes.length, 3)
              t.assert(equal(obj1.get().counts, {a:1,b:0,c:-1}))

              // change by { a: -5, b: +10, c: +1, d: 100 }
              console.log('obj2 setting counts to { a: -4, b: 10, c: 0, d: 100 }')
              obj2.put({ counts: { a: -4, b: 10, c: 0, d: 100 } }, function(err, changes) {
                if (err) throw err
                var umsg1 = msgpack.decode(feed2.msgs[2].message)
                var umsg2 = msgpack.decode(feed2.msgs[3].message)
                var umsg3 = msgpack.decode(feed2.msgs[4].message)
                var umsg4 = msgpack.decode(feed2.msgs[5].message)
                console.log('changes', changes)
                console.log('update message 1', umsg1)
                console.log('update message 2', umsg2)
                console.log('update message 3', umsg3)
                console.log('update message 4', umsg4)

                t.equal(feed2.msgs.length, 6)
                t.equal(changes.length, 4)
                t.assert(equal(obj2.get().counts, {a:-4,b:10,c:0,d:100}))

                // replicate the feeds
                console.log('replicating feed1 to feed2')
                feed1.msgs.forEach(feed2.addExisting.bind(feed2))
                console.log('replicating feed2 to feed1')
                feed2.msgs.forEach(feed1.addExisting.bind(feed1))

                // bring history up to date
                obj1.applyMessages(feed1.msgs.slice(5), function(err, changes) {
                  if (err) throw err

                  console.log('feed1 changes', changes)
                  t.equal(feed1.msgs.length, 9)
                  t.equal(changes.length, 4)
                  t.assert(equal(obj1.get().counts, {a:-3,b:10,c:-1,d:100}))

                  // bring history up to date
                  obj2.applyMessages(feed2.msgs.slice(6), function(err, changes) {
                    if (err) throw err

                    console.log('feed2 changes', changes)
                    t.equal(feed2.msgs.length, 9)
                    t.equal(changes.length, 3)
                    t.assert(equal(obj2.get().counts, {a:-3,b:10,c:-1,d:100}))

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
}

if(!module.parent)
  module.exports({ })
