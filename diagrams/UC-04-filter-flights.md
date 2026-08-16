# UC-04 — Filter Flights

**Actor:** Guest
**Team:** Hassan, Elzahra

## Flowchart

```mermaid
flowchart TD
  A[Guest submits search + filters: origin, destination, date, passengers, priceRange, stops, airline, timeWindow] --> B[Scatter: call Flights API with filter parameters]
  B --> C[Gather: collect + normalize responses]
  C --> D[Return filtered results to Guest]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant G as Guest
  participant API as Filter Controller
  participant Ext as Flights API

  G->>API: GET /flights/filter?origin&destination&date&passengers&priceRange&stops&airline&timeWindow
  API->>Ext: search(origin, destination, date, passengers, priceRange, stops, airline, timeWindow)
  Ext-->>API: raw flight results
  API->>API: normalize(results)
  API-->>G: filtered flight results
```

## Pseudocode

```
function filterFlights(origin, destination, date, passengers, filters):
    results = FlightsAPI.search(origin, destination, date, passengers, filters)
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

Same as UC-03: `external_api_configuration` (`provider = "Flights"`) supplies
the connection details for the call. No booking/customer data is read or
written by this use case.
