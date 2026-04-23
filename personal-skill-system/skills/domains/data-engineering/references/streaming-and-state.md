# Streaming And State / 流处理与状态

## 1. Use Streaming Only When It Pays

Choose streaming when one of these is true:

- freshness drives user or system value
- event order matters to downstream behavior
- large-scale incremental processing is cheaper than repeated full scans
- you need event-time semantics rather than batch snapshots

Do not choose streaming because it sounds modern.

## 2. Key Concepts To Surface

- event time vs processing time
- late data policy
- watermark strategy
- deduplication key
- state retention window
- replay behavior

If a design omits these, it is incomplete.

## 3. State Boundaries

State in stream processors should be:

- scoped
- observable
- recoverable
- bounded by retention

Unbounded state without explicit eviction is a hidden outage.

## 4. Delivery Semantics

Treat exactly-once carefully.

- at-most-once: may lose data
- at-least-once: may duplicate data
- exactly-once: only meaningful when the whole chain supports it

In practice, business-level idempotency is often safer than marketing-grade exactly-once claims.

## 5. Practical Decision Matrix

- alerts and near-real-time counters: streaming can fit
- finance-grade monthly close: batch often safer
- user activity enrichment with minutes-level freshness: micro-batch may be enough
- online control loops: streaming likely required

## 6. Review Questions

- what is the event key
- what is the replay story
- how is state recovered after restart
- what is the policy for late and duplicate events
- how is correctness tested against historical data
