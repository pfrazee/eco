# Eventually-Consistent Object Types

Library of data types for building distributed applications on [Phoenix](https://github.com/pfraze/phoenix)/[SSB](https://github.com/dominictarr/secure-scuttlebutt).

```js
var ecotypes = require('ecotypes')
var ssb = require('secure-scuttlebutt/create')(dbpath)

// create dataset
var ds = ecotypes.dataset(ssb, { members: [alicehash, bobhash, carlahash] })
ds.declare({
  myobj: 'map',
  mycount: 'counter'
})

// set values
ds.myobj.set({ foo: 'bar' })
ds.myobj.set('baz', true)
console.log(ds.myobj.all()) // => { foo: 'bar', baz: true }

ds.mycount.inc()
ds.mycount.inc()
ds.mycount.dec()
console.log(ds.mycount.get()) // => 1

ds.declare('myset', 'growset')
ds.myset.add('foo')
ds.myset.add('bar')
console.log(ds.myset.has('bar')) // => true
console.log(ds.myset.all()) // => ['foo', 'bar']

// sync with network and listen to changes
ds.on('change', function(key, old, new) {
  // change 1
  console.log(key, old, new) // => 'myobj' ['foo', 'bar'] ['foo', 'barrr']
  // change 2
  console.log(key, old, new) // => 'mycount' 1 2
})
ds.myobj.on('change', function(key, old, new) {
  // change 1
  console.log(key, old, new) // => 'foo' 'bar' 'barrr'
})
ds.mycount.on('change', function(old, new) {
  // change 2
  console.log(old, new) // => 1 2
})
doNetworkSync(ssb)

//

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

*This is in the early stages, so I'm trying out ideas still.*


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

**`Counter` - [Op-based Counter](https://github.com/pfraze/crdt_notes#op-based-counter)**

Methods: `inc()`, `dec()`, `get() -> integer`

**`CounterSet` - [PN Set](https://github.com/pfraze/crdt_notes#pn-set)**

Methods: `inc(value)`, `dec(value)`, `get(value) -> integer`, `all() -> object`

A set of counters.

**`Register` - [Multi-Value Register](https://github.com/pfraze/crdt_notes#multi-value-register-mv-register)**

Methods: `set(value)`, `get() -> atom`, `isMV() -> bool`

Multi-value is preferable to LWW because conflicts only occur when multiple users assign concurrently, and so the application/users may want to resolve. When splits occur, the values are ordered in an array by the node-set's ordering.

**`GrowSet` - [Grow-Only Set](https://github.com/pfraze/crdt_notes#grow-only-set-g-set)**

Methods: `add(value)`, `has(value) -> bool`, `all() -> array`

For sets which only ever grow.

**`OnceSet` - [Two-Phase Set](https://github.com/pfraze/crdt_notes#2p-set)**

Methods: `add(value)`, `remove(value)`, `has(value) -> bool`, `all() -> array`

For sets which guarantee that an item can only be added (and removed) once.

**`Set` - [Observed-Removed Set](https://github.com/pfraze/crdt_notes#or-set)**

Methods: `add(value)`, `remove(value)`, `has(value) -> bool`, `all() -> array`

For sets with no unique guarantees (a typical set).

**`Map` - Observed-Removed, Multi-Value Map**

Methods: `set(value, atom)`, `get(value) -> atom`, `all() -> object`, `remove(value)`, `isMV(value) -> bool`

Behaves like an OR Set where the element identity is `(key, uuid)`. The `set` operation removes then adds the value at `key`. Concurrent removes are idempotent; concurrent add/remove are independent due to the uuid; and concurrent adds join into a multi-value, as in the MV Register.

**`Dataset` - Observed-Removed, Greatest-Authority-Wins Map**

Methods: `declare(value, atom)`, `remove(value)`

Behaves like the Map, but only specifies the types for child-Objects, and does not support Multi-Value state. Objects may be redeclared, but (depending on the change) the redeclaration may destroy the current value. In the event of a conflict, the node with the greatest authority (defined by the ordered participants list) wins.


## Open questions

**Should the schema be allowed to change after publishing?**

Nodes which have not yet received the schema update may misinterpret updates by other nodes which are operating on the new definition.

This might be solved with some form of coordination (eg a version vector) so that updates are only applied once the schema has been updated.