# UC-07 — Book Hotel

**Actor:** Registered User
**Team:** Abdallah, Kamal
**Relates to:** Triggers → UC-12 Send Confirmation Email

## Flowchart

```mermaid
flowchart TD
  A[User selects hotel + room, dates, guest info] --> B{Room still available?}
  B -- No --> C[Reject: no longer available]
  B -- Yes --> D[Create hotel_booking: status=AwaitingPayment, snapshot fields]
  D --> E[Link customerId]
  E --> F[Return booking to User]
  F --> G[Triggers: Send Confirmation Email]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Registered User
  participant API as Booking Controller
  participant Ext as Hotels API
  participant DB as hotel_booking table
  participant N as Notification Service

  U->>API: POST /bookings/hotel {hotelRef, roomType, checkIn, checkOut, guests}
  API->>Ext: confirmAvailability(hotelRef, roomType, checkIn, checkOut)
  Ext-->>API: available
  API->>DB: insert hotel_booking(customerId, status=AwaitingPayment, travellers, snapshot...)
  DB-->>API: bookingId
  API-->>U: booking created
  API->>N: emit BookingCreated(bookingId)
  N-->>N: (UC-12) send confirmation email
```

## Pseudocode

```
function bookHotel(customerId, hotelRef, roomType, checkIn, checkOut, guests, priceSnapshot):
    available = HotelsAPI.confirmAvailability(hotelRef, roomType, checkIn, checkOut)
    if not available:
        throw Error("room no longer available")

    booking = HotelBookingRepo.insert({
        customerId: customerId,
        bookingStatusId: STATUS_AWAITING_PAYMENT,
        externalHotelRef: hotelRef,
        hotelNameSnapshot: fetchHotelName(hotelRef),
        roomType: roomType,
        checkIn: checkIn,
        checkOut: checkOut,
        travellers: guests,   // jsonb — see concepts.md (2026-09-19)
        priceSnapshot: priceSnapshot,
        createdAt: now()
    })

    EventBus.emit("BookingCreated", booking.id)
    return booking
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  CUSTOMER ||--o{ HOTEL_BOOKING : places
  HOTEL_BOOKING }o--|| BOOKING_STATUS : has
  HOTEL_BOOKING }o--|| TRANSACTION : "paid via"
```
