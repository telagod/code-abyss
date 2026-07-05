# Traps — hardware's rot catalog: signals, why, fixes

Hardware rot has the same root as software rot (`backend/rot.md`): **the death of
feedback** — a board that can't be probed, a modification that isn't recorded, a failure
that was never measured. Every trap below is observable at design review or on the bench.

## A · Design traps

1. **No debug access on the production board.** No programming header, no test points,
   no console. *Why:* the first field problem is now un-investigatable. *Fix:*
   `bringup.md` §1 — pads cost nothing; leave them.
2. **GPIO driving real loads directly.** A relay coil, LED string, or motor hung on a
   20mA pin. *Why:* works once, then the pin (or MCU) dies from current or the coil's
   flyback spike. *Fix:* transistor/driver + flyback diode for anything inductive.
3. **Floating inputs.** Unused inputs, enable pins, and strapping pins left
   unconnected. *Why:* they pick up noise and switch randomly — the classic
   works-until-it-doesn't. *Fix:* pull every one to a defined level.
4. **Missing I2C pull-ups** — the bus "works" through the MCU's weak internal pulls
   until the second device or the longer trace arrives (`circuits.md` §5).
5. **Average-current battery math.** Battery life computed from average draw, ignoring
   TX pulses, regulator efficiency curves at µA loads, and battery self-discharge.
   *Why:* the projection is off 2–5×. *Fix:* measure real charge per duty cycle with a
   current profiler, then extrapolate.
6. **Copying a reference design without its assumptions** — then deleting the parts
   whose purpose you couldn't name (`parts.md` §4). Those were the terms of the contract.
7. **Ignoring the errata sheet.** The bug you're debugging for days is item 2.4.1.

## B · Firmware traps

8. **Blocking waits without timeouts** — `while(!flag);` is a hang wired to a loose
   cable (`firmware.md` §3).
9. **Watchdog kicked from a timer ISR** — the guard that guards nothing (`firmware.md` §2).
10. **Flash written in the hot path** — a wear-out date you shipped (`firmware.md` §4).
11. **No reset-cause logging.** The team debates "random resets" for a week; the
    register knew it was brownout the whole time (`firmware.md` §4).
12. **Raw sensor values trusted** — no debounce, no filter, no range check; the outlier
    becomes an actuation (`firmware.md` §3).

## C · Process traps — where projects actually die

13. **The magic prototype.** One hand-modified board works; the bodges aren't recorded;
    the next batch fails and nobody knows why. *Fix:* every bodge/blue-wire goes in a
    log with photos, and gets folded into the next revision
    (`methods/execute.md` §6 — the campsite rule, physical edition).
14. **No hardware version control.** `final_v2_REAL.pdf`, BOM in someone's head, no
    record of which units in the field carry which revision. *Fix:* schematic/BOM/layout
    versioned like code; board revision silkscreened on the PCB.
15. **Stacked experiments.** New MCU + new sensor + new protocol + custom RF on one
    spin (`parts.md` §2). Each unknown multiplies bring-up; you can't bisect a board.
16. **Room-temperature validation only.** Shipped after passing at 23°C on a clean
    bench supply (`bringup.md` §6).
17. **"It worked once" as a pass.** One good run ≠ validation; margins fail
    probabilistically. *Fix:* the 72-hour soak with fault logging.
18. **Skipping the current-limited first power.** Full battery, fresh board, dead MCU —
    and now the design itself is unproven too (`bringup.md` §2).
19. **Un-keyed connectors.** If backwards fits, backwards will be plugged. The magic
    smoke follows (`circuits.md` §3).
20. **Debugging by theory instead of measurement.** Three days of firmware speculation
    for what one scope shot of the rail would have shown in a minute (`bringup.md` §4).

## The meta-signal

Ask of any hardware project: **"if a unit fails in the field tomorrow, can we find out
why?"** Debug access, version records, reset-cause logs, measured margins — every trap
above is a way the answer becomes "no". Same law as software: rot is the death of
feedback; hardware just charges more for the lesson.
