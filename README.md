# Eventually-Consistent Object Types

Library of data types designed for [Phoenix](https://github.com/pfraze/phoenix)/[SSB](https://github.com/dominictarr/secure-scuttlebutt).

Secure-scuttlebutt feeds guarantee delivery order and message authenticity. In Phoenix, each feed represents an individual user. By merging updates from multiple feeds, we can create aggregate datasets, as in a multi-node database. However, because the nodes only sync periodically, and (in extreme cases) may never experience mutual uptime, the datasets must be prepared for a weaker form of consistency (eventual consistency). Ecotypes is a library of types which behave well under these conditions.

[Background reading on eventual consistency, conflict-free replicated data types, and causal consistency.](https://github.com/pfraze/crdt_notes) If referring to the "Network design" section, Ecotypes are designed for optimistic, passive replication, and include options for both state- and operation-based replication.

One beneficial characteristic of Phoenix/SSB is that, unlike in distributed databases, users will never change servers during operation. (That is, they have dedicated servers: their own devices.) This removes a class of issues which occur when a client changes servers during a partition, causing the view of state to be inconsistent.

Ecotypes are defined by schemas which are published in an SSB feed. This first feed owns the dataset and controls its definition. Participating feeds are included in the schema. Subscribers to the dataset deterministically execute the updates in order to construct a shared state.

Using Ecotypes, you can create distributed applications such as forums, document editors, spreadsheets, and more.

*This is in the early stages, so I'm trying out ideas still.*



## Planned Types

SSB's feeds guarantee one-time, ordered delivery of messages (within that feed). That gives us flexibility to use operation-based CRDTs.

Ecotypes are also aware of the full set of nodes involved, as they are defined in the schema. In that definition, the node-set is ordered. That ordering is used as needed, for instance to assign the dimensions in vector clocks. (A nodeset of `{Bob, Alice}` creates a vector-clock of `<bob_seq,alice_seq>`.)

### [Op-based Counter](https://github.com/pfraze/crdt_notes#op-based-counter) - `Counter`

Methods: `inc()`, `dec()`, `get() -> integer`

### [PN Set](https://github.com/pfraze/crdt_notes#pn-set) - `CounterSet`

Methods: `inc(v)`, `dec(v)`, `get(v) -> integer`

A set of counters.

### [Multi-Value Register](https://github.com/pfraze/crdt_notes#multi-value-register-mv-register) - `Register`

Methods: `set(v)`, `get() -> atom`, `isMV() -> bool`

Multi-value is preferable to LWW because conflicts only occur when multiple users assign concurrently, and so the application/users may want to resolve. When splits occur, the values are ordered in an array by the node-set's ordering.

### [Grow-Only Set](https://github.com/pfraze/crdt_notes#grow-only-set-g-set) - `GrowSet`

Methods: `add(v)`, `has(v) -> bool`

For sets which only ever grow.

### [Two-Phase Set](https://github.com/pfraze/crdt_notes#2p-set) - `OnceSet`

Methods: `add(v)`, `remove(v)`, `has(v) -> bool`

For sets which guarantee that an item can only be added (and removed) once.

### [Observed-Removed Set](https://github.com/pfraze/crdt_notes#or-set) - `Set`

Methods: `add(v)`, `remove(v)`, `has(v) -> bool`

For sets with no unique guarantees (a typical set).

### Observed-Removed, Multi-Value Map - `Map`

Methods: `set(k, v)`, `get(k) -> atom`, `remove(k)`, `isMV(k) -> bool`

Behaves like an OR Set where the element identity is `(key, uuid)`. The `set` operation removes then adds the value at `key`. Concurrent removes are idempotent; concurrent add/remove are independent due to the uuid; and concurrent adds join into a multi-value, as in the MV Register.



## Open questions

**Should the schema be allowed to change after publishing?**

Nodes which have not yet received the schema update may misinterpret updates by other nodes which are operating on the new definition.

This might be solved with some form of coordination: a version scalar, perhaps.