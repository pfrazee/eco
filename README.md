# Eventually-Consistent Object Types

Library of data types for building distributed applications on [Phoenix](https://github.com/pfraze/phoenix)/[SSB](https://github.com/dominictarr/secure-scuttlebutt).

*This is in the early stages, so I'm trying out ideas still.*

```js
var multicb = require('multicb')
var eco = require('ecotypes')
var db = require('levelup')(dbpath)
var ssb = require('secure-scuttlebutt/create')(ssbpath)
var feed = ssb.createFeed(keys)

// create dataset from message
var ds = eco.dataset(ssb, feed, { db: db, from: message })

// give a dbpath and let eco create the leveldb instance
var ds = eco.dataset(ssb, feed, { dbpath: './mydb', from: message })

// create new dataset
var ds = eco.dataset(ssb, feed, { db: db, members: [feed.id, bob_id, carla_id] })
ds.declare({
  myobj: 'map',
  mycount: 'counter',
  myset: 'growset'
}, function(err) {
  var done = multicb()

  // set values
  ds.myobj.set({ foo: 'bar' }, done())
  ds.myobj.set('baz', true, done())
  
  ds.mycount.inc(done())
  ds.mycount.inc(done())
  ds.mycount.dec(done())

  ds.myset.add('foo', done())
  ds.myset.add('bar', done())

  done(function(err) {
    // read values
    ds.myobj.all(console.log) // => undefined { foo: 'bar', baz: true }
    ds.mycount.get(console.log) // => undefined 1
    ds.myset.has('bar', console.log) // => undefined true
    ds.myset.all(console.log) // => undefined ['foo', 'bar']
    ds.state(console.log) /* => undefined {
      myobj: { foo: 'bar', baz: true },
      mycount: 1,
      myset: ['foo', 'bar']
    } */
  })
})

// listening to changes
ds.on('change', function(key, old, new, meta) {
  console.log(key, old, new) /* =>
  'myobj' ['foo', 'bar'] ['foo', 'barrr']  (change 1)
  'mycount' 1 2                            (change 2)
  */
})
ds.myobj.on('change', function(key, old, new, meta) {
  console.log(key, old, new) // => 'foo' 'bar' (change 1)
  console.log(meta) // => { author: Buffer, vts: [12, 1, 0] }
})
ds.mycount.on('change', function(old, new, meta) {
  console.log(old, new) // => 1 2 (change 2)
})
var startTime = ds.getVClock()
syncWithBobAndCarla(ssb, function() {
  console.log(ds.updatedSince(startTime)) // => ['myobj', 'mycount']
})

// API overview

// Dataset methods
ds.declare(types, function(err))
ds.get(key, function(err, type))
ds.state(function(err, vs)) // fetches state of entire dataset
ds.remove(key, function(err))
ds.on('change', function(key, old, new, meta))
ds.createChangeStream() // emits data in change events
ds.getId() // => Buffer (msg hash)
ds.getVClock() // => [1, 6, 4]
ds.getMembers() // => [Buffer, Buffer, Buffer] (feed ids)
ds.getOwner() // => Buffer (feed id)
ds.updatedSince(vectorTimestamp) => ['name', 'name', ...]

// Counter methods
c.inc(function(err, v))
c.dec(function(err, v))
c.get(function(err, v))
c.on('change', function(old, new, meta))

// Counterset methods
cs.inc(key, function(err, v))
cs.dec(key, function(err, v))
cs.get(key, function(err, v))
cs.on('change', function(key, old, new, meta))

// Register methods
r.set(value, function(err))
r.get(function(err, v, isMulti))
r.on('change', function(old, new, meta))

// Growset methods
gs.add(value, function(err))
gs.has(value, function(err, exists))
gs.all(function(err, vs))
gs.on('add', function(newMember, meta))

// Onceset methods
os.add(value, function(err))
os.remove(value, function(err))
os.has(value, function(err, exists))
os.all(function(err, vs))
os.on('change', function(old, new, meta))
// on add, old will be empty and new will have the new value
// on remove, old will have the old value and new will be empty

// Set
s.add(value, function(err))
s.remove(value, function(err))
s.has(value, function(err, exists))
s.all(function(err, vs))
s.on('change', function(old, new, meta))
// on add, old will be empty and new will have the new value
// on remove, old will have the old value and new will be empty

// Map
m.set(key, value, function(err))
m.remove(key, function(err))
m.get(key, function(err, v, isMulti))
m.all(function(err, vs))
m.on('change', function(key, old, new, meta))
```


## Background

Secure-scuttlebutt feeds guarantee delivery order and message authenticity. In Phoenix, each feed represents an individual user. By merging updates from multiple feeds, we can create aggregate datasets, as in a multi-node database. However, because the nodes only sync periodically, and (in extreme cases) may never experience mutual uptime, the datasets must be prepared for a weaker form of consistency (eventual consistency). Ecotypes is a library of types which behave well under these conditions.

[Background reading on eventual consistency, conflict-free replicated data types, and causal consistency.](https://github.com/pfraze/crdt_notes) If referring to the "Network design" section, Ecotypes are designed for optimistic, passive replication, and uses operation-based replication.


## Server Consistency

One beneficial characteristic of Phoenix/SSB is that, unlike in distributed databases, users will never change servers during operation. (That is, they have dedicated servers: their own devices.) This removes a class of issues which occur when a client changes servers during a partition, causing the view of state to be inconsistent.


## Basic Mechanics

Ecotype Datasets are defined by messages which are published in an SSB feed. The feed which initializes the dataset is the owner feed with special admin rights. Participating feeds are explicitly set by the owner feed. Subscribers to the dataset (which may include non-participants) deterministically execute the updates in order to construct a shared state.

Datasets are composed of (Eventually Consistent) Objects and Atoms. Messages are [encoded with Msgpack](https://github.com/msgpack/msgpack/blob/master/spec.md#serialization), and so the supported Atoms are the same as the types supported in msgpack.

One Object type, the Dataset, is allowed to contain other Objects. It may include other Datasets, enabling tree-like recursion. Datasets may not include atoms, however, to avoid ambiguous semantics.

New Objects are created with a `declare` operation in the Dataset that includes an id and a type declaration. Operations on the Object's value then work on its own semantics using its path (`grandparent.parent.object.method()`).


## Message Schema

```
{
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
  path: '',
  op: 'declare',
  args: ['self', {members: [593ac2f...fc, 04cf02a...31, 30d204d...11]}]
}
{
  vts: [2,0,0],
  path: '',
  op: 'declare',
  args: ['myobject', {type: 'Map'}]
}
{
  vts: [3,0,0],
  path: 'myobject',
  op: 'set',
  args: ['foo', 'bar']
}
{
  vts: [2,1,0],
  path: 'myobject',
  op: 'set',
  args: ['works', true]
}
```


## Planned ECOTypes

SSB's feeds guarantee one-time, ordered delivery of messages (within that feed). That gives us flexibility to use operation-based CRDTs.

Ecotypes are also aware of the full set of nodes involved, as they are defined in the schema. In that definition, the node-set is ordered. That ordering assigns the dimensions in vector clocks and determines the order of authority in Greatest Authority Wins.

The `value` type is a subset of `atom` which supports a straight-forward equality. It includes null, bools, ints, doubles, and strings.

**Counter - [Op-based Counter](https://github.com/pfraze/crdt_notes#op-based-counter)**

Operations: `inc()`, `dec()`, `get() -> integer`

**CounterSet - [PN Set](https://github.com/pfraze/crdt_notes#pn-set)**

Operations: `inc(value)`, `dec(value)`, `get(value) -> integer`, `all() -> object`

A set of counters.

**Register - [Multi-Value Register](https://github.com/pfraze/crdt_notes#multi-value-register-mv-register)**

Operations: `set(value)`, `get() -> atom`, `isMV() -> bool`

Multi-value is preferable to LWW because conflicts only occur when multiple users assign concurrently, and so the application/users may want to resolve. When splits occur, the values are ordered in an array by the node-set's ordering.

**GrowSet - [Grow-Only Set](https://github.com/pfraze/crdt_notes#grow-only-set-g-set)**

Operations: `add(value)`, `has(value) -> bool`, `all() -> array`

For sets which only ever grow.

**OnceSet - [Two-Phase Set](https://github.com/pfraze/crdt_notes#2p-set)**

Operations: `add(value)`, `remove(value)`, `has(value) -> bool`, `all() -> array`

For sets which guarantee that an item can only be added (and removed) once.

**Set - [Observed-Removed Set](https://github.com/pfraze/crdt_notes#or-set)**

Operations: `add(value)`, `remove(value)`, `has(value) -> bool`, `all() -> array`

For sets with no unique guarantees (a typical set).

**Map - Observed-Removed, Multi-Value Map**

Operations: `set(value, atom)`, `get(value) -> atom`, `all() -> object`, `remove(value)`, `isMV(value) -> bool`

Behaves like an OR Set where the element identity is `(key, uuid)`. The `set` operation removes then adds the value at `key`. Concurrent removes are idempotent; concurrent add/remove are independent due to the uuid; and concurrent adds join into a multi-value, as in the MV Register.

**Dataset - Observed-Removed, Greatest-Authority-Wins Map**

Operations: `declare(value, atom)`, `remove(value)`

Behaves like the Map, but only specifies the types for child-Objects, and does not support Multi-Value state. Objects may be redeclared, but (depending on the change) the redeclaration may destroy the current value. In the event of a conflict, the node with the greatest authority (defined by the ordered participants list) wins.


## Open questions

**Should the schema be allowed to change after publishing?**

Nodes which have not yet received the schema update may misinterpret updates by other nodes which are operating on the new definition.

This might be solved with some form of coordination (eg a version vector) so that updates are only applied once the schema has been updated.