# Circuits — electrical design rules that survive contact with physics

Software fails logically; circuits fail analogically — marginally, thermally,
occasionally. The rules below are margins, and margins are the product.

## 1 · Power first, and budget the PEAKS

Design the power tree before the block diagram. Budget every rail with **peak** current,
not average: radios pulse (a WiFi TX burst draws 400mA+ for milliseconds), motors stall
(stall current is 5–10× running current), flash writes spike. The #1 cause of "random
resets" is a brownout during a peak the average-based budget never saw.

- LDO vs buck: LDO heat = (Vin − Vout) × I. More than ~0.3W of that → buck.
- LDO dropout is real: a "3.3V" LDO with 0.3V dropout dies when a Li-ion battery sags
  below 3.6V under TX load — which it will.
- Bulk capacitance physically NEXT TO pulse loads (radio, motor driver): 100–470µF.
- Multiple rails → check sequencing requirements in every datasheet that uses two.

> ✅ ESP32 node: 3.7V cell → buck to 3.3V rated 1A (peak budget 600mA), 220µF at the
> module — noting a plain buck itself drops out below ~3.4V of battery: accept graceful
> end-of-discharge sag and set the brownout cutoff accordingly, or use a buck-boost if
> full regulation to 3.0V is required. ❌ Same node on a 200mA LDO because "average is
> 80mA" — resets on every TX.

When sleep current IS the product (battery life measured in years), audit every
always-on path line by line: regulator Iq, charger Iq, battery-sense dividers (gate
them behind a FET or use MΩ values + a buffer), pull-ups, status LEDs, sensor bias.
A permanently-connected 100kΩ battery divider on a 4V cell = 40µA — more than the
MCU's entire deep sleep. Anything not on the list is a discharge you didn't budget.

## 2 · Derate everything

Run parts at a fraction of their rating: voltage on capacitors ≤50–80% of rated
(electrolytics ≤80%; Class II ceramics (X5R/X7R) ≤50% — their DC-bias capacitance loss
is severe, especially X5R in small packages, so check the vendor's capacitance-vs-bias
curve; C0G/NP0 is Class I, stable, and needs no DC-bias derating), resistor power ≤50%,
semiconductor junction temp calculated (not assumed) for anything dissipating >0.5W:
Tj = Tambient + P × θJA (θJA from the datasheet's thermal table, Tambient the worst
case, not 25°C) — keep Tj below the datasheet max with ≥20°C margin. A part at 95% of
its rating works on the bench and dies in the field summer. If you didn't compute the
worst case, the field will.

## 3 · Every external pin will be abused

Assume every connector pin gets hot-plugged, shorted to ground, shorted to supply, and
wired backwards — because over the product's life, it will. Power input: reverse-polarity
protection (P-FET, not a lossy diode at high current) + fuse/polyfuse. Signal pins that
leave the board: TVS diode + series resistance. Anything a human touches: ESD rated.
Connectors keyed so backwards doesn't fit.

## 4 · Decoupling and return paths

- 100nF ceramic at EVERY power pin, closest component to the pin; bulk (≥10µF) per rail.
- Ground is a return **path**, not a label: current flows in loops — keep the loops
  small, especially around switching regulators and crystals. A split or detoured
  return path is an antenna.
- Analog hygiene: separate analog signals from switching noise by geometry, filter the
  ADC reference, and respect the datasheet's source-impedance limit for the ADC.
- Crystal load capacitors: calculated from the crystal's CL spec and stray capacitance,
  not copied from an unrelated design — each cap = 2 × (CL − Cstray), Cstray ≈ 3–5pF of
  pin + trace; e.g. CL = 12pF → two 18pF caps.

## 5 · Interface selection and their non-negotiables

| Bus | Use for | The rule people skip |
|---|---|---|
| I2C | low-speed on-board sensors | needs pull-ups: 4.7kΩ default at 3.3V/100kHz; toward 2.2kΩ for 400kHz, many devices, or long traces; toward 10kΩ only when battery-critical at low speed; unreliable past ~1m of cable |
| SPI | fast on-board peripherals | one CS per device; check mode (CPOL/CPHA) per datasheet |
| UART | logs, consoles, simple links | cross TX/RX (yes, still); common ground required |
| RS-485 / CAN | anything between boards or >1m in a noisy world | differential + termination resistors at BOTH ends |
| RF / antenna | any radio | the antenna datasheet's ground plane + keep-out are contract terms (`parts.md` §4); module certification is conditional on the tested antenna; an external antenna port gets surge/ESD protection like any pin leaving the board; the enclosure is part of the antenna |

Never assume 5V-tolerance — check the pin, level-shift when mixing rails.

## 6 · The unpopulated insurance policy

On every prototype: 0Ω jumper footprints to break circuits for current measurement,
optional pull-up/pull-down footprints on strappable pins, RC filter footprints on
suspect signals, and a spare GPIO broken out to a pad. Populate only what bring-up
proves you need. Footprints cost cents; a respin costs weeks (`bringup.md` §1).

## 7 · Battery systems — the rules that keep cells alive (and safe)

If the product has a rechargeable Li-ion/LiPo cell (`parts.md` §1.3), these are floors:

- **Protection is mandatory:** a protected cell or a protection IC (over-discharge,
  over-charge, short). A bare cell on a charger IC with no discharge cutoff will
  deep-discharge to death — or to a hazard — during the first long idle period.
- **Never charge below 0°C** (lithium plating). Outdoor or cold-storage product → the
  charger must have an NTC-qualified charge window; reject charger ICs with no
  thermistor pin for those products.
- **Map the discharge curve against regulator headroom:** state what fraction of the
  cell's capacity is actually reachable above your regulator's minimum input — that
  number, not chemistry preference, drives buck vs buck-boost vs lower-rail.
- **Define the low-battery behavior in firmware:** a load-shed/cutoff voltage and what
  gets turned off, not just a telemetered number nobody acts on.
- **Solar input:** panel open-circuit voltage RISES in cold — check the charger's input
  max against cold-morning Voc, clamp/OVP if it's close.

## 8 · Outdoor and enclosure — the environment is a circuit component

- **Sealed enclosures breathe:** daily thermal cycling pumps humid air in and dews it
  onto the PCB — a leading killer of multi-year outdoor electronics. Fit a vent
  membrane (Gore-type) or conformal-coat the board; assume condensation happens.
- Connectors exit downward with drip loops; enclosure material UV-rated.
- **Internal temp = ambient + solar gain:** a dark box in sun runs 20–30°C above
  ambient — feed THAT into §2 derating and into battery calendar-life, not the weather
  report's ambient.
- Validation must include humidity + temperature *cycling*, not just hot/cold endpoints
  (`bringup.md` §6).
