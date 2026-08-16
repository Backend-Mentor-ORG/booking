# UC-06 — Verify Payment Status

**Actor:** System
**Team:** Sara
**Relates to:** Requests (triggered by UC-05 Initiate Payment)

## Flowchart

```mermaid
flowchart TD
  A[Trigger: gateway webhook or scheduled poll] --> B[Fetch transaction by paymentRef]
  B --> C[Call Payment Gateway: getStatus]
  C --> D{Status changed?}
  D -- No --> E[No-op]
  D -- Yes --> F[Update transaction.paymentStatusId]
  F --> G{Status = Paid?}
  G -- Yes --> H[Mark related booking as Confirmed]
  G -- No, Failed --> I[Mark related booking as PaymentFailed]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant PG as Payment Gateway
  participant SYS as Payment Verification Service
  participant DB as transaction table
  participant BK as booking table

  PG-->>SYS: webhook(paymentRef, status)
  SYS->>DB: find transaction by paymentRef
  DB-->>SYS: transaction
  SYS->>DB: update paymentStatusId
  SYS->>BK: update bookingStatusId based on payment result
```

## Pseudocode

```
function verifyPaymentStatus(paymentRef, reportedStatus):
    transaction = TransactionRepo.findByPaymentRef(paymentRef)
    if reportedStatus == transaction.paymentStatusId:
        return  // no-op, already up to date

    TransactionRepo.update(transaction.id, paymentStatusId = reportedStatus)
    booking = BookingRepo.findByTransactionId(transaction.id)

    if reportedStatus == PAID:
        BookingRepo.update(booking.id, bookingStatusId = CONFIRMED)
    else if reportedStatus == FAILED:
        BookingRepo.update(booking.id, bookingStatusId = PAYMENT_FAILED)
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  TRANSACTION }o--|| PAYMENT_STATUS : has
  HOTEL_BOOKING }o--|| TRANSACTION : "paid via"
  FLIGHT_BOOKING }o--|| TRANSACTION : "paid via"
  HOTEL_BOOKING }o--|| BOOKING_STATUS : has
  FLIGHT_BOOKING }o--|| BOOKING_STATUS : has
```
