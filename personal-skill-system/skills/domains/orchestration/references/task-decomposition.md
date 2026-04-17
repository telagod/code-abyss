# Task Decomposition / 任务拆解

## 1. Decompose By Boundary

Prefer these orders of decomposition:

1. by independent ownership
2. by subsystem boundary
3. by pipeline stage
4. by file count only as a last resort

## 2. Good Split Signals

- separate modules
- separate runtime concerns
- independent validation paths
- low shared context

## 3. Bad Split Signals

- two workers need to edit the same core abstraction
- one task depends on details the other has not decided yet
- the split only exists to create artificial parallelism

## 4. Practical Templates

- frontend vs backend
- parser vs validator vs renderer
- data model vs storage adapter vs API layer
- discovery vs implementation vs review

## 5. Review Questions

- what is the ownership boundary
- what outputs are expected from each stream
- what is blocked on what
- where will integration occur
