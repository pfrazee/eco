'use strict'
var tape = require('tape')
var equal = require('deep-equal')
var level = require('level')
var sublevel = require('level-sublevel')
var memdown = require('memdown')
var msgpack = require('msgpack-js')
var eco = require('../lib')
var tutil = require('./test-utils')

module.exports = function(opts) {
  tape('declaration buffering', function(t) {
    var db1 = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/db2', { db: memdown, valueEncoding: 'binary' })
    var db3 = level(__dirname + '/db3', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()
    var feed3 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members: [feed1.id, feed2.id, feed3.id]}, function(err, obj1) {
      if (err) throw err

      // replicate to feed1 and feed2
      console.log('replicating init from feed1 to feed2')
      feed1.msgs.forEach(feed2.addExisting.bind(feed2))
      console.log('replicating init from feed1 to feed3')
      feed1.msgs.forEach(feed3.addExisting.bind(feed3))

      // declare in feed 1
      obj1.declare({ reg: 'register' }, function(err, changes) {
        if (err) throw err

        // replicate to feed2
        console.log('replicating declare from feed1 to feed2')
        feed1.msgs.forEach(feed2.addExisting.bind(feed2))

        // recreate the object in feeds 2 and 3
        eco.open(db2, feed2, obj1.getId(), function(err, obj2) {
          if (err) throw err
          eco.open(db3, feed3, obj1.getId(), function(err, obj3) {
            if (err) throw err

            // bring feed2 history up to date
            obj2.applyMessages(feed2.msgs.slice(1), function(err, changes) {
              if (err) throw err
                
              // at this point, all 3 feeds have the object, but only feeds 1 and 2 have the register decl
              t.assert(equal(obj1.get(), obj2.get()))
              t.assert(!equal(obj1.get(), obj3.get()))

              // set value in feed 2
              obj2.put({ reg: 'foobar' }, function(err, changes) {
                if (err) throw err

                t.assert(equal(obj2.get(), {reg:'foobar'}))

                // now replicate the put message from feed2 to feed3
                feed3.addExisting(feed2.msgs[feed2.msgs.length - 1])
                obj3.applyMessages(feed3.msgs.slice(-1), function(err, changes) {
                  if (err) throw err

                  // should have no effect, because the message was buffered
                  t.equal(changes.length, 0)
                  t.assert(equal(obj3.get(), {}))

                  // now replicate feed1 to feed3
                  console.log('replicating feed1 to feed3')
                  feed1.msgs.forEach(feed3.addExisting.bind(feed3))
                  obj3.applyMessages(feed3.msgs.slice(-1), function(err, changes) {
                    if (err) throw err

                    // should have declared and run the put
                    t.equal(changes.length, 2)
                    t.assert(equal(obj2.get(), obj3.get()))
                    db1.close(function() { db2.close(function() { db3.close(t.end) }) })
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
