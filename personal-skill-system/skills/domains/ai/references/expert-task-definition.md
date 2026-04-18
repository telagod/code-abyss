# Expert Task Definition

Use this reference when the hardest part is naming the AI task precisely enough that later prompt,
retrieval, or agent work does not solve the wrong problem.

## Core rules

- define the user-visible outcome before the model behavior
- separate task intent from output format
- identify what should definitely count as success and failure
- pin down whether the system is answering, deciding, transforming, or acting

## Strong questions

- what exact user decision or action improves if this system works
- what wrong answer is unacceptable even if it sounds plausible
- what ambiguity should be resolved upstream instead of left to the model
- what part of the task is deterministic versus judgment-heavy

## Common failure shapes

- a classification task disguised as open-ended generation
- an action task treated as only a drafting task
- an information-retrieval problem mislabeled as reasoning failure
- a workflow problem flattened into one prompt

## Output contract

Leave behind:

- task label
- success definition
- unacceptable failure definition
- boundary between deterministic and model-driven work
