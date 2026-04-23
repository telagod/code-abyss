# Expert Agent Loop And State Control

Use this reference when the challenge is not one call, but an iterative agent loop with planning, memory, and stopping rules.

## Core rules

- hidden state should be treated as a risk surface
- loops need explicit stop conditions
- retries and replanning should be bounded by evidence, not hope
- intermediate artifacts beat opaque internal guesses

## Strong questions

- what the loop is allowed to remember
- what should trigger replanning versus stop
- how progress is proven between steps
- how runaway loops are prevented

## Loop design rules

- every loop needs explicit stop, retry, and escalation conditions
- internal state should be reconstructable from artifacts when possible
- replan only on evidence, not on repeated failure alone
- the system should know when to ask for help rather than continue exploring

## State surfaces

Track explicitly:

- goal state
- working memory
- external artifacts
- retry counters
- authority consumed so far

## Control heuristics

- retries should narrow uncertainty, not only repeat the same action
- replanning should happen after new evidence, not after frustration
- hidden mutable state should be minimized when actions can change the world
- long loops should emit operator-visible progress signals

## Failure modes

- loop continues because no stop condition was modeled
- agent forgets what authority it already used
- state becomes inconsistent across retries
- replanning keeps broadening scope instead of converging

## Output contract

Leave behind:

- loop phases
- state model
- stop rule
- retry and replan triggers
- escalation trigger

## Output contract

Leave behind:

- state model
- stop rules
- retry rules
- escalation trigger
