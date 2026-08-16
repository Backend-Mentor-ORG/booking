# UC-11 — Book Flight

**Actor:** Registered User
**Team:** Sohail, Bassant
**Relates to:** Triggers → UC-12 Send Confirmation Email

## Flowchart

```mermaid
flowchart TD
  A[User selects flight + seat class, passenger info] --> B{Seat/fare still available?}
  B -- No --> C[Reject: no longer available]
  B -- Yes --> D[Create flight_booking: status=AwaitingPayment, snapshot fields]
  D --> E[Link customerId]
  E --> F[Return booking to User]
  F --> G[Triggers: Send Confirmation Email]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Registered User
  participant API as Booking Controller
  participant Ext as Flights API
  participant DB as flight_booking table
  participant N as Notification Service

  U->>API: POST /bookings/flight {flightRef, seatClass, passengers}
  API->>Ext: confirmAvailability(flightRef, seatClass, passengers)
  Ext-->>API: available
  API->>DB: insert flight_booking(customerId, status=AwaitingPayment, snapshot...)
  DB-->>API: bookingId
  API-->>U: booking created
  API->>N: emit BookingCreated(bookingId)
  N-->>N: (UC-12) send confirmation email
```

## Pseudocode

```
function bookFlight(customerId, flightRef, seatClass, priceSnapshot):
    available = FlightsAPI.confirmAvailability(flightRef, seatClass)
    if not available:
        throw Error("seat/fare no longer available")

    flight = FlightsAPI.getDetails(flightRef)   // for snapshot fields

    booking = FlightBookingRepo.insert({
        customerId: customerId,
        bookingStatusId: STATUS_AWAITING_PAYMENT,
        externalFlightRef: flightRef,
        airline: flight.airline,
        flightNumber: flight.number,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureAt: flight.departureAt,
        arrivalAt: flight.arrivalAt,
        seatClass: seatClass,
        priceSnapshot: priceSnapshot,
        createdAt: now()
    })

    EventBus.emit("BookingCreated", booking.id)
    return booking
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  CUSTOMER ||--o{ FLIGHT_BOOKING : places
  FLIGHT_BOOKING }o--|| BOOKING_STATUS : has
  FLIGHT_BOOKING }o--|| TRANSACTION : "paid via"
```
