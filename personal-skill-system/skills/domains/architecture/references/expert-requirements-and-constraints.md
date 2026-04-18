# Expert Requirements And Constraints

Use this reference when architecture quality depends on getting the pressure model right before
discussing tools or patterns.

## First separate three layers

- business problem
- system problem
- technical problem

Do not let one layer pretend to solve another.

## Constraint framing

Force out:

- user path and business deadline
- latency, throughput, and growth assumption
- consistency requirement
- availability target
- compliance or data-classification constraint
- team capability and staffing limit
- migration and rollback tolerance
- explicit cost ceiling

## Strong questions

- what fails first if demand jumps 10x
- which decision is expensive to reverse
- what can remain simple for the next 6-12 months
- which constraint is real versus imagined future-proofing

## Output contract

Leave behind:

- functional pressure
- non-functional pressure
- hard constraints
- soft preferences
- irreversible assumptions

