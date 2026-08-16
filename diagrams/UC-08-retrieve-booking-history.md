# UC-08 — Retrieve Booking History

**Actor:** Registered User
**Team:** Abdallah, Kamal

## Flowchart

```mermaid
flowchart TD
  A[User requests booking history] --> B[Query flight_booking WHERE customerId]
  B --> C[Query hotel_booking WHERE customerId]
  C --> D[Merge and sort by createdAt]
  D --> E[Return list to User]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Registered User
  participant API as Booking History Controller
  participant DB as flight_booking / hotel_booking

  U->>API: GET /bookings/history
  API->>DB: SELECT * FROM flight_booking WHERE customerId = :id
  API->>DB: SELECT * FROM hotel_booking WHERE customerId = :id
  DB-->>API: rows
  API->>API: merge + sort by createdAt DESC
  API-->>U: booking history list
```

## Pseudocode

```
function getBookingHistory(customerId):
    flights = FlightBookingRepo.findByCustomer(customerId)
    hotels = HotelBookingRepo.findByCustomer(customerId)
    merged = (flights + hotels).sortByDescending(b => b.createdAt)
    return merged
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  CUSTOMER ||--o{ HOTEL_BOOKING : places
  CUSTOMER ||--o{ FLIGHT_BOOKING : places
  HOTEL_BOOKING }o--|| BOOKING_STATUS : has
  FLIGHT_BOOKING }o--|| BOOKING_STATUS : has
```
