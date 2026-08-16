# UC-05 — Initiate Payment

**Actor:** Registered User
**Team:** Sara
**Relates to:** Requests → UC-06 Verify Payment Status

## Flowchart

```mermaid
flowchart TD
  A[User submits payment: bookingId, amount, paymentMethod] --> B{Booking exists & payable?}
  B -- No --> C[Reject: invalid or already-paid booking]
  B -- Yes --> D[Call 3rd-party Payment Gateway: charge]
  D --> E{Gateway accepted request?}
  E -- No --> F[Return failure to User]
  E -- Yes --> G[Create transaction row, status = Pending]
  G --> H[Return transaction reference to User]
  H --> I[Requests: Verify Payment Status]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as Registered User
  participant API as Payment Controller
  participant BS as Booking Service
  participant PG as 3rd-Party Payment Gateway
  participant DB as transaction table

  U->>API: POST /payments/initiate {bookingId, amount, method}
  API->>BS: validate(bookingId)
  BS-->>API: booking ok
  API->>PG: charge(amount, method)
  PG-->>API: paymentRef, status=pending
  API->>DB: insert transaction(paymentTypeId, paymentStatusId=Pending, amount, currency)
  DB-->>API: transactionId
  API-->>U: {transactionId, status: pending}
```

## Pseudocode

```
function initiatePayment(bookingId, amount, paymentMethod):
    booking = BookingService.find(bookingId)
    if booking is null or booking.status != "AwaitingPayment":
        throw Error("booking not payable")

    gatewayResponse = PaymentGateway.charge(amount, paymentMethod)
    if not gatewayResponse.accepted:
        return failure(gatewayResponse.reason)

    transaction = TransactionRepo.insert({
        paymentTypeId: paymentMethod.typeId,
        paymentStatusId: STATUS_PENDING,
        amount: amount,
        currency: booking.currency,
        createdAt: now()
    })
    return { transactionId: transaction.id, status: "pending" }
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  TRANSACTION }o--|| PAYMENT_TYPE_CONFIGURATION : "uses"
  TRANSACTION }o--|| PAYMENT_STATUS : "has"
  PAYMENT_TYPE_CONFIGURATION }o--|| PAYMENT_INTEGRATION_TYPE : "of type"
  HOTEL_BOOKING }o--|| TRANSACTION : "paid via"
  FLIGHT_BOOKING }o--|| TRANSACTION : "paid via"
```
