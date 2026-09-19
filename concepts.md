# Concepts

Background on the techniques used in `caching-design.md` and UC-01–UC-04,
for interview prep.

## Scatter & Gather

**Concept:** instead of calling multiple independent data sources one after
another (sequentially), you fire requests to all of them at once in parallel
("scatter"), then wait for all responses and combine them into one result
("gather"). If each source takes time T and you have N sources, sequential
calls take roughly N × T total; scattering them in parallel takes roughly
max(T) — bounded by the slowest single source, not the sum of all of them.

**Where it applies here:** `external_api_configuration` (in `sources/schema.dbml`)
stores one row per provider config, keyed by `provider` ("Hotels" or
"Flights"). As currently designed, UC-01/UC-03 assume a single active
provider per type, so today it's effectively one call, not a parallel
scatter across multiple sources.

If more than one provider existed for the same type (e.g. two different
hotel data providers), Scatter & Gather is what you'd apply: call every
active `Hotels` provider in parallel, then merge/normalize their responses
into one result list before caching. The schema already supports multiple
rows per provider type, so the design extends to this without changes —
it just isn't exercised yet, since UC-01/UC-03 only call one API.

**Partial response and resilience** — the two properties that make Scatter
& Gather worth the added complexity when it *is* exercised:
- **Partial response:** don't block the whole request on the slowest
  provider. Return results as they arrive (fastest provider first), and
  keep updating the result set as later providers respond, instead of
  waiting for all of them before showing anything.
- **Resilience:** if one provider errors out or exceeds its timeout, ignore
  it and return the ones that succeeded — one bad provider shouldn't fail
  the whole search. This requires a per-provider timeout, not just one
  timeout for the whole request.

Neither is free: partial response needs a transport that can push more
than one response over time (polling a status endpoint, or a streaming
connection like SSE) — a single plain REST response can't do this, since
the connection closes once the first response is sent. This project hasn't
picked a transport for it yet — see [`open-questions.md`](open-questions.md).

## Traveller data: JSONB vs. a separate table

**Concept:** when data is closely tied to one entity (here: the travellers
on a booking) but has no independent life of its own, storing it as a
`jsonb` column on that entity can be simpler than a separate table with its
own relationship. Whether that's the right call depends on trade-offs, not
a fixed rule — six criteria decide it:

1. **Simplicity** — does this need its own entity/repository/relationship/
   queries, or is it just information living inside the parent record?
2. **Maintenance** — does it have an independent lifecycle (create/update/
   delete on its own), or does it get written once with the parent and
   never touched separately?
3. **Readability from the database** — when you open the parent row, is
   the related data right there, or do you need another table to see the
   full picture?
4. **JSONB vs. relationship** — does it have its own domain, or
   relationships to other entities (a user, a customer, a loyalty
   account)?
5. **Writes** — does it get updated often, or is the pattern just
   create-parent → insert-this → read?
6. **Need for joins** — do you need to query this data on its own (e.g.
   "all bookings for this specific traveller")? If yes, a table is the
   better fit.

**Where it applies here:** `flight_booking.travellers` and
`hotel_booking.travellers` (`sources/schema.dbml`) store passenger/guest
data as `jsonb` rather than a separate `traveller` table, because:

- Travellers aren't a domain of their own here — there's no traveller
  management, no independent lifecycle for one.
- Bookings go through external providers; traveller data is information
  tied to the moment of booking, not master data this system manages.
- It's immutable after booking — the pattern is insert-with-the-booking,
  then read, never an independent update.
- No relationships are needed to `customer`, a user account, or a loyalty
  account for this data.
- The access pattern is always "read the booking together with its
  travellers" (confirmation emails, booking details) — never travellers
  queried on their own.
- `jsonb` absorbs differences between providers (one may return extra
  fields another doesn't) without a schema migration every time.

**Trade-off, stated plainly:** this gives up referential integrity,
fine-grained per-traveller updates, and schema enforcement on that data —
the database won't validate its shape the way a real column/table would.
Accepted here because none of criteria 2, 4, or 6 above call for a table.
If a future requirement needs querying travellers directly (e.g. "find all
bookings for traveller X" across the system), that's exactly the signal to
revisit this and split it into its own table.

## Redis / Caching

**Concept:** Redis is an in-memory key-value store. Used as a cache sitting
in front of something slower or more expensive (a database, or here, an
external API), so a repeated identical request is served from memory
instead of repeating the expensive call.

Two design decisions matter most:
- **Cache key** — what counts as "the same request." Here: the search
  criteria (and filters, for Filter use cases) hashed together — see
  `buildCacheKey(...)` in each UC's pseudocode.
- **TTL (time-to-live)** — how long a cached entry stays valid before it's
  considered stale and re-fetched. Proposed here: 5 minutes.

**Where it applies here:** `caching-design.md` — raw Hotels/Flights search
results are cached by criteria and shared between Guest and Logged-in users
(same underlying data, so no reason to cache it twice). Personalization
(re-ranking by a Logged-in user's booking history) is computed after the
cache read, not stored in the cache itself, since it's specific to one
customer and wouldn't be reusable across users the way the raw results are.
