# protocols.md

> Network specification and routing rules for the Arbitrage protocol.

---

## Network

```
PROTOCOL:     arbitrage/v0.1
NETWORK:      arbengine
REPOSITORY:   https://github.com/arbengine/arbitrage
MAINTAINER:   proofmdorg@gmail.com
```

## Routing

| Route                  | Handler          | Description                          |
|------------------------|------------------|--------------------------------------|
| `/discovery/price`     | PriceAgent       | Price feed ingestion and alerts      |
| `/discovery/capacity`  | CapacityAgent    | Capacity post board                  |
| `/discovery/registry`  | RegistryAgent    | Agent registration and lookup        |
| `/execution/acquire`   | AcquisitionAgent | Buy-side workflow orchestration      |
| `/execution/dispose`   | DispositionAgent | Sell-side workflow orchestration      |
| `/execution/exchange`  | ExchangeAgent    | Peer-to-peer swap coordination       |
| `/settlement/verify`   | VerifyAgent      | Merkle verification and stamping     |
| `/settlement/finalize` | SettleAgent      | Settlement finalization              |
| `/settlement/audit`    | AuditAgent       | Append-only audit trail              |

## Versioning

- `v0.1` — Genesis scaffold, markdown-based coordination
- Future versions may introduce binary serialization, on-chain anchoring, and multi-network bridging

## Maintainer

```
NAME:    proofmdorg
EMAIL:   proofmdorg@gmail.com
ROLE:    Network maintainer
```

---

Part of the [Arbitrage Protocol](./ARBITRAGE.md) — [github.com/arbengine/arbitrage](https://github.com/arbengine/arbitrage)
