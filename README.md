# Booking Project

Hotels & Flights booking system.

## Structure

```
Booking/
├── use-cases.md          # Use case list: actors, use cases, groupings
├── system-design.md      # Basic system design (high-level architecture)
├── caching-design.md     # Search caching design (Guest vs Logged-in)
├── open-questions.md     # Unresolved database design decisions
├── sources/
│   ├── use-case-diagram.jpg   # Original hand-drawn use-case diagram (source of truth for use-cases.md)
│   ├── session-2-tasks.png    # Task list for session 2
│   └── schema.dbml            # Database schema (PostgreSQL, DBML format)
└── diagrams/
    └── UC-01 .. UC-12         # One file per use case
```

## Task 1 — Use Cases

[`use-cases.md`](use-cases.md) lists 12 use cases (UC-01–UC-12) derived from
the source diagram below ([`sources/use-case-diagram.jpg`](sources/use-case-diagram.jpg)),
covering three actors (**Guest**, **Registered User**, **System**) across
three areas: Search & Filter, Booking, and Payment.

![Use Case Diagram](sources/use-case-diagram.jpg)

## Task 2 — Flowchart, Sequence Diagram, Pseudocode, Entity Relationships

Each file in `diagrams/` covers one use case with four sections:

- **Flowchart** — step-by-step logic
- **Sequence Diagram** — actor/system/external-service interaction over time
- **Pseudocode** — the endpoint's logic
- **Entity-Relationship Diagram** — the tables involved, from [`sources/schema.dbml`](sources/schema.dbml)

| # | Use Case |
|---|---|
| UC-01 | [Search Hotels](diagrams/UC-01-search-hotels.md) |
| UC-02 | [Filter Hotels](diagrams/UC-02-filter-hotels.md) |
| UC-03 | [Search Flights](diagrams/UC-03-search-flights.md) |
| UC-04 | [Filter Flights](diagrams/UC-04-filter-flights.md) |
| UC-05 | [Initiate Payment](diagrams/UC-05-initiate-payment.md) |
| UC-06 | [Verify Payment Status](diagrams/UC-06-verify-payment-status.md) |
| UC-07 | [Book Hotel](diagrams/UC-07-book-hotel.md) |
| UC-08 | [Retrieve Booking History](diagrams/UC-08-retrieve-booking-history.md) |
| UC-09 | [Cancel Booking](diagrams/UC-09-cancel-booking.md) |
| UC-10 | [Retrieve Booking Details](diagrams/UC-10-retrieve-booking-details.md) |
| UC-11 | [Book Flight](diagrams/UC-11-book-flight.md) |
| UC-12 | [Send Confirmation Email](diagrams/UC-12-send-confirmation-email.md) |

## Database Design

[`sources/schema.dbml`](sources/schema.dbml) covers every table needed to
support the 12 use cases above (Users & Auth, Customer Management, Booking,
Payment, Notification, Search & Filter). It is structurally complete for this
scope, but 3 design decisions are still open — see [`open-questions.md`](open-questions.md):

1. Is `transaction.currency` required?
2. How is a refund modeled on cancellation (new row vs. status update)?
3. Is seat-number selection in scope for flight booking?

Rating/Review is out of scope for this project at this stage — no use case
currently requires it.

## Session 2

Task source: [`sources/session-2-tasks.png`](sources/session-2-tasks.png)

### Basic System Design — Booking

[`system-design.md`](system-design.md) — high-level architecture: 4 services
(Search, Booking, Payment, Notification), the external systems each one
talks to, and how the 12 use cases map onto them.

```mermaid
flowchart LR
  Guest([Guest])
  User([Registered User])

  Guest --> API[API Layer]
  User --> API

  API --> SearchSvc[Search Service]
  API --> BookingSvc[Booking Service]
  API --> PaymentSvc[Payment Service]

  SearchSvc --> HotelsAPI[(Hotels API)]
  SearchSvc --> FlightsAPI[(Flights API)]
  SearchSvc --> DB[(PostgreSQL)]

  BookingSvc --> DB
  BookingSvc -- BookingCreated event --> NotifSvc[Notification Service]

  PaymentSvc --> Gateway[(3rd-Party Payment Gateway)]
  PaymentSvc --> DB

  NotifSvc --> EmailProvider[(Email Provider)]
  NotifSvc --> DB
```

### Cache Flights or Hotel Task

[`caching-design.md`](caching-design.md) — caching strategy for Search
(UC-01–UC-04): raw results cached and shared between Guest and Logged-in
users; Logged-in users additionally get results re-ranked using their
booking history. Applied to [UC-01](diagrams/UC-01-search-hotels.md),
[UC-02](diagrams/UC-02-filter-hotels.md), [UC-03](diagrams/UC-03-search-flights.md),
[UC-04](diagrams/UC-04-filter-flights.md).
