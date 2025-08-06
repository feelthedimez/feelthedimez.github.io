---
layout: post
title: "Where QA Fits in Web3: A Beginner-Friendly Deep Dive"
date: 2025-08-05 10:00:00 +0200
tags: [Blockchain, Web3]
archive: false
permalink: /:title
featured_img: assets/img/featured-img-qa-in-web3.png
---

![Featured Image]({{page.featured_img | relative_url}})

If you've ever wondered what it really means to test a blockchain project; beyond clicking buttons in decentralized apps or checking if the smart contract is deployed. There's more to it than what we see in the surface.

QA in Web3 isn't about contracts, and MetaMask popus. It's about verifying decentralised systems, authenticating cryptographic identities, and making sure nodes don't just exist, but behave correctly. It's not for the faint of heart, and also not as complex as you think.

Let me walk you through how I led QA within a blockchain product, approached testing blockchain systems, especially Ethereum-based ones.

## What Makes QA in Blockchain Different?

In Web2, if something goes wrong, you can roll back a release, fix the DB, and move on.

In blockchain?

- Smart contract are immutable - you deploy wrong, it stays wrong, forever.
- Nodes run in distributed networks
- Everything is signed, hashed and verified - if you don't understand cryptographic flows, you're guessing
- Not everything has a UI - you’ll often work with executables, CLI tools, and low-level logs.

This changes how QA fits into the picture. It's not just "does it work?", it's "does it behave correctly across multiple peers, states, and cryptographyic boundries?"

## What are we really testing?

A commong misconception I discovered while I was doing research for this project: _QA in blockchain = testing smart contracts, dApps, MetaMask integration_. It's more layered than that.

Smart contracts are important, yes, but in a real blockchain system, you're dealing with multiple layers. Each one requires its own testing strategy.

### 1. Execution Layer (e.g., Reth, Geth, etc.)

This is the engine that processes transactions and maintains chain state. Tests here include:

- Validating the block height increases over time
- Ensuring logs emit on state changes
- Testing JSON-RPC endpoints

In short: this is the source of truth.

### 2. Consensus Layer (e.g. Lighthouse, Ethereum PoS, your own custom consensus)

This is where nodes decides what's true. You're testing:

- Peer discovery (are nodes finding each other via discovery secrets?)
- Gossip propagation (does a block shared by one peer reach the others?)
- Secure communication (are invalid JWTs rejected?)
- Transaction validation performance

### 3. Smart Contracts

Still critical, but not the only this. Here, you focus on:

- Unit tests for business logic (e.g., minting, burning, ownership)
- Negative testing (what must never happen)
- Fuzz testing to expose unexpected behaviour (mostly distruption testing)

### 4. dApp and Wallet Flows

This is the UI layer, but tightly coupled to wallet behaviour

- Can users sign a transaction?
- Does MetaMask or WalletConnect fail gracefully?
- Are transaction statuses reflected accurately in the UI?

### 5. Node Infrastructure

This is where we flourished. What happens if node falls over syncing issues? What happens? Is there a restart strategy? Will it be able to know the current state?

- Start-from-genesis tests (does node sync from block 0)
- Restart tests (is the state persisted or reloaded correctly?)
- Is block production & propegation working properly?

## Performance Testing: Simulating Real Chain Load

Performance testing was crucial. We needed to understand how our blockchain handled real-world traffic—from basic syncing to full-on transaction spam.

We simulated between 1 000 - 10 000 users per second using Python load generators, validating node responsiveness and stability under each scenario. We also tracked CPI, memory, disk I/O, and sync lag under stress.

All of this was executed on a single machine with limited resources, and yet the system performed exceptionally well—holding up under significant load before showing signs of delay or degradation.

Now, imagine this is real life, with more than 100k nodes, and peers? This is peak performance.

| Metric                      | 1k Users/s | 5k Users/s | 10k Users/s   |
| --------------------------- | ---------- | ---------- | ------------- |
| Avg Trans Latency (ms)      | 213        | 410        | 870           |
| Block Propagation Delay (s) | ~1.1       | ~2.7       | ~4.9s         |
| CPU Usage (Node Processes)  | ~65%       | ~89%       | 100% (pegged) |
| Memory Usage (GB)           | 1.4        | 3.3        | 6.7           |
| Sync Lag (under stress)     | ~3 blocks  | ~15 blocks | ~52 blocks    |

At 10K users/sec, the node could no longer maintain real-time sync, and consensus delays began to surface. Not catastrophic, but enough to simulate congestion and fork risk. (this is from a Macbook Air, m1 with 16GB ram).

In one of our production-scale releases, we ran the performance suite under realistic configurations and observed consistent outcomes:

- Block production remained stable under bursts of up to 9,000 transactions/second
- Transaction latency remained within the expected 800–950 ms range
- Syncing kept up with the chain with a margin of error under 60 blocks, even under stress

These results were consistent with previous controlled experiments, further validating the robustness of the node implementation and consensus layer under high concurrency and resource strain.

## Testing Types That Matter

The category on all kinds of QA you'll likely write:

| Test Type      | What You’re Validating                                |
| -------------- | ----------------------------------------------------- |
| Functional     | Block processing, RPC return values, state mutations  |
| Security       | Signature validation, replay protection, auth flows   |
| Syncing        | Node catching up from genesis or checkpoint           |
| Infrastructure | Log correctness, container behavior, crash resilience |
| Behavioral     | Consensus logic under multiple peer simulations       |
| Performance    | How does the node perform under different conditions  |

Example from my work: I wrote tests that confirmed a node only joined the network if it had a valid `discovery-secret` and could establish a JWT-authenticated handshake. You’d be surprised how many times that failed because of a small misconfig or bad keypair.

## Tooling Thats Kept Us Sane

You'll need a blend of blockchain-native tools and general purpose test frameworks.

What's been useful in my stack:

- Python - it can interact with i/o executables and get output streams with its subprocess module.
- Python's web3 module
- Fountry - contract testing, creating transaction, and signing them
- Pytest - for CLI, logs, and API testing
- Github Actions - CI Pipelines testing

Want a pro tip? Logs are your friend. I’ve written tests that pass/fail based on whether expected log entries appear in the right order. In blockchain, logs are sometimes your only window into whether consensus is happening.

## Final Thoughts

QA in blockchain isn’t about pixel-perfect UIs. It’s about trust. It’s about making sure the distributed system behaves exactly as intended, across time, space, and cryptographic boundaries. You’ll need development experience, an eye for test edge cases, and a willingness to explore low-level behavior.

It’s not easy. But it’s necessary. 

AND PLEASE, DON'T BUILD IN RUST! 😂
