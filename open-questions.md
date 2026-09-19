# Open Questions — Database Design

## 1. `transaction.currency`

Is a currency field required on `transaction`, or is a single currency assumed
project-wide?

If it is required: should it be a free `varchar`, a `CHECK`/`ENUM` constrained
to valid currency codes (ISO 4217), or a full lookup table? A free `varchar`
risks the same integrity problem as an unconstrained `status` column
(inconsistent values like `'EGP'` vs `'egp'` breaking `SUM`/`GROUP BY`).
Unlike `status`, currency codes are an external fixed standard the team
doesn't define, so a full lookup table may be unnecessary unless extra data
(symbol, decimal places) needs to be stored per currency.

A fourth option — validating against an external API instead of a DB
constraint — solves a different problem: validation would happen only in
application code, with no guarantee from the database itself, reintroducing
the free-text risk if any write path skips it. It fits live data (exchange
rates), not a near-static code list like ISO 4217.

**Affects:** UC-05 Initiate Payment, UC-06 Verify Payment Status, UC-10 Retrieve Booking Details

## 2. Refund handling

When a paid booking is cancelled (UC-09), is a refund modeled as:
- a new `transaction` row with a negative `amount`, or
- a status update on the existing `transaction` row?

**Affects:** UC-09 Cancel Booking

## 3. `seatNumber` on `flight_booking`

Is specific seat selection in scope for flight booking, or is `seatClass` alone sufficient?

**Affects:** UC-11 Book Flight

## 4. Which real provider does the Flight Aggregator call?

`external_api_configuration` is provider-agnostic — no real provider is
wired in yet. Session-21 case study compared **Duffel** to **Amadeus** on
documentation quality, a built-in payment gateway (saves building a
separate one), and a solid sandbox/test environment — that comparison was
a different team's experience, not a recommendation for this project.

**Proposed (2026-09-01, my own call, not yet approved):** go with Duffel,
on the same criteria. Pending confirmation at the next mentor meeting —
treat as a candidate, not settled, until then.

**Affects:** Flight Aggregator implementation, Payment Service integration scope

## 5. Transport for Scatter & Gather's partial response

`concepts.md` now covers partial response and resilience (return fastest
providers first, ignore ones that time out), but a plain REST call can't
push more than one response — the connection closes after the first. Two
realistic options: polling (client re-fetches a status endpoint) or SSE
(one connection stays open, server pushes updates). Not picked yet, and
only matters once/if a second provider per type is actually added (see
`concepts.md` — Scatter & Gather).

**Affects:** Flight/Hotel Aggregator implementation, API Layer contract

## 6. Sharing one `transaction` across `flight_booking` and `hotel_booking`

`transactionId` is now `unique` on both `flight_booking` and `hotel_booking`,
which prevents two rows of the *same* type from sharing one transaction. It
does not prevent one `flight_booking` row and one `hotel_booking` row from
sharing the same transaction at the same time (a `UNIQUE` constraint only
applies within a single table). Is that combination — one payment covering a
flight + hotel package — intended, or should it be blocked?

**Affects:** UC-05 Initiate Payment, UC-07 Book Hotel, UC-11 Book Flight

## 7. Per-provider cache instead of one combined cache row

Raised as an alternative to the per-user/guest key in `caching-design.md`:
cache each provider's response separately, so a cache hit on some providers
combined with a live call to the ones that missed could serve a partial
result faster than treating "the search" as one all-or-nothing cache entry.
Not settled — the open problem is what happens when several providers miss
at once: the result-aggregation logic gets more complex, and if most/all
providers miss anyway, the benefit shrinks. Needs a concrete proposal before
it's worth adopting.

**Affects:** Flight/Hotel Aggregator implementation, caching design

## 8. Proactive cache refresh before TTL expiry

Also raised alongside #7: if a request arrives within, say, the last minute
of a cache row's TTL, refresh it proactively instead of letting it expire.
This narrows the thundering-herd window in `caching-design.md` but doesn't
close it — if no request happens to land in that refresh window and a burst
arrives right after expiry, the same pile-up recurs. Worth doing only as a
supplement to the per-user/guest key, not a replacement for it.

**Affects:** Flight/Hotel Aggregator implementation, caching design
