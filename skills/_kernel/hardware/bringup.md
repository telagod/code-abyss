# Bring-up & debug — the physical world doesn't have a stack trace

Iteration is the scarce resource: a code change costs seconds, a board respin costs
weeks. Everything here spends design-time cents to save debug-time weeks.

## 1 · Bring-up is designed BEFORE layout

Every board, including "final" ones, carries: test points on every rail and every bus;
a way to measure current per rail (0Ω jumper or shunt footprint); UART console pads; one
LED on a spare GPIO; and the programming/debug header — production units WITHOUT a
programming path are bricks-in-waiting. If a net can't be probed, it can't be debugged.

## 2 · Power before smoke

First power-up ritual, every new board: current-limited bench supply set to expected
current +20%; verify every rail's voltage BEFORE seating or enabling the expensive
parts; watch the current meter (a rail at 10× expected current is a solder bridge
announcing itself); first minutes get the finger/thermal check for anything heating.

> ✅ Rail check found 3.3V reading 1.7V — a short caught at the bench supply's 50mA limit.
> ❌ Full battery straight onto the fresh board: the same short is now a burned trace
> and a dead MCU, and you no longer know if the design ever worked.

## 3 · Stage by stage, one variable at a time

Bring up in layers: power rails → MCU alive (blink + console banner) → each peripheral
ALONE → integration. When debugging, change ONE thing per cycle and keep a written
table: change / expected / observed (`methods/investigate.md` §6 discriminating-test
discipline; the written table is this bundle's addition — each row here costs a flash
cycle, so it pays faster). Two changes at once that "fix it" teach you nothing and
will regress.

## 4 · Instruments answer different questions — and you can't see the board

Multimeter = DC truth (rails, continuity) · scope = analog truth (rail dips during TX,
signal integrity, timing) · logic analyzer = protocol truth (what bytes actually
crossed the bus) · printf = logic truth (which branch ran). Pick by question class;
"is the rail stable during transmit" is a scope question no amount of printf answers.

**You (the model) cannot see the board.** Never diagnose from "it doesn't work" — run
the interrogation: What changed most recently? Does it reset or hang (what does the
reset-cause register say — `firmware.md` §4)? Rail voltages at the failure moment, under
load? Fails cold, warm, or always? Photo of the board, scope shot at a named trigger
point. Demand measurements before theories; a diagnosis without a measurement is a
guess wearing a lab coat.

## 5 · Differential diagnosis across the four domains

The failure is firmware, electrical, thermal, or mechanical — each has signatures:
- Fails after N minutes of running → thermal (heat it with a hairdryer to confirm in
  seconds instead of waiting).
- Fails when the motor/radio kicks in → brownout or EMI (`circuits.md` §1; scope the
  rail at that moment).
- Fails with the long cable but not the short one → signal integrity or ground offset.
- Fails "randomly" → read the reset-cause register first; then suspect the connector
  (wiggle test) before suspecting the silicon.
- Works when touched with a probe → floating input or marginal timing; the probe's
  capacitance is your clue, not your fix.

## 6 · "Works on my bench" is not a result

The field differs from the bench in exactly the ways that break marginal designs. Before
calling it done: vary supply voltage ±10%; run it cold and hot (freezer bag, hairdryer);
use the real cable lengths; run it next to its own motor/radio at full power; and soak
it for 72 hours logging faults. Outdoor products additionally get humidity +
temperature *cycling* (condensation lives in the cycle, not the endpoints —
`circuits.md` §8), and radio products get a range/link-margin test at realistic
deployment distance and mounting, IN the final enclosure, before committing to volume
(the enclosure detunes the antenna exactly there). Most field failures live inside
these margins — and every one found on the bench is 100× cheaper than the same one
found deployed (`methods/verify.md`: run the real journey, not the demo).

## 7 · From pilot to production — units you'll never touch

Ordering volume (50+ units) is a different discipline from the pilot:

- **Design for the jig:** test points on a grid, pogo-pin reachable — the factory test
  fixture is designed WITH the board, not after it.
- **Scripted per-unit functional test** (rails, current draw, sensor read, radio join)
  with pass/fail limits taken from pilot measurements, not from hope.
- **Provisioning is a manufacturing workflow, not a firmware afterthought:** every unit
  needs its unique IDs/keys/calibration constants injected at the factory AND logged to
  a device registry — decide the workflow before the panels arrive.
- **First-article inspection** against the pilot golden unit; then track yield and
  failure modes per batch — a 4% yield drop is a process regression announcing itself.
