# Open Questions — Database Design

## 1. `transaction.currency`

Is a currency field required on `transaction`, or is a single currency assumed
project-wide?

**Affects:** UC-05 Initiate Payment, UC-06 Verify Payment Status, UC-10 Retrieve Booking Details

## 2. Refund handling

When a paid booking is cancelled (UC-09), is a refund modeled as:
- a new `transaction` row with a negative `amount`, or
- a status update on the existing `transaction` row?

**Affects:** UC-09 Cancel Booking

## 3. `seatNumber` on `flight_booking`

Is specific seat selection in scope for flight booking, or is `seatClass` alone sufficient?

**Affects:** UC-11 Book Flight
