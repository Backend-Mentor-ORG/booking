# Use Cases — Booking Project

**Source:** [`sources/use-case-diagram.jpg`](sources/use-case-diagram.jpg)

---

## 1. Actors

| Actor | الوصف |
|---|---|
| **Guest** | مستخدم غير مسجّل دخول — بيقدر يـ Search/Filter بس |
| **Registered User** (User) | مستخدم مسجّل دخول — بيقدر يعمل Booking وPayment |
| **System** | actor داخلي — بينفّذ أكشنز تلقائية زي إرسال الإيميل أو التحقق من حالة الدفع |

---

## 2. Use Cases

| # | Use Case | الـ Actor | نوع العلاقة | مرتبط بـ | الفريق المكلّف |
|---|---|---|---|---|---|
| UC-01 | Search Hotels | Guest | Performs | — | Moaz, Radwa |
| UC-02 | Filter Hotels | Guest | Performs | — | Moaz, Radwa |
| UC-03 | Search Flights | Guest | Performs | — | Hassan, Elzahra |
| UC-04 | Filter Flights | Guest | Performs | — | Hassan, Elzahra |
| UC-05 | Initiate Payment | Registered User | Initiates | Requests → UC-06 | Sara |
| UC-06 | Verify Payment Status | System | Requests (من UC-05) | — | Sara |
| UC-07 | Book Hotel | Registered User | Initiates | Triggers → UC-12 | Abdallah, Kamal |
| UC-08 | Retrieve Booking History | Registered User | Requests | — | Abdallah, Kamal |
| UC-09 | Cancel Booking | Registered User | Requests | — | Sohail, Bassant |
| UC-10 | Retrieve Booking Details | Registered User | Requests | — | Sohail, Bassant |
| UC-11 | Book Flight | Registered User | Initiates | Triggers → UC-12 | Sohail, Bassant |
| UC-12 | Send Confirmation Email | System | Triggers (من UC-07 وUC-11) | — | مشترك (Abdallah/Kamal + Sohail/Bassant) |

---

## 3. التجميعات

- **Hotel Search**: Search Hotels + Filter Hotels → *Moaz, Radwa*
- **Flight Search**: Search Flights + Filter Flights → *Hassan, Elzahra*
- **Payment**: Initiate Payment → Verify Payment Status → *Sara*
- **Hotel Booking**: Book Hotel + Retrieve Booking History → *Abdallah, Kamal*
- **Booking Management**: Cancel Booking + Retrieve Booking Details + Book Flight → *Sohail, Bassant*
