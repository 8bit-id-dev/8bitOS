# Decision: Spec 1 scope = minimum viable foundation

**Date:** 2026-09-03
**Status:** DEFAULT — user can override

## What is in Spec 1

App shell + Dashboard + Classroom (class list, roster, attendance, student side-panel).

**Not in Spec 1** (each its own future spec):
- Notes (text-only or any)
- Browser
- Whiteboard
- Quiz
- Gradebook
- Document Center
- AI Assistant
- Capacitor wrap
- Launcher mode
- Biometric auth

## Why this default

1. Smallest scope that proves the architecture end-to-end.
2. Smallest scope that produces a demo-able artifact.
3. Notes / Browser / etc. each reuse the shell infrastructure built here, so adding them later is cheap.
4. We've previously thrashed on this question for several rounds. Choosing a conservative default unblocks the build.

## How to override

Tell me "add Notes to Spec 1" (or any other module) and I'll add it to the spec.
