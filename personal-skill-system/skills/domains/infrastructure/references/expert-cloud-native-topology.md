# Expert Cloud Native Topology

Use this reference when infrastructure work is about platform shape rather than local deployment syntax.

## Core rules

- control-plane and data-plane boundaries should be explicit
- environment shape should be clear before cluster layout
- tenancy and isolation decisions are first-class

## Watch for

- shared clusters with unclear blast radius
- namespace strategy standing in for real isolation
- topology chosen before workload and ownership are understood

