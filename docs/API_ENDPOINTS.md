# API Endpoints

## Base URL
```
https://localhost:7000/api
```

---

## Patients

### Get All Patients
```
GET /patients
```
Query Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search by name or phone |
| pageNumber | int | No | Default: 1 |
| pageSize | int | No | Default: 10 |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+962790000000",
      "email": "john@example.com",
      "dateOfBirth": "1990-01-15",
      "gender": "Male",
      "address": "Amman, Jordan",
      "medicalHistory": "No allergies",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "totalCount": 50,
  "pageNumber": 1,
  "pageSize": 10
}
```

### Get Patient by ID
```
GET /patients/{id}
```
Response: `PatientDto` object

### Create Patient
```
POST /patients
```
Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+962790000000",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "address": "Amman, Jordan",
  "medicalHistory": "No allergies"
}
```

### Update Patient
```
PUT /patients/{id}
```
Request Body: Same as Create

### Delete Patient
```
DELETE /patients/{id}
```

---

## Doctors

### Get All Doctors
```
GET /doctors
```
Response:
```json
[
  {
    "id": 1,
    "firstName": "Ahmad",
    "lastName": "Al-Masri",
    "specialization": "General Dentistry",
    "phone": "+962790000001",
    "email": "ahmad@clinic.com",
    "bio": "10 years experience",
    "isAvailable": true
  }
]
```

### Get Doctor by ID
```
GET /doctors/{id}
```

### Get Doctor Schedule
```
GET /doctors/{id}/schedule
```
Query Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | date | No | Default: today |

Response:
```json
{
  "doctorId": 1,
  "doctorName": "Dr. Ahmad Al-Masri",
  "date": "2024-01-15",
  "appointments": [
    {
      "id": 1,
      "patientName": "John Doe",
      "startTime": "09:00",
      "endTime": "09:30",
      "treatment": "Teeth Cleaning",
      "status": "Confirmed"
    }
  ]
}
```

---

## Appointments

### Get All Appointments
```
GET /appointments
```
Query Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| doctorId | int | No | Filter by doctor |
| patientId | int | No | Filter by patient |
| date | date | No | Filter by date |
| status | string | No | Pending, Confirmed, Completed, Cancelled |
| startDate | date | No | Filter start range |
| endDate | date | No | Filter end range |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "John Doe",
      "doctorId": 1,
      "doctorName": "Dr. Ahmad Al-Masri",
      "appointmentDate": "2024-01-15",
      "startTime": "09:00",
      "endTime": "09:30",
      "treatmentId": 1,
      "treatmentName": "Teeth Cleaning",
      "notes": "First visit",
      "status": "Confirmed",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "totalCount": 100
}
```

### Get Appointment by ID
```
GET /appointments/{id}
```

### Get Available Slots
```
GET /appointments/available-slots
```
Query Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| doctorId | int | Yes | Doctor ID |
| date | date | Yes | Date to check |

Response:
```json
{
  "date": "2024-01-15",
  "doctorId": 1,
  "availableSlots": [
    { "startTime": "09:30", "endTime": "10:00" },
    { "startTime": "10:30", "endTime": "11:00" }
  ]
}
```

### Create Appointment
```
POST /appointments
```
Request Body:
```json
{
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2024-01-15",
  "startTime": "09:00",
  "treatmentId": 1,
  "notes": "First visit"
}
```

### Update Appointment
```
PUT /appointments/{id}
```
Request Body:
```json
{
  "appointmentDate": "2024-01-16",
  "startTime": "10:00",
  "doctorId": 2,
  "notes": "Rescheduled",
  "status": "Confirmed"
}
```

### Cancel Appointment
```
DELETE /appointments/{id}
```
OR
```
PATCH /appointments/{id}/cancel
```

---

## Treatments

### Get All Treatments
```
GET /treatments
```
Response:
```json
[
  {
    "id": 1,
    "name": "Teeth Cleaning",
    "description": "Professional dental cleaning",
    "price": 50.00,
    "durationMinutes": 30,
    "isActive": true
  }
]
```

### Create Treatment (Admin)
```
POST /treatments
```
Request Body:
```json
{
  "name": "Teeth Cleaning",
  "description": "Professional dental cleaning",
  "price": 50.00,
  "durationMinutes": 30
}
```

### Update Treatment
```
PUT /treatments/{id}
```

### Delete Treatment
```
DELETE /treatments/{id}
```

---

## Invoices

### Get All Invoices
```
GET /invoices
```
Query Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| patientId | int | No | Filter by patient |
| status | string | No | Pending, Paid, Cancelled |
| startDate | date | No | Filter start |
| endDate | date | No | Filter end |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "invoiceNumber": "INV-2024-001",
      "patientId": 1,
      "patientName": "John Doe",
      "appointmentId": 1,
      "totalAmount": 150.00,
      "status": "Pending",
      "createdAt": "2024-01-15T10:00:00Z",
      "items": [
        {
          "id": 1,
          "treatmentName": "Teeth Cleaning",
          "quantity": 1,
          "unitPrice": 50.00,
          "totalPrice": 50.00
        },
        {
          "id": 2,
          "treatmentName": "Teeth Whitening",
          "quantity": 1,
          "unitPrice": 100.00,
          "totalPrice": 100.00
        }
      ]
    }
  ]
}
```

### Get Invoice by ID
```
GET /invoices/{id}
```

### Create Invoice
```
POST /invoices
```
Request Body:
```json
{
  "patientId": 1,
  "appointmentId": 1,
  "items": [
    { "treatmentId": 1, "quantity": 1 },
    { "treatmentId": 2, "quantity": 1 }
  ]
}
```

### Mark Invoice as Paid
```
PATCH /invoices/{id}/pay
```
Request Body:
```json
{
  "paymentMethod": "Cash",
  "notes": "Paid in full"
}
```

### Cancel Invoice
```
PATCH /invoices/{id}/cancel
```

---

## Dashboard

### Get Dashboard Stats
```
GET /dashboard/stats
```
Response:
```json
{
  "todayAppointments": 12,
  "totalPatients": 150,
  "monthlyRevenue": 15000.00,
  "pendingInvoices": 5,
  "cancelledToday": 1
}
```

### Get Today's Schedule
```
GET /dashboard/today-schedule
```
Response:
```json
{
  "date": "2024-01-15",
  "appointments": [
    {
      "id": 1,
      "patientName": "John Doe",
      "doctorName": "Dr. Ahmad",
      "startTime": "09:00",
      "treatmentName": "Teeth Cleaning",
      "status": "Confirmed"
    }
  ]
}
```

### Get Recent Patients
```
GET /dashboard/recent-patients
```
Response:
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+962790000000",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

## Error Responses

All endpoints may return:

### 404 Not Found
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Patient with ID 1 not found"
}
```

### 400 Bad Request
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 400,
  "errors": {
    "phone": ["Phone number is required"]
  }
}
```

### 500 Internal Server Error
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred"
}
```
