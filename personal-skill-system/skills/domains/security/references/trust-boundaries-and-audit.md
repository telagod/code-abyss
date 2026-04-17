# Trust Boundaries And Audit / 信任边界与审计

## 1. Start With Entry Points

List every untrusted entry:

- user input
- file input
- network input
- environment variables
- webhook payloads
- database content from external writers

Everything downstream of these is a candidate sink path.

## 2. Audit Model

For each path, ask:

- where does data enter
- how is it validated
- where is it transformed
- where does it reach a sensitive sink
- what trust assumption is being made

## 3. Sensitive Sinks

- SQL execution
- shell execution
- file path resolution
- HTML rendering
- outbound network requests
- authz decisions

## 4. Review Questions

- where does trust shift
- what assumptions are implicit
- what sink could cause the highest blast radius
- is validation close enough to the source
