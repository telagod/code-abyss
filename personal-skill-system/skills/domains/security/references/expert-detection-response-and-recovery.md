# Expert Detection, Response, And Recovery

Use this reference when security quality depends on what happens after prevention fails.

## Core rules

- critical assets need detection, response, and recovery plans in addition to prevention
- operator signal should shorten triage time
- response playbooks should be concrete enough for real incidents
- recovery should include authority reset, not just service restart

## Strong questions

- what signal indicates a real compromise
- who responds first
- what can be isolated or revoked quickly
- what recovery evidence proves the incident is closed

## Response rules

- critical assets need detection, response, and recovery plans in addition to prevention
- response playbooks should optimize time-to-isolate
- recovery should include authority reset, not only service restart
- operator signals should distinguish compromise from ordinary failure where possible

## Response ladder

Think in stages:

1. detect
2. confirm
3. contain
4. eradicate
5. recover
6. learn

## Strong questions

- what signal starts the incident
- what evidence confirms it is real
- what can be isolated immediately
- what authority must be rotated or revoked
- what proves recovery, not just temporary quiet

## Failure modes

- prevention exists but detection is weak
- response playbook assumes facts nobody can verify quickly
- service restarts happen without authority reset
- incident is closed before integrity or trust is re-established

## Output contract

Leave behind:

- trigger signal
- first containment move
- authority reset path
- recovery proof
- post-incident learning hook

## Output contract

Leave behind:

- detection signal
- first-response action
- isolation or revocation path
- recovery proof
