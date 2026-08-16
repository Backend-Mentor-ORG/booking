# UC-02 — Filter Hotels

**Actor:** Guest
**Team:** Moaz, Radwa

## Flowchart

```mermaid
flowchart TD
  A[Guest submits search + filters: city, checkIn, checkOut, guests, priceRange, stars, amenities] --> B[Scatter: call Hotels API with filter parameters]
  B --> C[Gather: collect + normalize responses]
  C --> D[Return filtered results to Guest]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant G as Guest
  participant API as Filter Controller
  participant Ext as Hotels API

  G->>API: GET /hotels/filter?city&checkIn&checkOut&guests&priceRange&stars&amenities
  API->>Ext: search(city, checkIn, checkOut, guests, priceRange, stars, amenities)
  Ext-->>API: raw hotel results
  API->>API: normalize(results)
  API-->>G: filtered hotel results
```

## Pseudocode

```
function filterHotels(city, checkIn, checkOut, guests, filters):
    results = HotelsAPI.search(city, checkIn, checkOut, guests, filters)
    normalized = normalize(results)
    return normalized
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
```

Same as UC-01: `external_api_configuration` (`provider = "Hotels"`) supplies
the connection details for the call. No booking/customer data is read or
written by this use case.
