# MediX: Comprehensive Medical Management System

## Project Overview

MediX is a full-stack medical management platform designed to streamline the workflow of doctors, pharmacists, receptionists, and patients. The system provides modules for appointment scheduling, prescription management, pharmacy inventory, and patient records, ensuring a seamless healthcare experience for all stakeholders.

---

## Team Information

**Team Name:** SPL Team 5

**Team Members:**

- Nuren Fahmid (ID: 220042121)
- Ridwan Raees Khan (ID: 220042120)
- Mahadi Ahmed (ID: 220042163)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Module Descriptions](#module-descriptions)
6. [Installation & Setup](#installation--setup)
7. [API Overview](#api-overview)
8. [Development Timeline](#development-timeline)
9. [Supervisor Feedback](#supervisor-feedback)
10. [Future Improvements](#future-improvements)
11. [License](#license)

---

## Introduction

MediX aims to digitize and optimize the daily operations of a healthcare facility. By integrating appointment booking, prescription handling, pharmacy management, and patient record-keeping, MediX reduces manual workload and enhances patient care.

---

## Features

- Role-based dashboards for Doctor, Pharmacist, Receptionist, and Patient
- Appointment scheduling and management
- Prescription creation, editing, and history tracking
- Pharmacy inventory and invoice management
- Patient profile and medical record management
- Dynamic search and filtering across modules
- Feedback and notification system
- Secure authentication and user management

---

## System Architecture

- **Frontend:** Next.js (React, TypeScript)
- **Backend:** Spring Boot (Java)
- **Database:** MySql
- **API Communication:** RESTful APIs
- **Deployment:** Modular, supports local and cloud deployment

```
[User] <-> [Next.js Frontend] <-> [Spring Boot Backend] <-> [Database]
```

---

## Technology Stack

- **Frontend:**
  - Next.js
  - React
  - TypeScript
  - CSS Modules
- **Backend:**
  - Spring Boot
  - Java
  - Maven
- **Database:**
  - SQL (schema and migrations included)
- **Other Tools:**
  - ESLint, PostCSS, Git, GitHub

---

## Module Descriptions

### Doctor Module

- Manage appointments, view and edit patient records
- Create, edit, and print prescriptions
- Quick prescribe and medicine suggestion features

### Pharmacist Module

- View and process prescriptions
- Manage pharmacy inventory
- Generate and print invoices

### Receptionist Module

- Book and manage appointments
- Filter and paginate appointment lists
- Enter patient vitals

### Patient Module

- View and edit profile
- Book appointments
- View prescription history
- Provide feedback

---

## Installation & Setup

### Prerequisites

- Node.js (v18+)
- Java (JDK 17+)
- Maven
- (Database server, e.g., MySQL/PostgreSQL)

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Backend Setup

```bash
cd MediXBackend
mvn spring-boot:run
```

### Database Setup

- Configure database credentials in `application.properties`.
- Run provided SQL migrations in `src/main/resources/db/migration/`.

---

## API Overview

- RESTful endpoints for all modules
- API documentation available in `API_DOCUMENTATION.md` and related files
- Authentication and authorization enforced on sensitive endpoints

---

## Development Timeline

- Weeks 2–12: Iterative development with weekly supervisor feedback
- Week 2: Proposal presentation
- Week 8: Progress presentation
- Week 12: Final touches and user feedback

---

## Supervisor Feedback

- Weekly feedback incorporated into feature development and UI/UX improvements
- See `Weekly_Supervisor_Suggestions.md` for a comprehensive list

---

## Future Improvements

- Integrate real-time notifications
- Add role-based analytics dashboards
- Implement advanced security features (2FA, audit logs)
- Expand API for third-party integrations

---

## License

This project is for academic purposes by SPL Team 5. All rights reserved.
