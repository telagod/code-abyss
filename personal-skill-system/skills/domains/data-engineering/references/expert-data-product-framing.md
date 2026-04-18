# Expert Data Product Framing

Use this reference when the first mistake would be building a pipeline before naming the data product.

## Core rules

- start from the business question or downstream action
- freshness is a product requirement, not a default
- one metric should have one declared source of truth
- consumers and producers should be named explicitly

## Strong questions

- who will use the output and for what decision
- what lateness is acceptable
- what level of correctness is required
- what breaks if the dataset is wrong or late

## Common framing failures

- building a pipeline before naming the consumer and decision
- treating freshness as a vanity goal instead of a business need
- allowing several sources of truth for one critical metric
- assuming data quality can be retrofitted after trust is lost

## Output contract

Leave behind:

- data product name
- producer and consumer map
- freshness target
- source-of-truth statement
- correctness risk
