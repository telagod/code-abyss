# Interpreting Change Warnings / 变更告警解读

## 1. Warning Types

- code changed without tests
- code changed without docs
- config changed without operational notes

## 2. Do Not Treat Every Warning As A Blocker

Some warnings indicate:

- low-risk local changes
- exploratory work
- docs/test updates that belong in a later patch

Others indicate real release risk.

## 3. Review Questions

- what user or operator risk does this warning imply
- should it block commit, merge, or only trigger review
