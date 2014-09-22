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
  tape('object creation, no opts', function(t) {
    var db = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var feed = tutil.makefeed()

    // create a new object
    eco.create(db, feed, function(err, obj) {
      if (err) throw err

      // check init message
      var initmsg = msgpack.decode(feed.msgs[0].message)
      console.log('init message', initmsg)
      t.equal(initmsg.op, 'init')
      t.assert(equal(initmsg.vts, [1]))
      t.equal(initmsg.args[0].members[0].$rel, 'eco-member')
      t.equal(initmsg.args[0].members[0].$feed.toString('hex'), feed.id.toString('hex'))

      // check internal state
      var state = obj.getInternalState()
      console.log('internal state', state)
      t.assert(!!state.id)
      t.equal(state.nodei, 0)
      t.assert(equal(state.vclock, [1]))
      t.assert(equal(state.members, [feed.id]))
      t.assert(equal(state.meta, {}))
      t.assert(equal(state.data, {}))

      db.close(t.end)
    })
  })

  tape('object creation, members given', function(t) {
    var db = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var feed = tutil.makefeed()
    var otherid = tutil.randomid()

    // create a new object
    eco.create(db, feed, { members: [feed.id, otherid] }, function(err, obj) {
      if (err) throw err

      // check init message
      var initmsg = msgpack.decode(feed.msgs[0].message)
      console.log('init message', initmsg)
      t.equal(initmsg.op, 'init')
      t.assert(equal(initmsg.vts, [1, 0]))
      t.equal(initmsg.args[0].members[0].$rel, 'eco-member')
      t.equal(initmsg.args[0].members[0].$feed.toString('hex'), feed.id.toString('hex'))
      t.equal(initmsg.args[0].members[1].$rel, 'eco-member')
      t.equal(initmsg.args[0].members[1].$feed.toString('hex'), otherid.toString('hex'))

      // check internal state
      var state = obj.getInternalState()
      console.log('internal state', state)
      t.assert(!!state.id)
      t.equal(state.nodei, 0)
      t.assert(equal(state.vclock, [1, 0]))
      t.assert(equal(state.members, [feed.id, otherid]))
      t.assert(equal(state.meta, {}))
      t.assert(equal(state.data, {}))

      db.close(t.end)
    })
  })

  tape('object creation, members given without creator', function(t) {
    var db = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var feed = tutil.makefeed()
    var otherid = tutil.randomid()

    // create a new object
    eco.create(db, feed, { members: [otherid] }, function(err, obj) {
      if (err) throw err

      // check init message
      var initmsg = msgpack.decode(feed.msgs[0].message)
      console.log('init message', initmsg)
      t.equal(initmsg.op, 'init')
      t.assert(equal(initmsg.vts, [1, 0]))
      t.equal(initmsg.args[0].members[0].$rel, 'eco-member')
      t.equal(initmsg.args[0].members[0].$feed.toString('hex'), feed.id.toString('hex'))
      t.equal(initmsg.args[0].members[1].$rel, 'eco-member')
      t.equal(initmsg.args[0].members[1].$feed.toString('hex'), otherid.toString('hex'))

      // check internal state
      var state = obj.getInternalState()
      console.log('internal state', state)
      t.assert(!!state.id)
      t.equal(state.nodei, 0)
      t.assert(equal(state.vclock, [1, 0]))
      t.assert(equal(state.members, [feed.id, otherid]))
      t.assert(equal(state.meta, {}))
      t.assert(equal(state.data, {}))

      db.close(t.end)
    })
  })

  tape('object open from other feed', function(t) {
    var db1 = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, { members: [feed1.id, feed2.id] }, function(err, obj1) {
      if (err) throw err

      // replicate the feeds
      console.log('replicating feed1 to feed2')
      feed1.msgs.forEach(feed2.addExisting.bind(feed2))

      // recreate the object
      eco.open(db2, feed2, obj1.getId(), function(err, obj2) {
        if (err) throw err

        // compare internal states
        var state1 = obj1.getInternalState()
        var state2 = obj2.getInternalState()
        console.log('id', state2.id.toString('hex'))
        t.equal(state1.id.toString('hex'), state2.id.toString('hex'))
        t.equal(state1.nodei, 0)
        console.log('nodei', state2.nodei)
        t.equal(state2.nodei, 1)
        console.log('vclock', state2.vclock)
        t.assert(equal(state1.vclock, [1, 0]))
        t.assert(equal(state2.vclock, [1, 1]))
        console.log('members', state1.members, state2.members)
        t.assert(equal(state1.members, state2.members))
        console.log('meta', state2.meta)
        t.assert(equal(state2.meta, {}))
        console.log('data', state2.data)
        t.assert(equal(state2.data, {}))

        db1.close(function() { db2.close(t.end) })
      })
    })
  })

  tape('value declarations', function(t) {
    var db = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var feed = tutil.makefeed()

    // create a new object
    eco.create(db, feed, function(err, obj) {
      if (err) throw err

      // declare all
      obj.declare({
        a: 'counter',
        b: 'counterset',
        c: 'growset',
        d: 'map',
        e: 'onceset',
        f: 'register',
        g: 'set'
      }, function(err, changes) {
        if (err) throw err

        console.log('changes', changes)
        t.equal(feed.msgs.length, 8)
        t.equal(changes.length, 7)
        t.assert(equal(changes[0].slice(0,3), ['a', undefined, 0]))
        t.assert(equal(changes[1].slice(0,3), ['b', undefined, {}]))
        t.assert(equal(changes[2].slice(0,3), ['c', undefined, []]))
        t.assert(equal(changes[3].slice(0,3), ['d', undefined, {}]))
        t.assert(equal(changes[4].slice(0,3), ['e', undefined, []]))
        t.assert(equal(changes[5].slice(0,3), ['f', undefined, null]))
        t.assert(equal(changes[6].slice(0,3), ['g', undefined, []]))

        var state = obj.getInternalState()
        console.log('internal metadata', state.meta)
        t.equal(state.meta.a.key, 'a')
        t.equal(state.meta.a.type, 'counter')
        t.equal(state.meta.a.author.toString('hex'), feed.id.toString('hex'))
        t.equal(state.meta.a.authi, 0)
        t.assert(equal(state.meta.a.vts, [2]))
        t.assert(equal(state.meta.b.vts, [3]))
        t.equal(state.meta.b.type, 'counterset')
        t.assert(equal(state.meta.c.vts, [4]))
        t.equal(state.meta.c.type, 'growset')
        t.assert(equal(state.meta.d.vts, [5]))
        t.equal(state.meta.d.type, 'map')
        t.assert(equal(state.meta.e.vts, [6]))
        t.equal(state.meta.e.type, 'onceset')
        t.assert(equal(state.meta.f.vts, [7]))
        t.equal(state.meta.f.type, 'register')
        t.assert(equal(state.meta.g.vts, [8]))
        t.equal(state.meta.g.type, 'set')

        db.close(t.end)
      })
    })
  })

  tape('value declaration by another user', function(t) {
    var db1 = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members: [feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // declare all
      obj1.declare({
        a: 'counter',
        b: 'counterset',
        c: 'growset',
        d: 'map',
        e: 'onceset',
        f: 'register',
        g: 'set'
      }, function(err, changes) {
        if (err) throw err

        // replicate the feeds
        console.log('replicating feed1 to feed2')
        feed1.msgs.forEach(feed2.addExisting.bind(feed2))

        // recreate the object
        eco.open(db2, feed2, obj1.getId(), function(err, obj2) {
          if (err) throw err

          // bring history up to date
          obj2.applyMessages(feed2.msgs.slice(1), function(err, changes) {
            if (err) throw err

            t.equal(changes.length, 7)
            var state1 = obj1.getInternalState()
            var state2 = obj2.getInternalState()
            console.log('internal state', state2)
            t.assert(equal(state1.data, state2.data))
            t.assert(equal(state2.meta.a.vts, [2, 2]))
            t.assert(equal(state2.meta.b.vts, [3, 3]))
            t.assert(equal(state2.meta.c.vts, [4, 4]))
            t.assert(equal(state2.meta.d.vts, [5, 5]))
            t.assert(equal(state2.meta.e.vts, [6, 6]))
            t.assert(equal(state2.meta.f.vts, [7, 7]))
            t.assert(equal(state2.meta.g.vts, [8, 8]))

            db1.close(function() { db2.close(t.end) })
          })
        })
      })
    })
  })

  tape('value declaration by multiple users', function(t) {
    var db1 = level(__dirname + '/db', { db: memdown, valueEncoding: 'binary' })
    var db2 = level(__dirname + '/db2', { db: memdown, valueEncoding: 'binary' })
    var feed1 = tutil.makefeed()
    var feed2 = tutil.makefeed()

    // create a new object
    eco.create(db1, feed1, {members: [feed1.id, feed2.id]}, function(err, obj1) {
      if (err) throw err

      // replicate the feeds
      console.log('replicating feed1 to feed2')
      feed1.msgs.forEach(feed2.addExisting.bind(feed2))

      // recreate the object
      eco.open(db2, feed2, obj1.getId(), function(err, obj2) {
        if (err) throw err

        // declare some
        obj1.declare({
          a: 'counter',
          b: 'counterset',
          c: 'growset'
        }, function(err, changes) {
          if (err) throw err
          t.equal(changes.length, 3)

          // declare the rest
          obj2.declare({
            a: 'register', // redeclaration by lower authority -- should have no effect
            d: 'map',
            e: 'onceset',
            f: 'register',
            g: 'set'
          }, function(err, changes) {
            if (err) throw err
            t.equal(changes.length, 5)

            // replicate the feeds
            console.log('replicating feed1 to feed2')
            console.log('replicating feed2 to feed1')
            feed1.msgs.forEach(feed2.addExisting.bind(feed2))
            feed2.msgs.forEach(feed1.addExisting.bind(feed1))

            // bring history up to date
            obj1.applyMessages(feed1.msgs, function(err, changes) {
              if (err) throw err
              t.equal(changes.length, 4)
              console.log('changes1', changes)
            
              obj2.applyMessages(feed2.msgs, function(err, changes) {
                if (err) throw err
                t.equal(changes.length, 3)
                console.log('changes2', changes)

                var state1 = obj1.getInternalState()
                var state2 = obj2.getInternalState()
                console.log('state1', state1)
                console.log('state2', state2)
                t.assert(equal(state1.data, state2.data))
                t.equal(state1.meta.a.authi, 0)
                t.equal(state2.meta.a.authi, 0)
                t.equal(state1.meta.b.authi, 0)
                t.equal(state2.meta.b.authi, 0)
                t.equal(state1.meta.c.authi, 0)
                t.equal(state2.meta.c.authi, 0)
                t.equal(state1.meta.d.authi, 1)
                t.equal(state2.meta.d.authi, 1)
                t.equal(state1.meta.e.authi, 1)
                t.equal(state2.meta.e.authi, 1)
                t.equal(state1.meta.f.authi, 1)
                t.equal(state2.meta.f.authi, 1)
                t.equal(state1.meta.g.authi, 1)
                t.equal(state2.meta.g.authi, 1)

                db1.close(function() { db2.close(t.end) })
              })
            })
          })
        })
      })
    })
  })

  require('./types/counter')({})
  require('./types/counterset')({})
  require('./types/growset')({})
  require('./types/onceset')({})
}

if(!module.parent)
  module.exports({ })
