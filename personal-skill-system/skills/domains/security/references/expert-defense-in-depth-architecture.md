# Expert Defense In Depth Architecture

Use this reference when the security question is architectural rather than only bug-class specific.

## Core rules

- layers should fail independently
- internal boundaries still need trust decisions
- prevention, detection, and recovery should all exist for critical assets

## Watch for

- one control doing all the work
- perimeter trust assumptions inside distributed systems
- no operator signal when preventive controls fail

