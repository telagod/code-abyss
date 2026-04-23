# API Boundaries And Data Flow / API 边界与数据流

## 1. Boundaries Must Follow Ownership

A clean boundary usually aligns with:

- business responsibility
- data ownership
- deployment ownership
- change cadence

If the boundary exists only because the tech stack changed, it is probably weak.

## 2. API Design Questions

- who owns the contract
- what is stable
- what is derived
- what consistency is expected
- what errors are meaningful

## 3. Data Flow Questions

- where is data created
- where is it transformed
- where is it cached
- where is it consumed
- where can it be replayed or corrected

## 4. Review Questions

- are there duplicate ownership claims
- is one API acting like a dump pipe
- what happens when upstream shape changes
