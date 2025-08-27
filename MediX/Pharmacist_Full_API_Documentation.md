> Pharmacy Module API Endpoints
>
> MediX Backend System
>
> August 25, 2025

HTTP Status Codes

All endpoints return appropriate HTTP status codes:

> • 200 OK for successful operations
>
> • 201 Created for successful POST (though Spring returns 200 by
> default)
>
> • 404 Not Found for non-existent resources
>
> • 400 Bad Request for validation errors
>
> • 500 Internal Server Error for server issues

1 Medicine Endpoints

1.1 Create Medicine • Method: POST

> • URL: http://localhost:8080/api/medicines
>
> • Request Body:
>
> 1 {
>
> 2 "company": "Pfizer",
>
> 3 "medicineName": "Lipitor",
>
> 4 "genericName": "Atorvastatin", 5 "quantity": 100,
>
> 6 "unitCost": 5.50,
>
> 7 "unitPrice": 12.99,
>
> 8 "expiryDate": "2025-12-31" 9 }
>
> 1

1.2 Get All Medicines • Method: GET

> • URL: http://localhost:8080/api/medicines
>
> • Response:
>
> 1 \[
>
> 2 {
>
> 3 "id": 1,
>
> 4 "company": "Pfizer",
>
> 5 "medicineName": "Lipitor",
>
> 6 "genericName": "Atorvastatin", 7 "quantity": 100,
>
> 8 "unitCost": 5.5,
>
> 9 "unitPrice": 12.99,
>
> 10 "expiryDate": "2025-12-31" 11 }
>
> 12 \]

1.3 Get Medicine by ID • Method: GET

> • URL: http://localhost:8080/api/medicines/1
>
> • Response:
>
> 1 {
>
> 2 "id": 1,
>
> 3 "company": "Pfizer",
>
> 4 "medicineName": "Lipitor",
>
> 5 "genericName": "Atorvastatin", 6 "quantity": 100,
>
> 7 "unitCost": 5.5,
>
> 8 "unitPrice": 12.99,
>
> 9 "expiryDate": "2025-12-31" 10 }

1.4 Get Medicine by Name • Method: GET

> • URL: http://localhost:8080/api/medicines/name/Lipitor
>
> • Response:
>
> 1 {
>
> 2 "id": 1,
>
> 3 "company": "Pfizer",
>
> 4 "medicineName": "Lipitor",
>
> 5 "genericName": "Atorvastatin",
>
> 2
>
> 6 "quantity": 100, 7 "unitCost": 5.5,
>
> 8 "unitPrice": 12.99,
>
> 9 "expiryDate": "2025-12-31" 10 }

1.5 Update Medicine • Method: PUT

> • URL: http://localhost:8080/api/medicines/1
>
> • Request Body:
>
> 1 {
>
> 2 "company": "Pfizer Updated",
>
> 3 "medicineName": "Lipitor Updated",
>
> 4 "genericName": "Atorvastatin Calcium", 5 "quantity": 150,
>
> 6 "unitCost": 6.00,
>
> 7 "unitPrice": 13.50,
>
> 8 "expiryDate": "2026-01-31" 9 }

1.6 Delete Medicine • Method: DELETE

> • URL: http://localhost:8080/api/medicines/1

1.7 Get Medicines by Company • Method: GET

> • URL: http://localhost:8080/api/medicines/company/Pfizer
>
> • Response:
>
> 1 \[
>
> 2 {
>
> 3 "id": 1,
>
> 4 "company": "Pfizer",
>
> 5 "medicineName": "Lipitor",
>
> 6 "genericName": "Atorvastatin", 7 "quantity": 100,
>
> 8 "unitCost": 5.5,
>
> 9 "unitPrice": 12.99,
>
> 10 "expiryDate": "2025-12-31" 11 }
>
> 12 \]
>
> 3

1.8 Get Medicines by Generic Name • Method: GET

> • URL: http://localhost:8080/api/medicines/generic/Atorvastatin
>
> • Response:
>
> 1 \[
>
> 2 {
>
> 3 "id": 1,
>
> 4 "company": "Pfizer",
>
> 5 "medicineName": "Lipitor",
>
> 6 "genericName": "Atorvastatin", 7 "quantity": 100,
>
> 8 "unitCost": 5.5,
>
> 9 "unitPrice": 12.99,
>
> 10 "expiryDate": "2025-12-31" 11 }
>
> 12 \]

1.9 Get Expired Medicines • Method: GET

> • URL: http://localhost:8080/api/medicines/expired
>
> • Response:
>
> 1 \[
>
> 2 {
>
> 3 "id": 1,
>
> 4 "company": "Pfizer",
>
> 5 "medicineName": "Lipitor",
>
> 6 "genericName": "Atorvastatin", 7 "quantity": 100,
>
> 8 "unitCost": 5.5,
>
> 9 "unitPrice": 12.99,
>
> 10 "expiryDate": "2025-12-31" 11 }
>
> 12 \]

2 Bill Endpoints

2.1 Create Bill • Method: POST

> • URL: /api/bills
>
> • Request Body:
>
> 4
>
> 1 {
>
> 2 "customerName": "John Doe",
>
> 3 "phoneNumber": "123-456-7890", 4 "date": "2023-10-15",
>
> 5 "prescriptionId": null, 6 "subTotal": 45.00,
>
> 7 "tax": 4.50,
>
> 8 "total": 49.50,
>
> 9 "sellType": false, 10 "billItems": \[
>
> 11 {
>
> 12 "medicineName": "Aspirin", 13 "quantity": 10,
>
> 14 "unitPrice": 1.00, 15 "discount": 0.50, 16 "total": 9.50
>
> 17 }, 18 {
>
> 19 "medicineName": "Paracetamol", 20 "quantity": 5,
>
> 21 "unitPrice": 2.00, 22 "discount": 1.00, 23 "total": 9.00
>
> 24 } 25 \]
>
> 26 }

2.2 Get All Bills • Method: GET

> • URL: /api/bills

2.3 Get Bill by ID • Method: GET

> • URL: /api/bills/{id}

2.4 Get Bills by Date • Method: GET

> • URL: /api/bills/date/{date}

2.5 Get Bills by Customer Name • Method: GET

> • URL: /api/bills/customer/{customerName}
>
> 5

2.6 Get Bills by Phone Number • Method: GET

> • URL: /api/bills/phone/{phoneNumber}

2.7 Get Bill Items by Bill ID • Method: GET

> • URL: /api/bills/{id}/items

2.8 Delete Bill

> • Method: DELETE
>
> • URL: /api/bills/{id}

2.9 Bill History • Method: GET

> • URL: http://localhost:8080/api/bills/history
>
> • Response:
>
> 1 \[
>
> 2 {
>
> 3 "billId": 1,
>
> 4 "date": "2024-01-15", 5 "prescriptionId": 101, 6 "patientId": 5001,
>
> 7 "patientPhone": "+1234567890", 8 "sellType": false,
>
> 9 "total": 49.50 10 },
>
> 11 {
>
> 12 "billId": 2,
>
> 13 "date": "2024-01-14",
>
> 14 "prescriptionId": null, 15 "patientId": null,
>
> 16 "patientPhone": "+1987654321", 17 "sellType": true,
>
> 18 "total": 125.75 19 },
>
> 20 {
>
> 21 "billId": 3,
>
> 22 "date": "2024-01-13", 23 "prescriptionId": 102, 24 "patientId":
> 5002,
>
> 25 "patientPhone": "+1555666777", 26 "sellType": false,
>
> 6
>
> 27 "total": 87.25 28 }
>
> 29 \]

2.10 Revenue Analytics • Method: GET

> • URL: http://localhost:8080/api/bills/revenue/analytics
>
> • Response:
>
> 1 {
>
> 2 "todayRevenue": 1250.75, 3 "weeklyRevenue": 8750.50,
>
> 4 "monthlyRevenue": 32500.25 5 }

3 Pharmacist Endpoints

3.1 Create Pharmacist • Method: POST

> • URL: /api/pharmacists
>
> • Request Body:
>
> 1 {
>
> 2 "name": "John Pharmacist",
>
> 3 "email": "john.pharmacist@medix.com", 4 "phoneNumber":
> "+1234567890",
>
> 5 "password": "pharmacist123",
>
> 6 "address": "123 Pharmacy Street, Medical City" 7 }
>
> • Response:
>
> 1 {
>
> 2 "id": 2503001,
>
> 3 "name": "John Pharmacist",
>
> 4 "email": "john.pharmacist@medix.com", 5 "phoneNumber":
> "+1234567890",
>
> 6 "password": "pharmacist123",
>
> 7 "address": "123 Pharmacy Street, Medical City", 8 "doctor": null
>
> 9 }
>
> 7

3.2 Get Pharmacist by ID • Method: GET

> • URL: /api/pharmacists/2503001
>
> • Response:
>
> 1 {
>
> 2 "id": 2503001,
>
> 3 "name": "John Pharmacist",
>
> 4 "email": "john.pharmacist@medix.com", 5 "phoneNumber":
> "+1234567890",
>
> 6 "password": "pharmacist123",
>
> 7 "address": "123 Pharmacy Street, Medical City", 8 "doctor": null
>
> 9 }
>
> • Error Response:
>
> 1 {
>
> 2 "error": "Pharmacist not found", 3 "pharmacistId": 9999999
>
> 4 }

3.3 Login Pharmacist • Method: POST

> • URL: /api/pharmacists/by-email
>
> • Request Body:
>
> 1 {
>
> 2 "email": "john.pharmacist@medix.com", 3 "password": "pharmacist123"
>
> 4 }
>
> • Success Response:
>
> 1 {
>
> 2 "success": true,
>
> 3 "message": "Pharmacist found", 4 "data": {
>
> 5 "id": 2503001,
>
> 6 "name": "John Pharmacist",
>
> 7 "email": "john.pharmacist@medix.com", 8 "phoneNumber":
> "+1234567890",
>
> 9 "password": "pharmacist123",
>
> 10 "address": "123 Pharmacy Street, Medical City", 11 "doctor": null
>
> 12 } 13 }
>
> 8

3.4 Update Pharmacist • Method: PUT

> • URL: /api/pharmacists/2503001
>
> • Request Body:
>
> 1 {
>
> 2 "name": "John Updated Pharmacist", 3 "phoneNumber": "+0987654321",
>
> 4 "address": "456 New Pharmacy Ave, Medical City" 5 }
>
> • Response:
>
> 1 {
>
> 2 "id": 2503001,
>
> 3 "name": "John Updated Pharmacist",
>
> 4 "email": "john.pharmacist@medix.com", 5 "phoneNumber":
> "+0987654321",
>
> 6 "password": "pharmacist123",
>
> 7 "address": "456 New Pharmacy Ave, Medical City", 8 "doctor": null
>
> 9 }

3.5 Delete Pharmacist • Method: DELETE

> • URL: /api/pharmacists/2503001
>
> • Success Response:
>
> 1 {
>
> 2 "success": 3 "message": 4 }
>
> true,

"Pharmacist deleted successfully"

> 9
