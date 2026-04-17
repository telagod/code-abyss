# RAG And Context Engineering / RAG 与上下文工程

## 1. Retrieval Is Not Just Search

Good retrieval requires:

- chunking that preserves meaning
- metadata that helps filtering
- ranking tuned to the task
- context assembly that avoids duplication

## 2. Context Budget Rules

- lead with the most decision-relevant evidence
- avoid flooding the model with adjacent but irrelevant text
- separate instructions from evidence

## 3. Review Questions

- what evidence is actually needed
- what retrieval failure hurts most
- what context is missing vs excessive
