# Eventually-Consistent Object Types

Library of data types for building distributed applications on [Phoenix](https://github.com/pfraze/phoenix)/[SSB](https://github.com/dominictarr/secure-scuttlebutt).

## Background

Secure-scuttlebutt feeds guarantee delivery order and message authenticity. In Phoenix, each feed represents an individual user. By merging updates from multiple feeds, we can create aggregate datasets, as in a multi-node database. However, because the nodes only sync periodically, and (in extreme cases) may never experience mutual uptime, the datasets must be prepared for a weaker form of consistency (eventual consistency). Ecotypes is a library of types which behave well under these conditions.

[Background reading on eventual consistency, conflict-free replicated data types, and causal consistency.](https://github.com/pfraze/crdt_notes) If referring to the "Network design" section, Ecotypes are designed for optimistic, passive replication, and include options for both state- and operation-based replication.

## Server Consistency

One beneficial characteristic of Phoenix/SSB is that, unlike in distributed databases, users will never change servers during operation. (That is, they have dedicated servers: their own devices.) This removes a class of issues which occur when a client changes servers during a partition, causing the view of state to be inconsistent.

## Basic Mechanics

Ecotype Datasets are defined by messages which are published in an SSB feed. The feed which initializes the dataset is the owner feed with special admin rights. Participating feeds are explicitly set by the owner feed. Subscribers to the dataset (which may include non-participants) deterministically execute the updates in order to construct a shared state.

Datasets are composed of (Eventually Consistent) Objects and Atoms. Messages are [encoded with Msgpack](https://github.com/msgpack/msgpack/blob/master/spec.md#serialization), and so the supported Atoms are the same as the types supported in msgpack.

One Object type, the Dataset, is allowed to contain other Objects. It may include other Datasets, enabling tree-like recursion. Datasets may not include atoms, however, to avoid ambiguous semantics.

New Objects are created with a `declare` operation in the Dataset that includes an id and a type declaration. Operations on the Object's value then work on its own semantics using its path (`grandparent.parent.object.method()`).

*This is in the early stages, so I'm trying out ideas still.*



## Planned ECOTypes

SSB's feeds guarantee one-time, ordered delivery of messages (within that feed). That gives us flexibility to use operation-based CRDTs.

Ecotypes are also aware of the full set of nodes involved, as they are defined in the schema. In that definition, the node-set is ordered. That ordering is used as needed, for instance to assign the dimensions in vector clocks, and to determine the order of authority in Greatest Authority Wins. (A nodeset of `{Bob, Alice}` creates a vector-clock of `<bob_seq,alice_seq>`.)

### `Counter` - [Op-based Counter](https://github.com/pfraze/crdt_notes#op-based-counter)

Methods: `inc()`, `dec()`, `get() -> integer`

### `CounterSet` - [PN Set](https://github.com/pfraze/crdt_notes#pn-set)

Methods: `inc(atom)`, `dec(atom)`, `get(atom) -> integer`

A set of counters.

### `Register` - [Multi-Value Register](https://github.com/pfraze/crdt_notes#multi-value-register-mv-register)

Methods: `set(atom)`, `get() -> atom`, `isMV() -> bool`

Multi-value is preferable to LWW because conflicts only occur when multiple users assign concurrently, and so the application/users may want to resolve. When splits occur, the values are ordered in an array by the node-set's ordering.

### `GrowSet` - [Grow-Only Set](https://github.com/pfraze/crdt_notes#grow-only-set-g-set)

Methods: `add(atom)`, `has(atom) -> bool`

For sets which only ever grow.

### `OnceSet` - [Two-Phase Set](https://github.com/pfraze/crdt_notes#2p-set)

Methods: `add(atom)`, `remove(atom)`, `has(atom) -> bool`

For sets which guarantee that an item can only be added (and removed) once.

### `Set` - [Observed-Removed Set](https://github.com/pfraze/crdt_notes#or-set)

Methods: `add(atom)`, `remove(atom)`, `has(has) -> bool`

For sets with no unique guarantees (a typical set).

### `Map` - Observed-Removed, Multi-Value Map

Methods: `set(atom, atom)`, `get(atom) -> atom`, `remove(atom)`, `isMV(atom) -> bool`

Behaves like an OR Set where the element identity is `(key, uuid)`. The `set` operation removes then adds the value at `key`. Concurrent removes are idempotent; concurrent add/remove are independent due to the uuid; and concurrent adds join into a multi-value, as in the MV Register.

### `Dataset` - Observed-Removed, Greatest-Authority-Wins Map

Methods: `declare(atom, type)`, `get(atom) -> type`, `undeclare(atom)`

Behaves like the Map, but only specifies the types for child-Objects, and does not support Multi-Value state. Objects may be redeclared, but (depending on the change) the redeclaration may destroy the current value. In the event of a conflict, the node with the greatest authority (defined by the ordered participants list) wins.


## Open questions

**Should the schema be allowed to change after publishing?**

Nodes which have not yet received the schema update may misinterpret updates by other nodes which are operating on the new definition.

This might be solved with some form of coordination (eg a version vector) so that updates are only applied once the schema has been updated.