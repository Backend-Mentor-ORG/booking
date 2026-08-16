# UC-02 — Filter Hotels

**Actor:** Guest
**Team:** Moaz, Radwa

Caching behavior below follows [`caching-design.md`](../caching-design.md)
[مقترح].

## Flowchart

```mermaid
flowchart TD
  A[Guest or User submits search + filters: city, checkIn, checkOut, guests, priceRange, stars, amenities] --> B{Cache hit for criteria+filters?}
  B -- Yes --> C[Load cached raw results]
  B -- No --> D[Scatter: call Hotels API with filter parameters]
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
  participant API as Filter Controller
  participant Cache as Cache (Redis)
  participant Ext as Hotels API
  participant P as Personalization Service

  U->>API: GET /hotels/filter?city&checkIn&checkOut&guests&priceRange&stars&amenities
  API->>Cache: get(cacheKey)
  alt cache hit
    Cache-->>API: cached raw results
  else cache miss
    API->>Ext: search(city, checkIn, checkOut, guests, priceRange, stars, amenities)
    Ext-->>API: raw hotel results
    API->>API: normalize(results)
    API->>Cache: set(cacheKey, results, ttl=5m)
  end
  alt logged-in user
    API->>P: rerank(customerId, results)
    P-->>API: personalized results
  end
  API-->>U: filtered hotel results
```

## Pseudocode

```
function filterHotels(city, checkIn, checkOut, guests, filters, customerId):
    cacheKey = buildCacheKey("hotel", city, checkIn, checkOut, guests, filters)
    results = cache.get(cacheKey)

    if results is null:
        raw = HotelsAPI.search(city, checkIn, checkOut, guests, filters)
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

Same as UC-01: `external_api_configuration` (`provider = "Hotels"`) supplies
the connection details for the call, and `hotel_booking` is read only for
logged-in users' personalization. The cache itself (Redis, proposed) is not
part of the relational schema.
