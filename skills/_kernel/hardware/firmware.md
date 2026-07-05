# Firmware — embedded software is backend engineering with physics attached

Everything in `backend/logic.md` applies (state machines, explicit errors, idempotent
operations); this file adds what the physical world changes. The governing constraint:
**the device runs unattended, resets are your only remote repair, and flash wears out.**

## 1 · Structure: superloop until it isn't

A non-blocking main loop of cooperating state machines handles up to ~3–5 concurrent
activities cleanly. Reach for an RTOS when hard timing and slow communication must
coexist, or the state-machine count stops fitting in one head — not because it's on the
resume. Either way: **no dynamic allocation after init** (fragmentation on a 6-month
uptime is a crash with a delay fuse), and ISRs set flags or copy bytes — never compute,
never block, never log.

> ✅ `loop { read_sensors(); update_state_machines(); service_comms(); }` — nothing blocks.
> ❌ `delay(5000)` in the main loop — the button, the watchdog, and the radio all wait.

## 2 · The watchdog is non-negotiable — and kick it honestly

Every unattended device runs a watchdog. Kick it from ONE place in the main loop, and
only after checking that every task has reported progress (a task-health bitmask each
task must set). Kicking from a timer interrupt is the classic self-defeat: the timer
still fires while the main loop is hung, and the watchdog guards nothing. Timeout =
several × the worst-case loop iteration *including the slowest legitimate operation*
(flash erase, radio connect) — typically 1–10 seconds, never milliseconds.

## 3 · Physical inputs lie

- Debounce every mechanical switch (20–50ms) — a press is a burst of edges.
- Filter every ADC reading (median-of-N or EMA) — single samples are noise.
- **Timeout every wait on hardware.** `while (!flag);` with no timeout is a hang wired
  to a loose cable. Every bus transaction gets a timeout and an error path.
- Range-check sensor values before use: an I2C sensor returning garbage after a bus
  glitch will happily report −196°C; act on it and the heater runs forever.

## 4 · Power can vanish between any two instructions

- Config/state writes are atomic: two-slot with sequence number + CRC (write the new
  slot fully, validate, then it wins by sequence) — never overwrite the only copy.
- Flash wear is a budget: cells endure ~10k–100k erase cycles. Writes-per-hour × hours
  = a date on which the product dies. Never write flash inside the main loop — the
  positive pattern: ✅ buffer in RAM; persist only on value change AND with a minimum
  interval (e.g. ≥10 min between writes), or on a power-fail/shutdown event.
  ❌ writing the reading to flash every pass: 1 write/sec × 100k cycles = dead in ~28h.
- On boot, read and log the **reset-cause register** (power-on / brownout / watchdog /
  software). "Random resets" are almost never random — the register says which kind.

## 5 · Debuggability is designed in, on day one

UART console with log levels from the first build; a boot banner printing firmware
version + reset cause; fault counters that survive reboot; a way to dump device state
on demand. The device in the field has no debugger attached — logs and counters are the
only witnesses (`backend/operate.md` §1, same 3am test).

## 6 · OTA: the update path is the riskiest code you ship

Two-slot (A/B) layout; new image must pass a self-test before being marked good;
automatic rollback on failed boot (boot counter); refuse downgrades unless explicitly
unlocked. Test the update path itself — both TO the new version and FROM it — before
shipping any build; a broken OTA turns the whole fleet into paperweights with one push.

## 7 · Keep the vendor HAL at the edges

Business logic takes values and returns decisions; the vendor HAL, registers, and RTOS
calls live in a thin shell (`backend/logic.md` §2, same mechanism). Payoff here is
bigger than on servers: the pure core runs and unit-tests on your laptop in
milliseconds, instead of over a flash-and-pray cycle measured in minutes.
