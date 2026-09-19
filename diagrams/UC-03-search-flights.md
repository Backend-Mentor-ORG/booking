# UC-03 — Search Flights

**Actor:** Guest
**Team:** Hassan, Elzahra

Caching behavior below follows [`caching-design.md`](../caching-design.md)
[مقترح].

## Flowchart

```mermaid
flowchart TD
  A[Guest or User submits search: origin, destination, date, passengers] --> Z{Logged-in?}
  Z -- Yes --> Z1[Use userId from session]
  Z -- No --> Z2[Read guestId from cookie, or create + set one]
  Z1 --> B{Cache hit for id + criteria?}
  Z2 --> B
  B -- Yes --> C[Load cached raw results]
  B -- No --> D[Scatter: call Flights API]
  D --> E[Gather: normalize responses]
  E --> F[Store in cache, TTL 5 min]
  F --> C
  C --> G{Logged-in User?}
  G -- Yes --> H[Re-rank using customer's flight_booking history]
  G -- No --> I[Return raw results]
  H --> J[Return personalized results]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Guest / Registered User
  participant API as Search Controller
  participant Cache as Cache (Redis)
  participant Ext as Flights API
  participant P as Personalization Service

  U->>API: GET /flights/search?origin&destination&date&passengers (+ session or guestId cookie)
  API->>API: resolve identity (userId from session, or read/create guestId from cookie)
  API->>Cache: get(cacheKey = identity + hash(criteria))
  alt cache hit
    Cache-->>API: cached raw results
  else cache miss
    API->>Ext: search(origin, destination, date, passengers)
    Ext-->>API: raw flight results
    API->>API: normalize(results)
    API->>Cache: set(cacheKey, results, ttl=5m)
  end
  alt logged-in user
    API->>P: rerank(customerId, results)
    P-->>API: personalized results
  end
  API-->>U: flight results
```

## Pseudocode

```
function searchFlights(origin, destination, date, passengers, customerId, guestIdCookie):
    identity = customerId is not null ? customerId : (guestIdCookie or generateGuestId())
    cacheKey = buildCacheKey("flight", identity, origin, destination, date, passengers)
    results = cache.get(cacheKey)

    if results is null:
        raw = FlightsAPI.search(origin, destination, date, passengers)
        results = normalize(raw)
        cache.set(cacheKey, results, ttl = 5 minutes)

    if customerId is not null:
        results = PersonalizationService.rerank(customerId, results)

    return results
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  EXTERNAL_API_CONFIGURATION {
    varchar id PK
    varchar provider
    varchar baseUrl
    varchar apiKey
    boolean isActive
  }
  CUSTOMER ||--o{ FLIGHT_BOOKING : "history used for personalization"
```

`external_api_configuration` holds the connection details for the Flights API
call (`provider = "Flights"`). `flight_booking` is read only for logged-in
users, to re-rank results by the customer's past bookings. The cache itself
(Redis, proposed) is not part of the relational schema. Identity resolution
(session `userId` vs. cookie `guestId`) and the compound cache key are per
the 2026-09-19 update in `caching-design.md`.
