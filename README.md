# Eventually-Consistent Object

Library of data types for building distributed applications on [Phoenix](https://github.com/pfraze/phoenix)/[SSB](https://github.com/dominictarr/secure-scuttlebutt).

*This is in the early stages, so I'm trying out ideas still.*

```js
var multicb = require('multicb')
var eco = require('eco')
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
  
  // read current state
  ds.state(function(err, state) {
    console.log(state) /*
    {
      myobj: {},
      mycount: 0,
      myset: []
    }
    */

    // update state
    state.myobj.baz = true
    state.myobj.foo = 'bar'
    state.mycount++
    state.myset.push('foo')
    state.myset.push('bar')

    // write new state
    ds.write(state, function(err, state) {
      console.log(state) /*
      {
        myobj: { baz: true, foo: 'bar' },
        mycount: 1,
        myset: ['foo', 'bar']
      }
      */

      // semantics of the types are maintained
      state.myset = ['baz'] // myset is a "GrowSet", so 'foo' and 'bar' cant be removed
      ds.write(state, function(err, state) {
        console.log(state.myset)
        // ['foo', 'bar', 'baz']
      })
    })
  })
})

// listening to changes
ds.on('change', function(key, old, new, meta) {
  console.log(key, old, new) /*
  'myobj' ['foo', 'bar'] ['foo', 'barrr']  (change 1)
  'mycount' 1 2                            (change 2)
  */
})
ds.myobj.on('change', function(key, old, new, meta) {
  console.log(key, old, new)
  // 'foo' 'bar' 'barrr'                   (change 1)
  console.log(meta)
  // { author: Buffer, vts: [12, 1, 0] }
})
ds.mycount.on('change', function(old, new, meta) {
  console.log(old, new)
  // 1 2                                   (change 2)
})
var startTime = ds.getVClock()
syncWithBobAndCarla(ssb, function() {
  console.log(ds.updatedSince(startTime))
  // ['myobj', 'mycount']
})

// API overview
eco.dataset(ssb, feed, opts)

// Dataset methods
ds.declare(types, function(err)) // declare multiple types
ds.declare(name, type, function(err)) // declare 1 type
ds.typeof(name) // fetches the type description of the value
ds.remove(name, function(err))

ds.state(function(err, vs)) // fetches state of entire dataset
ds.write(vs, function(err, vs)) // diffs with the current state to generate the update ops

ds.on('change', function(key, old, new, meta))
ds.createChangeStream() // emits the change events

ds.getId() // => Buffer (msg hash)
ds.getVClock() // => [1, 6, 4]
ds.getMembers() // => [Buffer, Buffer, Buffer] (feed ids)
ds.getOwner() // => Buffer (feed id)
ds.updatedSince(vectorTimestamp) => ['name', 'name', ...]
```


## Background

Secure-scuttlebutt feeds guarantee delivery order and message authenticity. In Phoenix, each feed represents an individual user. By merging updates from multiple feeds, we can create aggregate datasets, as in a multi-node database. However, because the nodes only sync periodically, and (in extreme cases) may never experience mutual uptime, the datasets must be prepared for a weaker form of consistency (eventual consistency). Eco is a library of types which behave well under these conditions.

[Background reading on eventual consistency, conflict-free replicated data types, and causal consistency.](https://github.com/pfraze/crdt_notes) If referring to the "Network design" section, Eco types are designed for optimistic, passive replication, and uses operation-based replication.


## Server Consistency

One beneficial characteristic of Phoenix/SSB is that, unlike in distributed databases, users will never change servers during operation. (That is, they have dedicated servers: their own devices.) This removes a class of issues which occur when a client changes servers during a partition, causing the view of state to be inconsistent.


## Basic Mechanics

Eco Datasets are defined by messages which are published in an SSB feed. The feed which initializes the dataset is the owner feed with special admin rights. Participating feeds are explicitly set by the owner feed. Subscribers to the dataset (which may include non-participants) deterministically execute the updates in order to construct a shared state.

Datasets are composed of (Eventually Consistent) Objects and Atoms. Messages are [encoded with Msgpack](https://github.com/msgpack/msgpack/blob/master/spec.md#serialization), and so the supported Atoms are the same as the types supported in msgpack.

One Object type, the Dataset, is allowed to contain other Objects. It may include other Datasets, enabling tree-like recursion. Datasets may not include atoms, however, to avoid ambiguous semantics.

New Objects are created with a `declare` operation in the Dataset that includes an id and a type declaration. Operations on the Object's value then work on its own semantics using its path (`grandparent.parent.object.method()`).


## Message Schema

```
{
  dataset: { $msg: Buffer, $rel: 'eco-dataset' },
  vts: Array[Int],
  path: String,
  op: String,
  args: Array[Atom]
}
```

Example stream:

```
{
  dataset: { $msg: 9a22ce...ff, $rel: 'eco-dataset' },
  vts: [1,0,0],
  path: '',
  op: 'declare',
  args: ['self', {
    members: [
      { $feed: 593ac2f...fc, $rel: 'eco-member' },
      { $feed: 04cf02a...31, $rel: 'eco-member' },
      { $feed: 30d204d...11, $rel: 'eco-member' }
    ]
  }]
}
{
  dataset: { $msg: 9a22ce...ff, $rel: 'eco-dataset' },
  vts: [2,0,0],
  path: '',
  op: 'declare',
  args: ['myobject', {type: 'Map'}]
}
{
  dataset: { $msg: 9a22ce...ff, $rel: 'eco-dataset' },
  vts: [3,0,0],
  path: 'myobject',
  op: 'set',
  args: ['foo', 'bar']
}
{
  dataset: { $msg: 9a22ce...ff, $rel: 'eco-dataset' },
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

Operations: `inc(integer)`, `dec(integer)`, `get() -> integer`

**CounterSet - [PN Set](https://github.com/pfraze/crdt_notes#pn-set)**

Operations: `inc(value, integer)`, `dec(value, integer)`, `get(value) -> integer`, `all() -> object`

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

A simple solution would disallow objects to be changed or removed after they are added (the dataset would be grow-only).

**Is it possible to detect when states have become irreconcilable?**

Eg a node errors while applying an update, or a node makes a bad update and other nodes reject the message.

One solution might be to publish a checksum of the current state and allow nodes to compare. To do repairs, the owner node could publish a checkpoint (a state-dump) and force all other nodes to reset to that checkpoint.

**Can updates be batched in SSB messages?**

You could decrease the SSB overhead by grouping multiple ECO messages in one SSB message. The simplest solution puts multiple ECO messages in an ordered array. Whether this makes a significant enough difference or has any kind of drawback, I'm not sure.