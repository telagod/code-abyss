# Expert Tool Authority And Boundaries

Use this reference when the AI system will call tools and the main risk is what those tools let it do.

## Core rules

- every tool grants a form of authority
- read, write, and execute powers should be separated where possible
- tools should return artifacts the system can verify
- unbounded tool authority turns agent mistakes into system incidents

## Strong questions

- what authority each tool grants
- what should require explicit confirmation or policy gates
- how to distinguish observation tools from mutation tools
- how to keep tool contracts inspectable and auditable

## Control rules

- read, write, and execute powers should be separable where possible
- tool contracts should return verifiable artifacts, not only success text
- destructive or costly tools should expose stronger policy boundaries than read-only tools
- authority should be mapped to task class, not granted because the tool exists

## Output contract

Leave behind:

- tool authority map
- confirmation policy
- audit surface
- mutation risk notes
