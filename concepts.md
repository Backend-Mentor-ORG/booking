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
