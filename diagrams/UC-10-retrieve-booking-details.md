# UC-10 — Retrieve Booking Details

**Actor:** Registered User
**Team:** Sohail, Bassant

## Flowchart

```mermaid
flowchart TD
  A[User requests booking details: bookingId] --> B{Booking belongs to user?}
  B -- No --> C[Reject: 403]
  B -- Yes --> D[Fetch booking + status + transaction]
  D --> E[Return full details to User]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Registered User
  participant API as Booking Controller
  participant DB as booking / booking_status / transaction

  U->>API: GET /bookings/{id}
  API->>DB: find booking by id, join booking_status, transaction
  DB-->>API: booking details
  API->>API: check ownership
  API-->>U: booking details
```

## Pseudocode

```
function getBookingDetails(customerId, bookingId):
    booking = BookingRepo.findWithDetails(bookingId)   // joins booking_status, transaction
    if booking.customerId != customerId:
        throw Error("forbidden")

    return booking
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  CUSTOMER ||--o{ HOTEL_BOOKING : places
  CUSTOMER ||--o{ FLIGHT_BOOKING : places
  HOTEL_BOOKING }o--|| BOOKING_STATUS : has
  FLIGHT_BOOKING }o--|| BOOKING_STATUS : has
  HOTEL_BOOKING }o--|| TRANSACTION : "paid via"
  FLIGHT_BOOKING }o--|| TRANSACTION : "paid via"
  TRANSACTION }o--|| PAYMENT_STATUS : has
  TRANSACTION ||--o{ TRANSACTION_DETAILS : has
```
