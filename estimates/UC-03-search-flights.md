# Search Flight — Estimate

**Use Case:** [UC-03 Search Flights](../diagrams/UC-03-search-flights.md)
**Team:** Hassan, Zahra

## WBS

| # | Sub-task | Estimate |
|---|---|---|
| 1 | Request DTO + validation (origin, destination, date, passengers) | 2h |
| 2 | Flights API client integration (HTTP client, config from `external_api_configuration`) | 4h |
| 3 | Request mapping (internal params → Flights API format) | 2h |
| 4 | Response normalization (Flights API response → internal result shape) | 3h |
| 5 | Endpoint wiring (`GET /flights/search`) | 2h |
| 6 | Error handling (API timeout/failure, empty results, invalid input) | 2h |
| 7 | Unit tests (normalization, DTO validation) | 3h |
| 8 | Integration tests (mocked Flights API, end-to-end) | 3h |
| 9 | API documentation (Swagger) | 1h |

**Total: 22h (~3 days)**
