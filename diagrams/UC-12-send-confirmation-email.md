# UC-12 — Send Confirmation Email

**Actor:** System
**Team:** Abdallah, Kamal (from Book Hotel) / Sohail, Bassant (from Book Flight)
**Relates to:** Triggered by UC-07 Book Hotel and UC-11 Book Flight

## Flowchart

```mermaid
flowchart TD
  A[Trigger: BookingCreated event from Book Hotel/Book Flight] --> B[Load booking snapshot + customer email]
  B --> C[Compose confirmation email]
  C --> D[Create notification row: type=Email, status=Pending]
  D --> E[Send via Email Provider]
  E --> F{Delivery succeeded?}
  F -- Yes --> G[Update notification.status = Sent]
  F -- No --> H[Update notification.status = Failed]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant EB as Event Bus (BookingCreated)
  participant NS as Notification Service
  participant DB as notification table
  participant EP as Email Provider

  EB-->>NS: BookingCreated(bookingId)
  NS->>NS: load booking + customer
  NS->>DB: insert notification(customerId, type=Email, status=Pending)
  NS->>EP: send(email, template, bookingSnapshot)
  EP-->>NS: delivery result
  NS->>DB: update notification.status = Sent/Failed
```

## Pseudocode

```
function sendConfirmationEmail(bookingId):
    booking = BookingRepo.find(bookingId)
    customer = CustomerRepo.find(booking.customerId)

    notification = NotificationRepo.insert({
        customerId: customer.id,
        notificationTypeId: TYPE_EMAIL,
        notificationStatusId: STATUS_PENDING
    })

    result = EmailProvider.send(customer.email, buildTemplate(booking))

    NotificationRepo.update(notification.id,
        notificationStatusId: result.success ? STATUS_SENT : STATUS_FAILED)
```

## Entity-Relationship Diagram

```mermaid
erDiagram
  CUSTOMER ||--o{ NOTIFICATION : receives
  NOTIFICATION }o--|| NOTIFICATION_TYPE : "is of"
  NOTIFICATION }o--|| NOTIFICATION_STATUS : has
```

`notification` has no direct foreign key to `hotel_booking` / `flight_booking`
in the current schema — the link between a booking and its confirmation
notification exists only at the application/event layer, not in the database.
