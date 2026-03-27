# API Endpoints

## Base URL
```
http://localhost:7000/api
```

Swagger UI available at: `http://localhost:7000/swagger` (development only)

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
| status | int | No | 0=Pending, 1=Confirmed, 2=InProgress, 3=Completed, 4=Cancelled, 5=NoShow |
| pageNumber | int | No | Default: 1 |
| pageSize | int | No | Default: 10 |

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
      "status": 1,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "totalCount": 100,
  "pageNumber": 1,
  "pageSize": 10
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

### Cancel/Delete Appointment
```
DELETE /appointments/{id}
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

### Get Treatment by ID
```
GET /treatments/{id}
```

### Create Treatment
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

## Treatment Records

### Get Records by Patient
```
GET /treatment-records/patient/{patientId}
```
Response:
```json
[
  {
    "id": 1,
    "patientId": 1,
    "patientName": "John Doe",
    "doctorId": 1,
    "doctorName": "Dr. Ahmad Al-Masri",
    "appointmentId": null,
    "visitDate": "2024-01-15T00:00:00Z",
    "chiefComplaint": "Tooth pain upper right",
    "painLevel": 7,
    "symptomDuration": "3 days",
    "extraoralFindings": "Normal",
    "intraoralFindings": "Caries on #3",
    "teethCondition": "#3 MOD (Tooth)",
    "gumCondition": "Mild inflammation",
    "radiographicFindings": "Periapical radiolucency #3",
    "primaryDiagnosis": "K02.1 - Dentin Caries",
    "secondaryDiagnoses": "",
    "treatmentPlan": "Root canal therapy #3",
    "treatmentStages": "Stage 1: Pulpectomy",
    "estimatedCost": 300.00,
    "procedurePerformed": "D3310 - Root Canal - Anterior",
    "anaesthesiaUsed": "Lidocaine 2% w/ Epi 1:100k | Inferior Alveolar Nerve Block | 2 carpules",
    "materialsUsed": "Gutta Percha Points",
    "complications": "",
    "procedureDurationMinutes": 60,
    "prescriptions": "Amoxicillin 500mg - 1 cap TID x 7 days\nIbuprofen 400mg - 1 tab TID PRN for pain",
    "postTreatmentInstructions": "Post-RCT Care:\n- Avoid chewing on treated side...",
    "nextAppointmentDate": "2024-01-22T00:00:00Z",
    "recallPeriodDays": 7,
    "notes": "",
    "createdAt": "2024-01-15T14:30:00Z"
  }
]
```

### Get Record by ID
```
GET /treatment-records/{id}
```

### Create Treatment Record
```
POST /treatment-records
```
Request Body: `CreateTreatmentRecordDto` (all fields except `id`, `patientName`, `doctorName`, `createdAt`)

### Update Treatment Record
```
PUT /treatment-records/{id}
```
Request Body: `UpdateTreatmentRecordDto` (all clinical fields, excluding patient/doctor IDs)

### Delete Treatment Record
```
DELETE /treatment-records/{id}
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
| status | int | No | 0=Pending, 1=Paid, 2=Cancelled, 3=Refunded |
| startDate | date | No | Filter start |
| endDate | date | No | Filter end |
| pageNumber | int | No | Default: 1 |
| pageSize | int | No | Default: 10 |

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
      "status": 0,
      "createdAt": "2024-01-15T10:00:00Z",
      "items": [
        {
          "id": 1,
          "treatmentName": "Teeth Cleaning",
          "quantity": 1,
          "unitPrice": 50.00,
          "totalPrice": 50.00
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

### Get Recent Patients
```
GET /dashboard/recent-patients?count=5
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

---

## CORS Configuration

The API is configured to allow requests from the Angular frontend:
- **Allowed Origin**: `http://localhost:4200`
- **Allowed Methods**: All
- **Allowed Headers**: All
