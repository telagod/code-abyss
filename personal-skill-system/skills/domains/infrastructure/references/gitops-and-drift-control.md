# GitOps And Drift Control / GitOps 与漂移控制

## 1. Desired State Must Be Explicit

GitOps only works if:

- the desired state is complete enough
- the reconciler is trusted
- manual drift is considered a fault, not a convenience

## 2. Promotion Flow

A sane flow usually has:

1. change proposed in Git
2. validation gate
3. merge
4. reconcile in target environment
5. verify runtime state

Skipping step 5 makes GitOps a false comfort.

## 3. Drift Sources

- manual kubectl hotfixes
- console-side cloud edits
- mutable chart values with no review path
- secrets changed outside the expected pipeline

## 4. Drift Policy

Choose one and state it:

- auto-correct drift
- alert-only drift
- block promotion on drift

The wrong policy is usually “we did not define one.”

## 5. Review Questions

- what is the source of truth
- who can bypass Git
- how is secret drift handled
- what happens when reconcile fails
- how is environment promotion audited
