# Expert Operating Principles

Use this reference when quality scanning should guide maintainability judgement rather than emit
shallow style noise.

## Core rules

- complexity matters when it obscures reasoning or safe change
- size matters when it hides several concerns in one unit
- language-specific smells are more valuable than generic line counting alone
- warning quality matters more than warning volume

## Strong outputs

A quality scan should identify:

- oversized files
- oversized units
- complexity hotspots
- language-specific smells
- maintainability risk concentration

