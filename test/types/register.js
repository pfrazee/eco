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
  tape('register - one member', function(t) {
    var db = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var feed = tutil.makefeed()

    // create a new object
    eco.create(db, feed, function(err, obj) {
      if (err) throw err

      // declare
      console.log('obj1 declaring reg')
      obj.declare({ reg: 'register' }, function(err, changes) {
        if (err) throw err

        console.log('changes', changes)
        t.equal(feed.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj.get().reg, null))

        // set to 'foo'
        console.log('obj1 setting reg to "foo"')
        obj.put({ reg: 'foo' }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed.msgs[2].message)
          console.log('obj1', obj.get())
          console.log('changes', changes)
          console.log('update message 1', umsg1)

          t.equal(feed.msgs.length, 3)
          t.equal(changes.length, 1)
          t.equal(changes[0][0], 'reg')
          t.equal(changes[0][1], null)
          t.equal(changes[0][2], 'foo')
          t.equal(umsg1.path, 'reg')
          t.equal(umsg1.op, 'set')
          t.equal(umsg1.args[0], 'foo')
          t.assert(equal(obj.get().reg, 'foo'))

          // set to false
          console.log('obj1 setting reg to false')
          obj.put({ reg: false }, function(err, changes) {
            if (err) throw err
            var umsg1 = msgpack.decode(feed.msgs[3].message)
            console.log('obj1', obj.get())
            console.log('changes', changes)
            console.log('update message 1', umsg1)

            t.equal(feed.msgs.length, 4)
            t.equal(changes.length, 1)
            t.equal(changes[0][0], 'reg')
            t.equal(changes[0][1], 'foo')
            t.equal(changes[0][2], false)
            t.equal(umsg1.path, 'reg')
            t.equal(umsg1.op, 'set')
            t.equal(umsg1.args[0], false)
            t.assert(equal(obj.get().reg, false))

            // try to set again to false
            obj.put({ reg: false }, function(err, changes) {
              if (err) throw err
              t.equal(changes.length, 0)
              t.assert(equal(obj.get().reg, false))

              // finally, set to zero
              obj.put({ reg: 0 }, function(err, changes) {
                if (err) throw err
                t.equal(changes.length, 1)
                t.assert(equal(obj.get().reg, 0))
                console.log('obj1 final history', obj.getHistory())

                db.close(t.end)
              })
            })
          })
        })        
      })
    })
  })
  tape('register - two members, updated concurrently by both', function(t) {
    var db1 = level(__dirname + '/../db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/../db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members:[feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare
      console.log('obj1 declaring reg')
      obj1.declare({ reg: 'register' }, function(err, changes) {
        if (err) throw err

        console.log('feed1 changes', changes)
        t.equal(feed1.msgs.length, 2)
        t.equal(changes.length, 1)
        t.assert(equal(obj1.get().reg, null))

        // set to 'foo'
        console.log('obj1 setting reg to "foo"')
        obj1.put({ reg: 'foo' }, function(err, changes) {
          if (err) throw err
          var umsg1 = msgpack.decode(feed1.msgs[2].message)
          console.log('obj1', obj1.get())
          console.log('changes', changes)
          console.log('update message 1', umsg1)

          t.equal(feed1.msgs.length, 3)
          t.equal(changes.length, 1)
          t.assert(equal(obj1.get().reg, 'foo'))

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
              t.assert(equal(obj2.get().reg, 'foo'))

              // set to true
              console.log('obj2 setting reg to true')
              obj2.put({ reg: true }, function(err, changes) {
                if (err) throw err
                var umsg1 = msgpack.decode(feed2.msgs[3].message)
                console.log('obj2', obj2.get())
                console.log('feed2 changes', changes)
                console.log('feed2 update message 1', umsg1)

                t.equal(feed2.msgs.length, 4)
                t.equal(changes.length, 1)
                t.assert(equal(obj2.get().reg, true))

                // set to false
                console.log('obj1 setting reg to false')
                obj1.put({ reg: false }, function(err, changes) {
                  if (err) throw err
                  var umsg1 = msgpack.decode(feed1.msgs[3].message)
                  console.log('obj1', obj1.get())
                  console.log('feed1 changes', changes)
                  console.log('feed1 update message 1', umsg1)

                  t.equal(feed1.msgs.length, 4)
                  t.equal(changes.length, 1)
                  t.assert(equal(obj1.get().reg, false))

                  // replicate the feeds
                  console.log('replicating feed1 to feed2')
                  feed1.msgs.forEach(feed2.addExisting.bind(feed2))
                  console.log('replicating feed2 to feed1')
                  feed2.msgs.forEach(feed1.addExisting.bind(feed1))

                  // bring feed1 history up to date
                  obj1.applyMessages(feed1.msgs.slice(4), function(err, changes) {
                    if (err) throw err

                    console.log('obj1', obj1.get())
                    console.log('feed1 changes', changes)
                    t.equal(feed1.msgs.length, 5)
                    t.equal(changes.length, 0)
                    t.assert(equal(obj1.get().reg, false))

                    // bring feed2 history up to date
                    obj2.applyMessages(feed2.msgs.slice(4), function(err, changes) {
                      if (err) throw err

                      console.log('obj2', obj2.get())
                      console.log('feed2 changes', changes)
                      t.equal(feed2.msgs.length, 5)
                      t.equal(changes.length, 1)
                      t.assert(equal(obj2.get().reg, false))

                      obj1.getHistory({includeMsg: true}, function(err, h1) {
                        if (err) throw err
                        obj2.getHistory({includeMsg: true}, function(err, h2) {
                          if (err) throw err

                          console.log('obj1 final history', h1)
                          console.log('obj2 final history', h2)
                          t.assert(equal(h1, h2))

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
