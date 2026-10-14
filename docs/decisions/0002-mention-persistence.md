# ADR 0002 — Initial mention persistence and demo data

## Context
An interview MVP must be reproducible, small enough to explain and able to present believable examples without authentic platform credentials.

## Options
1. In-memory lists: simplest but data is lost on restart.
2. SQLite with Python standard library: persistent, low operational overhead.
3. SQLAlchemy plus migrations: useful at scale but more dependencies and code.
4. Remote PostgreSQL: realistic for production but unnecessary deployment burden.

## Decision
Use the built-in sqlite3 library for initial persistence, Pydantic models for API and analysis contracts, and explicit fictional JSON seed data.

## Rationale
The implementation is easy to read, persists across restarts and supports isolated API tests. External links are null instead of fake URLs. The seed script leaves non-empty databases untouched.

## Trade-offs
Serialized analysis JSON is not efficient for aggregated filtering. The current demo data is not classified yet; structured results will be added only when a real analysis implementation exists. The current initialization strategy does not replace versioned migrations.

## Consequences
Before the monitoring dashboard, decide how to query/filter analysis attributes; introduce migrations when the schema evolves. Maintain transparency of sample content and analysis method.
