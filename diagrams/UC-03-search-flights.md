# UC-03 — Search Flights

**Actor:** Guest
**Team:** Hassan, Elzahra

## Flowchart

```mermaid
flowchart TD
  A[Guest submits search: origin, destination, date, passengers] --> B[Scatter: call Flights API]
  B --> C[Gather: collect + normalize responses]
  C --> D[Return results to Guest]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant G as Guest
  participant API as Search Controller
  participant Ext as Flights API

  G->>API: GET /flights/search?origin&destination&date&passengers
  API->>Ext: search(origin, destination, date, passengers)
  Ext-->>API: raw flight results
  API->>API: normalize(results)
  API-->>G: flight results
```

## Pseudocode

```
function searchFlights(origin, destination, date, passengers):
    results = FlightsAPI.search(origin, destination, date, passengers)
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
API key) the search flow reads to call the Flights API (`provider = "Flights"`).
No booking/customer data is read or written by this use case.
