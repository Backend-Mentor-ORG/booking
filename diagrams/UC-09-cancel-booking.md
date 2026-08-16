# UC-09 — Cancel Booking

**Actor:** Registered User
**Team:** Sohail, Bassant

## Flowchart

```mermaid
flowchart TD
  A[User requests cancel: bookingId] --> B{Booking belongs to user?}
  B -- No --> C[Reject: 403]
  B -- Yes --> D{Cancellable per status/policy?}
  D -- No --> E[Reject: cannot cancel]
  D -- Yes --> F[Update bookingStatusId = Cancelled]
  F --> G{Was paid?}
  G -- Yes --> H[Initiate refund]
  G -- No --> I[Skip refund]
  H --> J[Return confirmation]
  I --> J
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Registered User
  participant API as Booking Controller
  participant DB as booking table
  participant PS as Payment Service

  U->>API: POST /bookings/{id}/cancel
  API->>DB: find booking by id
  DB-->>API: booking
  API->>API: check ownership + cancellation policy
  API->>DB: update bookingStatusId = Cancelled
  alt booking was paid
    API->>PS: refund(transactionId)
  end
  API-->>U: cancellation confirmed
```

## Pseudocode

```
function cancelBooking(customerId, bookingId):
    booking = BookingRepo.find(bookingId)
    if booking.customerId != customerId:
        throw Error("forbidden")

    if not isCancellable(booking):
        throw Error("cannot cancel this booking")

    BookingRepo.update(bookingId, bookingStatusId = CANCELLED)

    if booking.transactionId is not null and booking.wasPaid:
        PaymentService.refund(booking.transactionId)   // refund mechanism: open item, see schema.dbml notes

    return confirmation
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
```
