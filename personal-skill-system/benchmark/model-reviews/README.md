# Model Reviews

This folder stores model-level project reviews.

These are not benchmark task runs.

Use `benchmark/runs/` for scored task execution.
Use this folder for model diagnoses such as GLM, GPT-5.4, Claude, or Gemini project reviews.

Required files:

- `model-review.schema.json`
- one `*.review.json` file per imported model review

Rules:

- keep raw source docs immutable
- record confirmed and corrected findings separately
- link every actionable finding to task cards
- do not use these records as direct top-tier proof

