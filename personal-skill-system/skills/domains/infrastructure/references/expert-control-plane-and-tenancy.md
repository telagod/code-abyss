# Expert Control Plane And Tenancy

Use this reference when the infrastructure decision is really about governance boundaries, shared risk, and who controls what.

## Core rules

- control-plane boundaries should be explicit before cluster layout
- tenancy is a security, cost, and operational question together
- shared environments should have named blast-radius assumptions
- isolation is a policy decision, not only a namespace convention

## Strong questions

- who controls shared infrastructure state
- what tenants share and what they do not
- how blast radius is limited
- what isolation promise is being made to applications or teams

## Design rules

- control-plane ownership should be visible before workload placement
- tenancy decisions affect security, cost, and operator load together
- shared infrastructure should declare the failure and privilege model explicitly
- namespace or account boundaries should not pretend to guarantee more than they do

## Output contract

Leave behind:

- control-plane owner
- tenancy model
- blast-radius assumption
- isolation guarantee
