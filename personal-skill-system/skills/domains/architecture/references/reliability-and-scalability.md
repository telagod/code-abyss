# Reliability And Scalability / 可靠性与扩展性

## 1. Name The Pressure

Do not say “scale” vaguely. Name:

- traffic growth
- data growth
- fan-out
- tail latency
- failure rate

## 2. Reliability Controls

- timeout
- retry
- idempotency
- circuit breaker
- queueing
- cache fallback

## 3. Scaling Controls

- horizontal stateless scale
- asynchronous offload
- partitioning
- precomputation
- caching

## 4. Review Questions

- what fails first under load
- what is the blast radius of dependency failure
- which control prevents cascading failure
- what metrics prove the design works
