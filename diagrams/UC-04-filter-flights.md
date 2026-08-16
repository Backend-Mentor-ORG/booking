# UC-04 — Filter Flights

**Actor:** Guest
**Team:** Hassan, Elzahra

Caching behavior below follows [`caching-design.md`](../caching-design.md)
[مقترح].

## Flowchart

```mermaid
flowchart TD
  A[Guest or User submits search + filters: origin, destination, date, passengers, priceRange, stops, airline, timeWindow] --> B{Cache hit for criteria+filters?}
  B -- Yes --> C[Load cached raw results]
  B -- No --> D[Scatter: call Flights API with filter parameters]
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
  participant API as Filter Controller
  participant Cache as Cache (Redis)
  participant Ext as Flights API
  participant P as Personalization Service

  U->>API: GET /flights/filter?origin&destination&date&passengers&priceRange&stops&airline&timeWindow
  API->>Cache: get(cacheKey)
  alt cache hit
    Cache-->>API: cached raw results
  else cache miss
    API->>Ext: search(origin, destination, date, passengers, priceRange, stops, airline, timeWindow)
    Ext-->>API: raw flight results
    API->>API: normalize(results)
    API->>Cache: set(cacheKey, results, ttl=5m)
  end
  alt logged-in user
    API->>P: rerank(customerId, results)
    P-->>API: personalized results
  end
  API-->>U: filtered flight results
```

## Pseudocode

```
function filterFlights(origin, destination, date, passengers, filters, customerId):
    cacheKey = buildCacheKey("flight", origin, destination, date, passengers, filters)
    results = cache.get(cacheKey)

    if results is null:
        raw = FlightsAPI.search(origin, destination, date, passengers, filters)
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

Same as UC-03: `external_api_configuration` (`provider = "Flights"`) supplies
the connection details for the call, and `flight_booking` is read only for
logged-in users' personalization. The cache itself (Redis, proposed) is not
part of the relational schema.
