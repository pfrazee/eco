# Eventually-Consistent Objects

Library of data types for building distributed applications on [Phoenix](https://github.com/pfraze/phoenix)/[SSB](https://github.com/dominictarr/secure-scuttlebutt).

*This is in the early stages, so I'm trying out ideas still.*

```js
var multicb = require('multicb')
var eco = require('eco')
var db = require('levelup')(dbpath)
var ssb = require('secure-scuttlebutt/create')(ssbpath)
var feed = ssb.createFeed(keys)

// load object from message
eco.open(db, feed, messageid, cb)

// create new object
eco.create(db, feed, { members: [feed.id, bob_id, carla_id] }, function(err, obj) {
  console.log(obj.getId())
  // 40cd2e15...32 (message id)

  // define the object
  obj.declare({
    mymap: 'map',
    mycount: 'counter',
    myset: 'growset'
  }, function(err) {
    
    // update state
    var state = obj.get()
    console.log(state) /*
    {
      mymap: {},
      mycount: 0,
      myset: []
    }
    */
    state.mymap = { foo: 'bar', baz: true }
    state.mycount++
    state.myset = ['foo', 'bar']

    // write new state
    obj.put(state, function(err, changes) {
      console.log(obj.get()) /*
      {
        mymap: { baz: true, foo: 'bar' },
        mycount: 1,
        myset: ['foo', 'bar']
      }
      */
    })
  })
})

// listening to changes
obj.on('change', function(key, old, new, meta) {
  console.log(key, old, new) /*
  'mymap' ['foo', 'bar'] ['foo', 'barrr']  (change 1)
  'mycount' 1 2                            (change 2)
  */
})
var startTime = obj.getVClock()
obj.applyMessages(recentMessages, function(err, changes) {
  console.log(changes) /*
  [
    ['mymap', ['foo', 'bar'], ['foo', 'barrr'], { author: ..., authi: ..., vts: ... }],
    ['mycount', 1, 2, { author: ..., authi: ..., vts: ... }]
  ]
  */
  console.log(obj.updatedSince(startTime))
  // ['mymap', 'mycount']
})

// API overview
var object = eco.create(leveldb, feed, { members: [feedid, feedid, ... feedid] }, function(err, id))
var object = eco.open(leveldb, feed, messageid, function(err))

object.declare(types, function(err, changes)) // declare multiple members
object.typeof(key) // => type definition

object.get() // fetches a copy of the object state
object.put(vs, function(err, changes)) // diffs with the current state to generate the update ops

object.applyMessage(message, function(err, key, old, new, meta)) // run the update message (message should come from ssb)
object.applyMessages(messages, function(err, changes)) // batch apply

object.on('change', function(key, old, new, meta))
object.createChangeStream() // emits the change events

object.getId() // => Buffer (hashid of message that declared the object)
object.getVClock() // => [1, 6, 4]
object.getMembers() // => [Buffer, Buffer, Buffer] (feed ids)
object.getOwner() // => Buffer (feed id)
object.updatedSince(vectorTimestamp) // => ['key', 'key', ...]
```


## Background

Secure-scuttlebutt feeds guarantee delivery order and message authenticity. In Phoenix, each feed represents an individual user. By merging updates from multiple feeds, we can create aggregate datasets, as in a multi-node database. However, because the nodes only sync periodically, and (in extreme cases) may never experience mutual uptime, the datasets must be prepared for a weaker form of consistency (eventual consistency). Eco is a library of types which behave well under these conditions.

[Background reading on eventual consistency, conflict-free replicated data types, and causal consistency.](https://github.com/pfraze/crdt_notes) If referring to the "Network design" section, Eco types are designed for optimistic, passive replication, and uses operation-based replication.


## Server Consistency

One beneficial characteristic of Phoenix/SSB is that, unlike in distributed databases, users will never change servers during operation. (That is, they have dedicated servers: their own devices.) This removes a class of issues which occur when a client changes servers during a partition, causing the view of state to be inconsistent.


## Basic Mechanics

Eco Objects are defined by messages which are published in an SSB feed. The feed which initializes the object is the owner feed with special admin rights. Participating feeds are explicitly set by the owner feed. Subscribers to the object (which may include non-participants) deterministically execute the updates in order to construct a shared state.

Objects are composed of CRDTs which contain Atoms. Messages are [encoded with Msgpack](https://github.com/msgpack/msgpack/blob/master/spec.md#serialization), and so the supported Atoms are the same as the types supported in msgpack.

One CRDT type, the Object, is allowed to contain other CRDTs. In the future, it may include other Objects, enabling tree-like recursion.

New CRDTs are created with a `declare` operation in the Object that includes a key and a type declaration. After declaration, a CRDT definition can not be changed or removed.


## Message Schema

```
{
  obj: { $msg: Buffer, $rel: 'eco-object' },
  vts: Array[Int],
  path: String,
  op: String,
  args: Array[Atom]
}
```

Example stream:

```
{
  vts: [1,0,0],
  op: 'init',
  args: [{
    members: [
      { $feed: 593ac2f...fc, $rel: 'eco-member' },
      { $feed: 04cf02a...31, $rel: 'eco-member' },
      { $feed: 30d204d...11, $rel: 'eco-member' }
    ]
  }]
}
{
  obj: { $msg: 9a22ce...ff, $rel: 'eco-object' },
  vts: [2,0,0],
  path: '',
  op: 'declare',
  args: ['myobject', {type: 'map'}]
}
{
  obj: { $msg: 9a22ce...ff, $rel: 'eco-object' },
  vts: [3,0,0],
  path: 'myobject',
  op: 'set',
  args: ['foo', 'bar']
}
{
  obj: { $msg: 9a22ce...ff, $rel: 'eco-object' },
  vts: [2,1,0],
  path: 'myobject',
  op: 'set',
  args: ['works', true]
}
```


## Planned ECO Types

SSB's feeds guarantee one-time, ordered delivery of messages (within that feed). That gives us flexibility to use operation-based CRDTs.

Ecos are also aware of the full set of nodes involved, as they are defined in the schema. In that definition, the node-set is ordered. That ordering assigns the dimensions in vector clocks and determines the order of authority in Greatest Authority Wins.

The `value` type is a subset of `atom` which supports a straight-forward equality. It includes null, bools, ints, doubles, and strings.

**Counter - [Op-based Counter](https://github.com/pfraze/crdt_notes#op-based-counter)**

Operations: `inc(integer)`, `dec(integer)`

**CounterSet - [PN Set](https://github.com/pfraze/crdt_notes#pn-set)**

Operations: `inc(value, integer)`, `dec(value, integer)`

A set of counters.

**Register - [Greatest-Authority Wins Register](https://github.com/pfraze/crdt_notes#registers)**

Operations: `set(value)`

Single-value register. Concurrent writes are resolved by taking the value from the node with greatest authority.

**GrowSet - [Grow-Only Set](https://github.com/pfraze/crdt_notes#grow-only-set-g-set)**

Operations: `add(value)`

For sets which only ever grow.

**OnceSet - [Two-Phase Set](https://github.com/pfraze/crdt_notes#2p-set)**

Operations: `add(value)`, `remove(value)`

For sets which guarantee that an item can only be added (and removed) once.

**Set - [Observed-Removed Set](https://github.com/pfraze/crdt_notes#or-set)**

Operations: `add(value)`, `remove(value)`

For sets with no unique guarantees (a typical set).

**Map - Observed-Removed, Greatest-Authority-Wins Map**

Operations: `set(value, atom)`, `remove(value)`

Behaves like an OR Set where the element identity is `(key, uuid)`. The `set` operation removes then adds the value at `key`. Concurrent removes are idempotent; concurrent add/remove are independent due to the uuid; and concurrent adds are greatest-authority wins.

**Object - Grow-Only, Greatest-Authority-Wins Map**

Operations: `declare(value, atom)`

Behaves like the Map, but only specifies the types for child-Objects. If there are concurrent adds for the same key, greatest-authority wins.


## How to use eco

Eco works like a NoSQL database, but its data is published on the users' feeds. This means that anybody can subscribe to, reconstruct, and rehost the objects. Only the object's members can publish changes.

Objects in ECO can change without input by the local user. You'll want to watch for changes so you can react to the updates. `Get()` is cheap because it's just a clone of data in memory, so don't hesitate to use it. Be sure to:

 - Always get a fresh copy of the state (`get()`) after asyncronous work has been done.
 - When making changes to state, get a fresh copy, make the changes, and write again before yielding the thread. `Get()` is cheap!

There's no guarantee that other users access the Object using the same code that you do. Be sure to:

 - Sanitize values in the objects, eg. for HTML and XSS attacks.
 - Watch for values that may be attacks, and let the users know when an attack has been attempted.


## Open development questions

These are topics about eco that have not yet been decided.

**Should the schema be allowed to change after publishing?**

Nodes which have not yet received the schema update may misinterpret updates by other nodes which are operating on the new definition.

This might be solved with some form of coordination (eg a version vector) so that updates are only applied once the schema has been updated.

Currently, ECO disallows CRDTs to be changed or removed after they are added (the object's crdts are grow-only). Add-messages still need to happen before operations are allowed to execute; operations that arrive before their add-message need to be buffered.

**Is it possible to detect when states have become irreconcilable?**

Eg a node errors while applying an update, or a node makes a bad update and other nodes reject the message.

One solution might be to publish a checksum of the current state and allow nodes to compare. To do repairs, the owner node could publish a checkpoint (a state-dump) and force all other nodes to reset to that checkpoint.

**Can updates be batched in SSB messages?**

You could decrease the SSB overhead by grouping multiple ECO messages in one SSB message. The simplest solution puts multiple ECO messages in an ordered array. Whether this makes a significant enough difference or has any kind of drawback, I'm not sure.

**Should non-owner members be allowed to declare CRDTs?**

**How should the app guarantee once-and-only-once message delivery?**

SSB ensures that messages can't enter the feed more than once, but ECO relies on the application to apply the messages, and an app could re-apply a message and cause a failure. Is there a good way to take that concern away from application developers?