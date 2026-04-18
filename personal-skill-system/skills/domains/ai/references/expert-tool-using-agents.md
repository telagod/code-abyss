# Expert Tool Using Agents

Use this reference when the system is not just answering once but acting, verifying, or iterating.

## Core rules

- tool use must have explicit trust boundaries
- agents should act only where rollback or correction is understood
- structured intermediate state beats hidden chain-of-thought guesses
- retries and replanning should be bounded

## Strong questions

- what authority each tool grants
- what the agent may read, write, or execute
- what artifact proves a step succeeded
- what should force the agent to stop rather than continue guessing

## Output contract

Leave behind:

- tool boundary map
- action loop shape
- verification step
- stop conditions

