# UC-01 — Search Hotels

**Actor:** Guest
**Team:** Moaz, Radwa

## Flowchart

```mermaid
flowchart TD
  A[Guest submits search: city, checkIn, checkOut, guests] --> B[Scatter: call Hotels API]
  B --> C[Gather: collect + normalize responses]
  C --> D[Return results to Guest]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant G as Guest
  participant API as Search Controller
  participant Ext as Hotels API

  G->>API: GET /hotels/search?city&checkIn&checkOut&guests
  API->>Ext: search(city, checkIn, checkOut, guests)
  Ext-->>API: raw hotel results
  API->>API: normalize(results)
  API-->>G: hotel results
```

## Pseudocode

```
function searchHotels(city, checkIn, checkOut, guests):
    results = HotelsAPI.search(city, checkIn, checkOut, guests)
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

`external_api_configuration` holds the connection details (provider, base URL,
API key) the search flow reads to call the Hotels API (`provider = "Hotels"`).
No booking/customer data is read or written by this use case.
