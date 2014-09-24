# Eventually-Consistent (Distributed) Objects

A storage toolset for building distributed applications on [Phoenix](https://github.com/pfraze/phoenix)/[SSB](https://github.com/dominictarr/secure-scuttlebutt). Behaves like a NoSQL document store where the values merge predictably (and without application involvement) when two users make concurrent changes.

**Development Status**: API unstable. All planned types (below) are implemented; currently improving the test suite and refining the library's semantics.

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
})

// define object values
obj.declare({
  mymap: 'map',
  mycount: 'counter',
  myset: 'growset'
}, function(err) {
  console.log(obj.get()) /*
  {
    mymap: {},
    mycount: 0,
    myset: []
  }
  */
})

// write state
obj.put({ mymap: { foo: 'bar', baz: true }, mycount: 1, myset: ['foo', 'bar'] }, function(err, changes) {
  console.log(changes) /*
  [
    ['mymap', ['foo', undefined], ['foo', 'bar'], { author: ..., authi: ..., vts: ... }],
    ['mymap', ['baz', undefined], ['baz', true], { author: ..., authi: ..., vts: ... }],
    ['mycount', 0, 1, { author: ..., authi: ..., vts: ... }],
    ['myset', undefined, 'foo', { author: ..., authi: ..., vts: ... }],
    ['myset', undefined, 'bar', { author: ..., authi: ..., vts: ... }]
  }
  */
})

// applying update messages from other feeds
var startTime = obj.getSeq()
obj.applyMessages(recentMessages, function(err, changes) {
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
object.getSeq() // => [1, 6, 4]
object.getMembers() // => [Buffer, Buffer, Buffer] (feed ids)
object.getOwner() // => Buffer (feed id)
object.updatedSince(vectorTimestamp) // => ['key', 'key', ...]
```


## Background

Secure-scuttlebutt feeds guarantee delivery order and message authenticity. In Phoenix, each feed represents an individual user. By merging updates from multiple feeds, we can create aggregate datasets, as in a multi-node database. However, because the nodes only sync periodically, and (in extreme cases) may never experience mutual uptime, the datasets must be prepared for a weaker form of consistency (eventual consistency). Eco is a library of types which behave well under these conditions.

[Background reading on eventual consistency, conflict-free replicated data types, and causal consistency.](https://github.com/pfraze/crdt_notes) If referring to the "Network design" section, Eco types are designed for optimistic, passive replication, and uses operation-based replication.


## Server Consistency

One beneficial characteristic of Phoenix/SSB is that, unlike in distributed databases, users will never change servers during operation. (That is, they have dedicated servers: their own devices.) This removes a class of issues which occur when a client changes servers during a partition, causing the view of state to be inconsistent.

This gives us (PRAM)[http://en.wikipedia.org/wiki/PRAM_consistency] and (RYW)[http://www.dbms2.com/2010/05/01/ryw-read-your-writes-consistency/] consistency. [Related reading.](http://www.bailis.org/blog/stickiness-and-client-server-session-guarantees/)


## Basic Mechanics

Eco Objects are defined by messages which are published in an SSB feed. The feed which initializes the object is the owner feed with special admin rights. Participating feeds are explicitly set by the owner feed. Subscribers to the object (which may include non-participants) deterministically execute the updates in order to construct a shared state.

Objects are composed of CRDTs which contain values. Messages are [encoded with Msgpack](https://github.com/msgpack/msgpack/blob/master/spec.md#serialization), and so the supported values are the same as the types supported in msgpack. New CRDTs are created with a `declare` operation in the Object that includes a key and a type declaration. After declaration, a CRDT definition can not be changed or removed.

On the `put()` method, the given object is diffed against the current state, and a resulting set of operations are published on the feed and applied locally. The diff process works according to the types; for instance, a counter will calculate the delta between the values and issue an `inc` or `dec` op; the register, however, simply issues an overwriting `set` operation.

Messages received from other feeds must be applied manually for now with `applyMessage`. This gives the developer clear control over when changes occur to the dataset.


## Message Schema

```
{
  obj: { $msg: Buffer, $rel: 'eco-object' },
  seq: Int,
  path: String,
  op: String,
  args: Array[Atom]
}
```

Example stream:

```
{
  seq: 1,
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
  seq: 2,
  path: '',
  op: 'declare',
  args: ['myobject', {type: 'map'}]
}
{
  obj: { $msg: 9a22ce...ff, $rel: 'eco-object' },
  seq: 3,
  path: 'myobject',
  op: 'set',
  args: ['foo', 'bar', '0-1411423293709', []]
}
{
  obj: { $msg: 9a22ce...ff, $rel: 'eco-object' },
  seq: 4,
  path: 'myobject',
  op: 'set',
  args: ['works', true, '0-1411423293711', []]
}
```


## Planned ECO Types

SSB's feeds guarantee one-time, ordered delivery of messages (within that feed). That gives us flexibility to use operation-based CRDTs.

Ecos are also aware of the full set of nodes involved, as they are defined in the schema. In that definition, the node-set is ordered. That ordering assigns indexes to nodes, which are used to decide ties in sequence numbers.

The `value` type is a subset of `atom` which supports a straight-forward equality. It includes null, bools, ints, doubles, and strings.

**Counter - [Op-based Counter](https://github.com/pfraze/crdt_notes#op-based-counter)**

Operations: `inc(integer)`, `dec(integer)`

Storage overhead: no additional

**CounterSet - [PN Set](https://github.com/pfraze/crdt_notes#pn-set)**

Operations: `inc(value, integer)`, `dec(value, integer)`

Storage overhead: no additional

A set of counters.

**Register - [Last-Writer Wins Register](https://github.com/pfraze/crdt_notes#last-writer-wins-register-lww-register)**

Operations: `set(value)`

Single-value register. The most recent value is taken. Concurrent writes are resolved by taking the highest sequence number; if the seq numbers are equal, than node earliest in the memberset wins.

Storage overhead: no additional

**GrowSet - [Grow-Only Set](https://github.com/pfraze/crdt_notes#grow-only-set-g-set)**

Operations: `add(value)`

For sets which only ever grow. (Unordered.)

Storage overhead: no additional

**OnceSet - [Two-Phase Set](https://github.com/pfraze/crdt_notes#2p-set)**

Operations: `add(value)`, `remove(value)`

Storage overhead: tombstone set

For sets which guarantee that an item can only be added (and removed) once. (Unordered.)

**Set - [Observed-Removed Set](https://github.com/pfraze/crdt_notes#or-set)**

Operations: `add(value, addTag)`, `remove(value, removeTags)`

Storage overhead: tombstone set for tags (currently ~15 bytes per `remove` operation)

For sets with no unique guarantees (a typical set). (Unordered.)

**Map - Observed-Removed, Last-Writer-Wins Map**

Operations: `set(string, value, addTag, removeTags)`

Storage overhead: tombstone set for tags (currently ~15 bytes per `set` operation)

Behaves like an OR Set where the element identity is `(key, uuid)`. A set operation removes any current tags then sets the value at `key` with a new tag. Concurrent removes are idempotent; concurrent add/remove are independent due to the uuid; and concurrent adds are last-writer wins.

**Object - Grow-Only, Greatest-Authority-Wins Map**

Operations: `declare(string, value)`

Behaves like the Map, but only specifies the types for child-Objects, and can not change values after they are set. If there are concurrent adds for the same key, greatest-authority wins.


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

Currently, ECO disallows CRDTs to be changed or removed after they are added (the object's keys are grow-only). Add-messages still need to happen before operations are allowed to execute; operations that arrive before their add-message need to be buffered.

**Is it possible to detect when states have become irreconcilable?**

Eg a node errors while applying an update, or a node makes a bad update and other nodes reject the message.

One solution might be to publish a checksum of the current state and allow nodes to compare. To do repairs, the owner node could publish a checkpoint (a state-dump) and force all other nodes to reset to that checkpoint.

**Can updates be batched in SSB messages?**

You could decrease the SSB overhead by grouping multiple ECO messages in one SSB message. The simplest solution puts multiple ECO messages in an ordered array. Whether this makes a significant enough difference or has any kind of drawback, I'm not sure.

**Should non-owner members be allowed to declare CRDTs?**

**Correctness: How should the app guarantee once-and-only-once message delivery?**

SSB ensures that messages can't enter the feed more than once, but ECO relies on the application to apply the messages, and an app could re-apply a message and cause a failure. Is there a good way to take that concern away from application developers?

One option is to have the object listen to the feed's interface and automatically execute changes as they come in. This simplifies integration for the app developer, though it does mean that an SSB sync will update the object state, which app devs will need to be prepared for. (We'll probably do this, but the SSB interface is still being finalized.)

That interface update wouldn't guarantee once-and-only-once however. Even if SSB only ever emitted the messages once-and-only-once, it would be possible for the process to crash before it finished processing the message and storing the new state.

One solution is to check the update-author's dimension in the vector clocks of the state and of the update-message. This would not protect the application from dropping messages, but it would ensure that messages are applied once at most.

Another alternative is to include a link to the previous update of the given value in the update message (a causal dependency link). ECO would track the IDs of applied messages. If a causal dependency has not yet been applied, it would be fetched and applied first. (This would not be necessary for all types -- for instance, the register can ignore past updates so long as it has the most recent, and the OR Set makes no change if the tag has already been observed.)

**Is there a more efficient alternative to tombstone sets?**

See [The ORSWOT in Riak 2.0](https://github.com/pfraze/crdt_notes#the-orswot-in-riak-20)

**Is there a more efficient timestamp for Observed-Removed tags?**

Currently using `<node index>-<timestamp>` which ranges 15-20 bytes per tag.

**What happend to greatest-authority wins? Was it a good total order?**

It turns out, no. At least, not when used with vector clocks.

The initial premise was, during a window of concurrency, the node with greatest authority dominates. This means, the last message by the highest authority should apply.

The problem is that the period of known concurrency is inconsistent.

Consider this real-world message history from a set of 3 nodes:

```
NODE 2
my_reg=1 ts=<3,0,0> auth=NODE1 *
my_reg=4 ts=<3,1,0> auth=NODE2 *final
my_reg=1 ts=<2,0,1> auth=NODE3
my_reg=2 ts=<2,0,2> auth=NODE3
my_reg=3 ts=<2,0,3> auth=NODE3
my_reg=1 ts=<2,0,4> auth=NODE3

NODE 3
my_reg=1 ts=<2,0,1> auth=NODE3 *
my_reg=2 ts=<2,0,2> auth=NODE3 *
my_reg=3 ts=<2,0,3> auth=NODE3 *
my_reg=1 ts=<2,0,4> auth=NODE3 *
my_reg=1 ts=<3,0,0> auth=NODE1 *final
my_reg=4 ts=<3,1,0> auth=NODE2
```

Both of these nodes are following greatest-authority wins, so why do they come to different conclusions? Because of the internal vector clock. Here's the same sequence, with the internal clock shown:

```
NODE 2
my_reg=1 ts=<3,0,0> auth=NODE1 clock=<3,0,0> *
my_reg=4 ts=<3,1,0> auth=NODE2 clock=<3,1,0> *final
my_reg=1 ts=<2,0,1> auth=NODE3 clock=<3,1,1>
my_reg=2 ts=<2,0,2> auth=NODE3 clock=<3,1,2>
my_reg=3 ts=<2,0,3> auth=NODE3 clock=<3,1,3>
my_reg=1 ts=<2,0,4> auth=NODE3 clock=<3,1,4>

NODE 3
my_reg=1 ts=<2,0,1> auth=NODE3 clock=<2,0,1> *
my_reg=2 ts=<2,0,2> auth=NODE3 clock=<2,0,2> *
my_reg=3 ts=<2,0,3> auth=NODE3 clock=<2,0,3> *
my_reg=1 ts=<2,0,4> auth=NODE3 clock=<2,0,4> *
my_reg=1 ts=<3,0,0> auth=NODE1 clock=<3,0,4> *final
my_reg=4 ts=<3,1,0> auth=NODE2 clock=<3,1,4>
```

Nodes 2 and 3 start their concurrency windows at different times. For node2, it starts after `my_reg` has been set to 4. For node3, it starts after `my_reg` has been set to 1. With no more ordering information to use, the two nodes compare the authorities of *different messages*, and thus come to different results.

To fix this, vector clocks and Greatest-Authority have been dropped in favor of last-writer wins.
