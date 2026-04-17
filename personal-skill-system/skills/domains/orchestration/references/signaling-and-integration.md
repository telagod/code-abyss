# Signaling And Integration / 信号传递与集成

## 1. Coordination Needs Explicit Signals

Every collaborative stream should communicate:

- what it owns
- what it changed
- what it expects from others
- what is blocked
- what remains risky

## 2. Useful Signal Types

- discovery: facts and important files
- progress: what is already changed
- warning: risk or mismatch
- completion: done with validation evidence
- repellent: path known to fail, avoid repeating

## 3. Integration Rules

- integrate at clear checkpoints
- review combined behavior, not only per-stream output
- preserve one final owner for merge decisions

## 4. Review Questions

- can someone reconstruct state without rereading every file
- are blockers visible early enough
- does completion include validation evidence
- who decides on conflicting implementations
