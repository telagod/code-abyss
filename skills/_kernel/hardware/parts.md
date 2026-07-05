# Parts — choosing components by scenario, not by spec-sheet seduction

A part choice is a bet on availability, documentation quality, and your ability to debug
it — the headline specs are the smallest term. Interrogate before picking anything.

## 1 · The interrogation — before any part is named

1. **Volume:** 1 / 100 / 10k units are three different engineering disciplines (dev
   board / module-based board / cost-optimized chip-down).
2. **Environment:** temperature range, vibration, moisture, dust — commercial (0–70°C)
   vs industrial (−40–85°C) parts are different orders.
3. **Power source:** battery changes EVERYTHING (sleep currents, regulator choice, radio
   duty cycle). Get the power budget before the block diagram (`circuits.md` §1), and if
   the cell is rechargeable lithium, `circuits.md` §7 is a floor, not advice.
4. **Certification:** anything with a radio needs FCC/CE — a pre-certified module is
   weeks; custom RF is months and a test-lab budget.
5. **Lifecycle:** check the manufacturer's status (Active / NRND / EOL) and distributor
   stock BEFORE designing in. An unobtainable part is a worthless design.
6. **Debug capability:** does the team have a scope, a logic analyzer, JTAG experience?
   A part you can't debug is a part you can't use.

## 2 · Availability and boringness beat elegance

- **Jellybean preference:** boring, massively-stocked parts (STM32/ESP32/RP2040-class
  MCUs, 0603 passives, standard footprints) have forums, errata history, and stock.
  The elegant niche part has a datasheet and silence.
- **Second source or exit path** for every single-sourced critical part: a pin-compatible
  alternative, or a footprint that accepts two variants. Critical = any part with no
  drop-in replacement whose absence stops the build (MCU, radio module, specialty
  sensor, custom connector); jellybean passives and logic are exempt.
- **The novelty budget applies here hardest** (`backend/stack.md` §4 reasoning, same mechanism): a
  new MCU family + a new sensor + a new protocol + custom RF on one board is four
  stacked experiments — each unproven part multiplies bring-up time, not adds.

> ✅ Proven MCU + certified radio module + one new sensor = one experiment per board.
> ❌ Brand-new MCU released last quarter, no errata sheet yet, no community, chosen
> because the benchmark table wins — you are the errata sheet now.

## 3 · The module ladder — buy down the risk

Dev board → certified module → custom board carrying the module → chip-down. Move down
one rung per iteration, only when the current rung's measured limit (cost, size, power)
demands it. Chip-down RF requires volume, RF layout experience, AND a certification
budget — all three, or stay on the module.

## 4 · Datasheets are contracts whose terms live in the footnotes

- **Absolute maximum ≠ operating range.** Absolute max is where damage begins, not
  where you may run. Design inside the *recommended operating conditions* table.
- **"Typical" is marketing; design to min/max.** A typical 2µA sleep current with a
  25µA max means budget 25µA.
- **Footnotes carry the real conditions:** that 500mA output rating is at 25°C with a
  specified copper pad; that ADC accuracy assumes a specific source impedance.
- **The errata sheet is required reading** — silicon bugs are real, known, and
  documented; hours of debugging live in a PDF you didn't open.
- **Reference designs encode unstated requirements** — deviate only when you can name
  what each deviated component was doing.

## 5 · Where the model's knowledge ends

Part numbers, stock, prices, and lifecycle status churn faster than any training data:
state your part suggestions as *classes with selection criteria* ("a 3.3V buck rated
≥2× your peak current, e.g. the TPS62xx class") and tell the user to verify current
stock and status at distributors before committing a BOM line.
