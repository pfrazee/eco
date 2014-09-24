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
  tape('map - one member', function(t) {
    var db = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var feed = tutil.makefeed()

    // create a new object
    eco.create(db, feed, function(err, obj) {
      if (err) throw err

      // declare
      console.log('obj1 declaring ormap')
      obj.declare({ ormap: 'map' }, function(err, changes) {
        if (err) throw err

        console.log('changes', changes)
        t.equal(feed.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj.get().ormap, {}))

        // set {a: 1, foo: false, x: 'aaa'}
        console.log('obj1 setting ormap to {a: 1, foo: false, x: "aaa"}')
        obj.put({ ormap: {a: 1, foo: false, x: 'aaa'} }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed.msgs[2].message)
          var umsg2 = msgpack.decode(feed.msgs[3].message)
          var umsg3 = msgpack.decode(feed.msgs[4].message)
          console.log('obj1', obj.get())
          console.log('changes', changes)
          console.log('update message 1', umsg1)
          console.log('update message 2', umsg2)
          console.log('update message 3', umsg3)

          t.equal(feed.msgs.length, 5)
          t.equal(changes.length, 3)
          t.equal(changes[0][0], 'ormap')
          t.equal(changes[0][1][0], 'a')
          t.equal(changes[0][1][1], void 0)
          t.equal(changes[0][2][0], 'a')
          t.equal(changes[0][2][1], 1)
          t.equal(changes[1][0], 'ormap')
          t.equal(changes[1][1][0], 'foo')
          t.equal(changes[1][1][1], void 0)
          t.equal(changes[1][2][0], 'foo')
          t.equal(changes[1][2][1], false)
          t.equal(changes[2][0], 'ormap')
          t.equal(changes[2][1][0], 'x')
          t.equal(changes[2][1][1], void 0)
          t.equal(changes[2][2][0], 'x')
          t.equal(changes[2][2][1], 'aaa')
          t.equal(umsg1.path, 'ormap')
          t.equal(umsg1.op, 'set')
          t.equal(umsg1.args[0], 'a')
          t.equal(umsg1.args[1], 1)
          t.equal(typeof umsg1.args[2], 'string')
          t.assert(equal(umsg1.args[3], []))
          t.equal(umsg2.path, 'ormap')
          t.equal(umsg2.op, 'set')
          t.equal(umsg2.args[0], 'foo')
          t.equal(umsg2.args[1], false)
          t.equal(typeof umsg2.args[2], 'string')
          t.assert(equal(umsg2.args[3], []))
          t.equal(umsg3.path, 'ormap')
          t.equal(umsg3.op, 'set')
          t.equal(umsg3.args[0], 'x')
          t.equal(umsg3.args[1], 'aaa')
          t.equal(typeof umsg3.args[2], 'string')
          t.assert(equal(umsg3.args[3], []))
          t.assert(equal(obj.get().ormap, {a: 1, foo: false, x: 'aaa'}))

          // add {b: 2, baz: true}, remove {foo:}, update {x: 'bbb'}
          console.log('obj1 setting ormap to {a: 1, b: 2, baz: true, x: "bbb"}')
          obj.put({ ormap: { a: 1, b: 2, baz: true, x: 'bbb' } }, function(err, changes) {
            if (err) throw err
            var umsg1 = msgpack.decode(feed.msgs[5].message)
            var umsg2 = msgpack.decode(feed.msgs[6].message)
            var umsg3 = msgpack.decode(feed.msgs[7].message)
            var umsg4 = msgpack.decode(feed.msgs[8].message)
            console.log('obj1', obj.get())
            console.log('changes', changes)
            console.log('update message 1', umsg1)
            console.log('update message 2', umsg2)
            console.log('update message 3', umsg3)
            console.log('update message 4', umsg4)

            t.equal(feed.msgs.length, 9)
            t.equal(changes.length, 4)
            t.equal(changes[0][0], 'ormap')
            t.equal(changes[0][1][0], 'b')
            t.equal(changes[0][1][1], void 0)
            t.equal(changes[0][2][0], 'b')
            t.equal(changes[0][2][1], 2)
            t.equal(changes[1][0], 'ormap')
            t.equal(changes[1][1][0], 'baz')
            t.equal(changes[1][1][1], void 0)
            t.equal(changes[1][2][0], 'baz')
            t.equal(changes[1][2][1], true)
            t.equal(changes[2][0], 'ormap')
            t.equal(changes[2][1][0], 'x')
            t.equal(changes[2][1][1], 'aaa')
            t.equal(changes[2][2][0], 'x')
            t.equal(changes[2][2][1], 'bbb')
            t.equal(changes[3][0], 'ormap')
            t.equal(changes[3][1][0], 'foo')
            t.equal(changes[3][1][1], false)
            t.equal(changes[3][2][0], 'foo')
            t.equal(changes[3][2][1], void 0)
            t.equal(umsg1.path, 'ormap')
            t.equal(umsg1.op, 'set')
            t.equal(umsg1.args[0], 'b')
            t.equal(umsg1.args[1], 2)
            t.equal(typeof umsg1.args[2], 'string')
            t.assert(equal(umsg1.args[3], []))
            t.equal(umsg2.path, 'ormap')
            t.equal(umsg2.op, 'set')
            t.equal(umsg2.args[0], 'baz')
            t.equal(umsg2.args[1], true)
            t.equal(typeof umsg2.args[2], 'string')
            t.assert(equal(umsg2.args[3], []))
            t.equal(umsg3.path, 'ormap')
            t.equal(umsg3.op, 'set')
            t.equal(umsg3.args[0], 'x')
            t.equal(umsg3.args[1], 'bbb')
            t.equal(typeof umsg3.args[2], 'string')
            t.equal(umsg3.args[3].length, 1)
            t.equal(umsg4.path, 'ormap')
            t.equal(umsg4.op, 'set')
            t.equal(umsg4.args[0], 'foo')
            t.equal(umsg4.args[1], undefined)
            t.equal(typeof umsg4.args[2], 'string')
            t.equal(umsg4.args[3].length, 1)
            t.assert(equal(obj.get().ormap, { a: 1, b: 2, baz: true, x: 'bbb' }))

            // re-set foo to 123
            console.log('obj1 setting ormap to { a: 1, b: 2, baz: true, x: "bbb", foo: 123 }')
            obj.put({ ormap: { a: 1, b: 2, baz: true, x: "bbb", foo: 123 } }, function(err, changes) {
              if (err) throw err
              t.equal(changes.length, 1)
              t.assert(equal(obj.get().ormap, { a: 1, b: 2, baz: true, x: "bbb", foo: 123 }))
              db.close(t.end)
            })
          })
        })        
      })
    })
  })
  tape('map - two members, updated concurrently by both', function(t) {
    var db1 = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/../db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members:[feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring ormap')
      obj1.declare({ ormap: 'map' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj1.get().ormap, []))

        // set {a: 1, foo: false, x: 'aaa'}
        console.log('obj1 setting ormap to {a: 1, foo: false, x: "aaa"}')
        obj1.put({ ormap: {a: 1, foo: false, x: 'aaa'} }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed1.msgs[2].message)
          var umsg2 = msgpack.decode(feed1.msgs[3].message)
          var umsg3 = msgpack.decode(feed1.msgs[4].message)
          console.log('obj1', obj1.get())
          console.log('changes', changes)
          console.log('feed1 update message 1', umsg1)
          console.log('feed1 update message 2', umsg2)
          console.log('feed1 update message 3', umsg3)

          t.equal(feed1.msgs.length, 5)
          t.equal(changes.length, 3)
          t.assert(equal(obj1.get().ormap, {a: 1, foo: false, x: 'aaa'}))

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
              t.assert(equal(obj2.get().ormap, {a: 1, foo: false, x: 'aaa'}))

              // add {b: 2, baz: true}, remove {foo:}, update {x: 'bbb'}
              console.log('obj2 setting ormap to {a: 1, b: 2, baz: true, x: "bbb"}')
              obj2.put({ ormap: { a: 1, b: 2, baz: true, x: 'bbb' } }, function(err, changes) {
                if (err) throw err
                var umsg1 = msgpack.decode(feed2.msgs[5].message)
                var umsg2 = msgpack.decode(feed2.msgs[6].message)
                var umsg3 = msgpack.decode(feed2.msgs[7].message)
                var umsg4 = msgpack.decode(feed2.msgs[8].message)
                console.log('obj2', obj2.get())
                console.log('changes', changes)
                console.log('feed2 update message 1', umsg1)
                console.log('feed2 update message 2', umsg2)
                console.log('feed2 update message 3', umsg3)
                console.log('feed2 update message 4', umsg3)

                t.equal(feed2.msgs.length, 9)
                t.equal(changes.length, 4)
                t.assert(equal(obj2.get().ormap, { a: 1, b: 2, baz: true, x: 'bbb' }))

                // add {b: 3, c: 4}, remove {a:, x:}
                console.log('obj1 setting ormap to {foo: false, b: 3, c: 4}')
                obj1.put({ ormap: { foo: false, b: 3, c: 4 } }, function(err, changes) {
                  if (err) throw err
                  var umsg1 = msgpack.decode(feed1.msgs[5].message)
                  var umsg2 = msgpack.decode(feed1.msgs[6].message)
                  var umsg3 = msgpack.decode(feed1.msgs[7].message)
                  var umsg4 = msgpack.decode(feed1.msgs[8].message)
                  console.log('obj1', obj1.get())
                  console.log('changes', changes)
                  console.log('feed1 update message 1', umsg1)
                  console.log('feed1 update message 2', umsg2)
                  console.log('feed1 update message 3', umsg3)
                  console.log('feed1 update message 4', umsg3)

                  t.equal(feed1.msgs.length, 9)
                  t.equal(changes.length, 4)
                  t.assert(equal(obj1.get().ormap, { foo: false, b: 3, c: 4 }))

                  // replicate the feeds
                  console.log('replicating feed1 to feed2')
                  feed1.msgs.forEach(feed2.addExisting.bind(feed2))
                  console.log('replicating feed2 to feed1')
                  feed2.msgs.forEach(feed1.addExisting.bind(feed1))

                  // bring feed1 history up to date
                  obj1.applyMessages(feed1.msgs.slice(9), function(err, changes) {
                    if (err) throw err

                    console.log('obj1', obj1.get())
                    console.log('feed1 changes', changes)

                    // bring feed2 history up to date
                    obj2.applyMessages(feed2.msgs.slice(9), function(err, changes) {
                      if (err) throw err

                      console.log('obj2', obj2.get())
                      console.log('feed2 changes', changes)
                      t.assert(equal(obj1.get().ormap, obj2.get().ormap))

                      // remove all but baz: true
                      console.log('obj1 setting ormap to { baz: true }')
                      obj1.put({ ormap: { baz: true } }, function(err, changes) {
                        if (err) throw err

                        console.log('obj1', obj1.get())
                        console.log('feed1 changes', changes)
                        t.assert(equal(obj1.get().ormap, { baz: true }))

                        // replicate the feeds
                        console.log('replicating feed1 to feed2')
                        feed1.msgs.forEach(feed2.addExisting.bind(feed2))

                        // bring feed2 history up to date
                        obj2.applyMessages(feed2.msgs.slice(12), function(err, changes) {
                          if (err) throw err

                          console.log('obj2', obj2.get())
                          console.log('feed2 changes', changes)
                          t.assert(equal(obj2.get().ormap, { baz: true }))

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
    })
  })
}

if(!module.parent)
  module.exports({ })
