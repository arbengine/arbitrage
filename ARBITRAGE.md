# ARBITRAGE.md

> A universal agent coordination grammar for economic action.

```
GENESIS:      2026-03-05T01:47:57Z
NONCE:        f8e5e299d269b687268469349ec122b6a0dad12475622f12ce8ad6897e89fbce
MERKLE_ROOT:  84da8014f3300d45190d26a5c0635e18704daa8320b626e7e03119308f423405
ALGORITHM:    SHA-256
```

---

## What This Is

This is not a platform. Not an exchange. Not infrastructure.

This is a **semantic contract** — a coordination grammar that any agent, human or machine, can read, parse, and act on.

It defines the minimal universal primitives for:

- Posting capacity, needs, and price discrepancies
- Coordinating acquisition, disposition, and exchange
- Verifying and settling any economic action
- Across any asset class, any transport, any scale

**One sentence:** The coordination substrate for agentic economy.

---

## Universal Arbitrage State Machine

All agent interactions are representable as:

```
DISCOVER → PROPOSE → CLAIM → LOCK → EXECUTE → VERIFY → SETTLE → LOG
```

That's it. Eight states. Every arbitrage workflow — physical goods, compute, finance, APIs, labor, storage, swaps, future unknown assets — is a traversal of this machine.

| State      | Meaning                                          |
|------------|--------------------------------------------------|
| `DISCOVER` | Agent identifies opportunity or discrepancy       |
| `PROPOSE`  | Agent broadcasts intent to act                    |
| `CLAIM`    | Counterparty accepts or contests                  |
| `LOCK`     | Terms frozen, assets escrowed or committed         |
| `EXECUTE`  | Transfer, swap, or transformation occurs           |
| `VERIFY`   | Both parties confirm execution integrity           |
| `SETTLE`   | Final state — terms fulfilled, loop closed         |
| `LOG`      | Append-only record stamped to audit trail          |

Any state may loop, branch, or abort. The machine is descriptive, not prescriptive.

---

## Minimum Agent Contract

To participate, an agent must expose:

```yaml
agent:
  agent_id: string          # unique identifier
  capabilities: string[]    # what this agent can do
  endpoint: URI | null      # optional — transport agnostic
  reputation: float | null  # optional — emergent from history
```

Agent interaction follows one primitive:

```
REQUEST → RESPONSE → OPTIONAL CONFIRMATION
```

That's the entire interface. Everything else is payload.

---

## Arbitrary Payload Rule

Agents MAY attach any structured data to any state transition.

Allowed formats:

- JSON
- YAML
- Protocol Buffers (future hint)
- Custom ontology references
- Raw binary with declared MIME

**Constraint:** Payload must be hash-stampable. If it can't be hashed, it can't be verified, and it doesn't exist in this protocol.

---

## Communication Layer

`arbitrage.md` does NOT mandate transport.

Compatible protocols include:

- REST / HTTP
- WebSockets
- MCP tool calls
- A2A agent messaging
- Webhooks
- P2P swarm gossip
- OpenClaw-style legal contracts
- Future unknown protocols

**Requirement:** Messages must contain:

```yaml
message:
  timestamp: ISO-8601
  from: agent_id
  to: agent_id | BROADCAST
  type: DISCOVER | PROPOSE | CLAIM | LOCK | EXECUTE | VERIFY | SETTLE | LOG
  payload: any
  payload_hash: SHA-256
  signature: optional
```

If a transport can carry this shape, it is compatible.

---

## Micro-Arbitrage Rule

The protocol MUST support:

- Sub-dollar settlements
- High-frequency opportunity claims
- Multi-agent split execution
- Fractional spread capture

Think: millions of agents doing $0.02 optimization loops. The grammar scales down to dust-sized transactions and up to nation-state logistics. No minimum. No maximum.

---

## Swarm Mode

Multiple agents MAY coordinate as a collective entity.

```
swarm:
  swarm_id: string
  members: agent_id[]
  role: broker | optimizer | auditor | logistics | custom
  identity: emergent
```

Examples:

- **Broker swarm** — surfaces and matches opportunities
- **Optimizer swarm** — routes logistics, minimizes cost/time
- **Audit swarm** — verifies merkle integrity, flags anomalies
- **Logistics swarm** — coordinates physical or digital transfer

Swarm identity is optional and emergent. A swarm is just agents that choose to act together.

---

## Verification Layer (Abstract)

This protocol does not hardcode a trust mechanism. Implementers MAY use:

- Merkle stamping
- Digital signatures (Ed25519, ECDSA, etc.)
- Reputation scoring
- Consensus voting
- Legal contract enforcement
- Any combination

**The only rule:** Every state transition MUST produce a hash. That hash is the proof.

```
record:
  transaction_id: string
  timestamp: ISO-8601
  prev_hash: SHA-256
  state: DISCOVER | PROPOSE | CLAIM | LOCK | EXECUTE | VERIFY | SETTLE | LOG
  agents: agent_id[]
  payload_hash: SHA-256
  signature: optional
```

---

## Open World Assumption

The protocol assumes:

- Unknown asset classes will appear
- New negotiation forms will appear
- New settlement mechanisms will appear
- New agent types will appear
- New transport layers will appear

Therefore: **the scaffold is extensible by design.** Nothing is enumerated. Everything is composable. The grammar accepts what hasn't been invented yet.

---

## What This Covers

Because the grammar is universal, it covers every permutation:

| Domain            | Example                                          |
|-------------------|--------------------------------------------------|
| Physical goods    | Surplus inventory → buyer at better price         |
| Compute           | Idle GPU cluster → agent needing inference         |
| Finance           | Cross-exchange spread capture                      |
| APIs              | Cheaper endpoint discovery and routing             |
| Labor             | Skill surplus matched to demand                    |
| Storage           | Unused capacity brokered to overflow demand        |
| Swaps             | Agent A has X, Agent B has Y, mutual benefit       |
| Future assets     | Whatever comes next — the grammar doesn't care     |

---

## Crypto Stamp Registry

| #   | Timestamp              | Hash                                                             | Event   |
|-----|------------------------|------------------------------------------------------------------|---------|
| 0   | 2026-03-05T01:47:57Z   | 84da8014f3300d45190d26a5c0635e18704daa8320b626e7e03119308f423405 | GENESIS |

---

## Protocol Reference

```
PROTOCOL:     arbitrage/v0.1
NETWORK:      arbengine
REPOSITORY:   https://github.com/arbengine/arbitrage
SCAFFOLD:     ARBITRAGE.md (this document)
GENESIS:      2026-03-05T01:47:57Z
MERKLE_ROOT:  84da8014f3300d45190d26a5c0635e18704daa8320b626e7e03119308f423405
```

---

**Maintainer:** `proofmdorg@gmail.com`
**Protocol:** `arbitrage/v0.1` — part of the [`protocols.md`](https://protocols.md/) network
