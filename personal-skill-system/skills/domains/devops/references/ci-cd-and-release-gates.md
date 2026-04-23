# CI/CD And Release Gates / CI/CD 与发布关卡

## 1. Pipeline Purpose

A pipeline should answer:

- did the change build
- did the change break a contract
- did the change violate policy
- is the artifact releasable

If it answers none of these clearly, it is theater.

## 2. Good Gates

- deterministic
- relevant
- fast enough to trust
- tied to actual risk

## 3. Release Questions

- what must pass before merge
- what must pass before deploy
- what is optional for exploratory work
- what blocks production rollout

## 4. Review Questions

- which gate catches which failure class
- what is noisy and why
- what is still untested at deploy time
