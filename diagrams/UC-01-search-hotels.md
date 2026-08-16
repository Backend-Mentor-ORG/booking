# UC-01 — Search Hotels

**Actor:** Guest
**Team:** Moaz, Radwa

Caching behavior below follows [`caching-design.md`](../caching-design.md)
[مقترح].

## Flowchart

```mermaid
flowchart TD
  A[Guest or User submits search: city, checkIn, checkOut, guests] --> B{Cache hit for criteria?}
  B -- Yes --> C[Load cached raw results]
  B -- No --> D[Scatter: call Hotels API]
  D --> E[Gather: normalize responses]
  E --> F[Store in cache, TTL 5 min]
  F --> C
  C --> G{Logged-in User?}
  G -- Yes --> H[Re-rank using customer's hotel_booking history]
  G -- No --> I[Return raw results]
  H --> J[Return personalized results]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Guest / Registered User
  participant API as Search Controller
  participant Cache as Cache (Redis)
  participant Ext as Hotels API
  participant P as Personalization Service

  U->>API: GET /hotels/search?city&checkIn&checkOut&guests
  API->>Cache: get(cacheKey)
  alt cache hit
    Cache-->>API: cached raw results
  else cache miss
    API->>Ext: search(city, checkIn, checkOut, guests)
    Ext-->>API: raw hotel results
    API->>API: normalize(results)
    API->>Cache: set(cacheKey, results, ttl=5m)
  end
  alt logged-in user
    API->>P: rerank(customerId, results)
    P-->>API: personalized results
  end
  API-->>U: hotel results
```

## Pseudocode

```
function searchHotels(city, checkIn, checkOut, guests, customerId):
    cacheKey = buildCacheKey("hotel", city, checkIn, checkOut, guests)
    results = cache.get(cacheKey)

    if results is null:
        raw = HotelsAPI.search(city, checkIn, checkOut, guests)
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
  CUSTOMER ||--o{ HOTEL_BOOKING : "history used for personalization"
```

`external_api_configuration` holds the connection details for the Hotels API
call (`provider = "Hotels"`). `hotel_booking` is read only for logged-in
users, to re-rank results by the customer's past bookings. The cache itself
(Redis, proposed) is not part of the relational schema.
