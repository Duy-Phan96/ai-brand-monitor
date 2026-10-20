# ADR 0007 — Explicit local demo reset

## Context
The interview demonstration must be repeatable even after filters, imports, and manual creation change the database.

## Options
- Add an unauthenticated destructive reset endpoint: convenient but unsafe.
- Delete the SQLite file manually: simple but error-prone and poorly documented.
- Provide an explicit command-line reset with confirmation and protection for non-sample records.

## Decision
Use `python -m scripts.reset_demo --confirm` from the backend directory. Reset only fictional sample records and refuse execution if any non-sample mention exists.

## Why
A CLI-only reset avoids exposing destructive administrative behavior over HTTP. A confirmation flag makes the operation intentional. Database deletion and reseeding take place in a single transaction, avoiding partial resets on insertion failure.

## Trade-offs
The reset requires local CLI access, not a user-facing button. It preserves safety at the cost of one extra demo preparation command. The database can still contain manual sample records, which are intentionally replaced.

## Evidence
`backend/tests/test_reset_demo.py` verifies repeatability and the guard against non-sample records. CI verification is recorded separately.
