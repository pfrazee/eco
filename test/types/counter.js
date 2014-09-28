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
  tape('counter - one member', function(t) {
    var db = tutil.makedb()
    var feed = tutil.makefeed()

    // create a new object
    eco.create(db, feed, function(err, obj) {
      if (err) throw err

      // declare
      console.log('obj1 declaring count')
      obj.declare({ count: 'counter' }, function(err, changes) {
        if (err) throw err

        console.log('changes', changes)
        t.equal(feed.msgs.length, 2)
        t.equal(changes.length, 1)
        t.equal(obj.get().count, 0)

        // increment
        console.log('obj1 setting count to 1')
        obj.put({ count: 1 }, function(err, changes) {
          if (err) throw err
          var umsg = msgpack.decode(feed.msgs[2].message)
          console.log('changes', changes)
          console.log('update message', umsg)

          t.equal(feed.msgs.length, 3)
          t.equal(changes.length, 1)
          t.equal(changes[0][0], 'count')
          t.equal(changes[0][1], 0)
          t.equal(changes[0][2], 1)
          t.equal(umsg.path, 'count')
          t.equal(umsg.op, 'inc')
          t.equal(umsg.args[0], 1)
          t.equal(obj.get().count, 1)

          // decrement by 2
          console.log('obj1 setting count to -1')
          obj.put({ count: -1 }, function(err, changes) {
            if (err) throw err
            var umsg = msgpack.decode(feed.msgs[3].message)
            console.log('changes', changes)
            console.log('update message', umsg)

            t.equal(feed.msgs.length, 4)
            t.equal(changes.length, 1)
            t.equal(changes[0][0], 'count')
            t.equal(changes[0][1], 1)
            t.equal(changes[0][2], -1)
            t.equal(umsg.path, 'count')
            t.equal(umsg.op, 'dec')
            t.equal(umsg.args[0], 2)
            t.equal(obj.get().count, -1)

            // increment by 11
            console.log('obj setting count to 10')
            obj.put({ count: 10 }, function(err, changes) {
              if (err) throw err
              var umsg = msgpack.decode(feed.msgs[4].message)
              console.log('changes', changes)
              console.log('update message', umsg)

              t.equal(feed.msgs.length, 5)
              t.equal(changes.length, 1)
              t.equal(changes[0][0], 'count')
              t.equal(changes[0][1], -1)
              t.equal(changes[0][2], 10)
              t.equal(umsg.path, 'count')
              t.equal(umsg.op, 'inc')
              t.equal(umsg.args[0], 11)
              t.equal(obj.get().count, 10)

              db.close(t.end)
            })
          })
        })        
      })
    })
  })
  tape('counter - two members, updated by one user', function(t) {
    var db1 = tutil.makedb()
    var db2 = tutil.makedb()
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring count')
      obj1.declare({ count: 'counter' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.equal(obj1.get().count, 0)

        // increment
        console.log('obj1 setting count to 1')
        obj1.put({ count: 1 }, function(err, changes) {
          if (err) throw err
          var umsg = msgpack.decode(feed1.msgs[2].message)
          console.log('feed1 changes', changes)
          console.log('feed1 update message', umsg)

          t.equal(feed1.msgs.length, 3)
          t.equal(changes.length, 1)
          t.equal(obj1.get().count, 1)

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
              t.equal(feed2.msgs.length, 3)
              t.equal(changes.length, 2)
              t.equal(obj2.get().count, 1)

              // decrement by 2
              console.log('obj1 setting count to -1')
              obj1.put({ count: -1 }, function(err, changes) {
                if (err) throw err
                var umsg = msgpack.decode(feed1.msgs[3].message)
                console.log('feed1 changes', changes)
                console.log('feed1 update message', umsg)

                t.equal(feed1.msgs.length, 4)
                t.equal(changes.length, 1)
                t.equal(obj1.get().count, -1)

                // increment by 11
                console.log('obj1 setting count to 10')
                obj1.put({ count: 10 }, function(err, changes) {
                  if (err) throw err
                  var umsg = msgpack.decode(feed1.msgs[4].message)
                  console.log('feed1 changes', changes)
                  console.log('feed1 update message', umsg)

                  t.equal(feed1.msgs.length, 5)
                  t.equal(changes.length, 1)
                  t.equal(obj1.get().count, 10)

                  // replicate the feeds
                  console.log('replicating feed1 to feed2')
                  feed1.msgs.forEach(feed2.addExisting.bind(feed2))

                  // bring history up to date
                  obj2.applyMessages(feed2.msgs.slice(3), function(err, changes) {
                    if (err) throw err

                    console.log('feed2 changes', changes)
                    t.equal(feed2.msgs.length, 5)
                    t.equal(changes.length, 2)
                    t.equal(obj2.get().count, 10)

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
  tape('counter - two members, updated sequentially by both', function(t) {
    var db1 = tutil.makedb()
    var db2 = tutil.makedb()
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members:[feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring count')
      obj1.declare({ count: 'counter' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.equal(obj1.get().count, 0)

        // increment
        console.log('obj1 setting count to 1')
        obj1.put({ count: 1 }, function(err, changes) {
          if (err) throw err
          var umsg = msgpack.decode(feed1.msgs[2].message)
          console.log('feed1 changes', changes)
          console.log('feed1 update message', umsg)

          t.equal(feed1.msgs.length, 3)
          t.equal(changes.length, 1)
          t.equal(obj1.get().count, 1)

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
              t.equal(feed2.msgs.length, 3)
              t.equal(changes.length, 2)
              t.equal(obj2.get().count, 1)

              // decrement by 2
              console.log('obj2 setting count to -1')
              obj2.put({ count: -1 }, function(err, changes) {
                if (err) throw err
                var umsg = msgpack.decode(feed2.msgs[3].message)
                console.log('feed2 changes', changes)
                console.log('feed2 update message', umsg)

                t.equal(feed2.msgs.length, 4)
                t.equal(changes.length, 1)
                t.equal(obj2.get().count, -1)

                // replicate the feeds
                console.log('replicating feed2 to feed1')
                feed2.msgs.forEach(feed1.addExisting.bind(feed1))

                // bring history up to date
                obj1.applyMessages(feed1.msgs.slice(3), function(err, changes) {
                  if (err) throw err

                  console.log('feed1 changes', changes)
                  t.equal(feed1.msgs.length, 4)
                  t.equal(changes.length, 1)
                  t.equal(obj1.get().count, -1)

                  // increment by 11
                  console.log('obj1 setting count to 10')
                  obj1.put({ count: 10 }, function(err, changes) {
                    if (err) throw err
                    var umsg = msgpack.decode(feed1.msgs[4].message)
                    console.log('feed1 changes', changes)
                    console.log('feed1 update message', umsg)

                    t.equal(feed1.msgs.length, 5)
                    t.equal(changes.length, 1)
                    t.equal(obj1.get().count, 10)

                    // replicate the feeds
                    console.log('replicating feed1 to feed2')
                    feed1.msgs.forEach(feed2.addExisting.bind(feed2))

                    // bring history up to date
                    obj2.applyMessages(feed2.msgs.slice(4), function(err, changes) {
                      if (err) throw err

                      console.log('feed2 changes', changes)
                      t.equal(feed2.msgs.length, 5)
                      t.equal(changes.length, 1)
                      t.equal(obj2.get().count, 10)

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
  tape('counter - two members, updated concurrently by both', function(t) {
    var db1 = tutil.makedb()
    var db2 = tutil.makedb()
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members:[feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring count')
      obj1.declare({ count: 'counter' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.equal(obj1.get().count, 0)

        // increment
        console.log('obj1 setting count to 1')
        obj1.put({ count: 1 }, function(err, changes) {
          if (err) throw err
          var umsg = msgpack.decode(feed1.msgs[2].message)
          console.log('feed1 changes', changes)
          console.log('feed1 update message', umsg)

          t.equal(feed1.msgs.length, 3)
          t.equal(changes.length, 1)
          t.equal(obj1.get().count, 1)

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
              t.equal(feed2.msgs.length, 3)
              t.equal(changes.length, 2)
              t.equal(obj2.get().count, 1)

              // decrement by 2
              console.log('obj2 setting count to -1')
              obj2.put({ count: -1 }, function(err, changes) {
                if (err) throw err
                var umsg = msgpack.decode(feed2.msgs[3].message)
                console.log('feed2 changes', changes)
                console.log('feed2 update message', umsg)

                t.equal(feed2.msgs.length, 4)
                t.equal(changes.length, 1)
                t.equal(obj2.get().count, -1)

                // increment by 9
                console.log('obj1 setting count to 10')
                obj1.put({ count: 10 }, function(err, changes) {
                  if (err) throw err
                  var umsg = msgpack.decode(feed1.msgs[3].message)
                  console.log('feed1 changes', changes)
                  console.log('feed1 update message', umsg)

                  t.equal(feed1.msgs.length, 4)
                  t.equal(changes.length, 1)
                  t.equal(obj1.get().count, 10)

                  // replicate the feeds
                  console.log('replicating feed1 to feed2')
                  feed1.msgs.forEach(feed2.addExisting.bind(feed2))
                  console.log('replicating feed2 to feed1')
                  feed2.msgs.forEach(feed1.addExisting.bind(feed1))

                  // bring feed1 history up to date
                  obj1.applyMessages(feed1.msgs.slice(4), function(err, changes) {
                    if (err) throw err

                    console.log('feed1 changes', changes)
                    t.equal(feed1.msgs.length, 5)
                    t.equal(changes.length, 1)
                    t.equal(obj1.get().count, 8)

                    // bring feed2 history up to date
                    obj2.applyMessages(feed2.msgs.slice(4), function(err, changes) {
                      if (err) throw err

                      console.log('feed2 changes', changes)
                      t.equal(feed2.msgs.length, 5)
                      t.equal(changes.length, 1)
                      t.equal(obj2.get().count, 8)

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
