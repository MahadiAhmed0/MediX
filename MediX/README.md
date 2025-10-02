# MediX - Comprehensive Medical Management System

<div align="center">
  <img src="./client/public/lo.png" alt="MediX Logo" width="200"/>
  
  [![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-green.svg)](https://spring.io/projects/spring-boot)
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-Academic-yellow.svg)](#license)
</div>

## 🎯 Overview

**MediX** is a comprehensive, full-stack medical management platform designed to streamline healthcare operations for medical facilities. Built with modern technologies, it provides role-based dashboards and functionality for doctors, pharmacists, receptionists, and patients, ensuring efficient healthcare delivery and management.

### 🏥 Key Features

- 👨‍⚕️ **Multi-Role Support**: Dedicated interfaces for Doctors, Pharmacists, Receptionists, and Patients
- 📅 **Appointment Management**: Complete scheduling and booking system
- 💊 **Prescription System**: Digital prescription creation, management, and processing
- 🏪 **Pharmacy Management**: Inventory tracking and invoice generation
- 📋 **Patient Records**: Comprehensive medical history and profile management
- 🔍 **Advanced Search**: Dynamic filtering and search capabilities
- 🔐 **Secure Authentication**: Role-based access control
- 📱 **Responsive Design**: Works seamlessly across all devices
- 🌙 **Dark Mode**: Built-in dark/light theme switching

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  Next.js        │◄──►│  Spring Boot     │◄──►│  MySQL          │
│  Frontend       │    │  Backend API     │    │  Database       │
│  (Port: 3000)   │    │  (Port: 8080)    │    │                 │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🛠️ Technology Stack

#### Frontend

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4.0
- **UI Components**: React 19 with React Icons
- **State Management**: React Context API
- **Build Tool**: Next.js built-in bundling

#### Backend

- **Framework**: Spring Boot 3.5.0
- **Language**: Java 17
- **Database**: MySQL 8.3.0 (with H2 for testing)
- **ORM**: Spring Data JPA
- **Build Tool**: Maven
- **API**: RESTful Web Services

#### Development Tools

- **Version Control**: Git & GitHub
- **Code Quality**: ESLint, TypeScript compiler
- **Testing**: Spring Boot Test, Jest (Frontend)
- **Documentation**: Comprehensive API docs

## 📊 Project Structure

```
MediX/
├── 📁 client/                    # Next.js Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 app/              # Next.js App Router pages
│   │   │   ├── 📁 admin/        # Admin dashboard & management
│   │   │   ├── 📁 doctor/       # Doctor interface & tools
│   │   │   ├── 📁 patient/      # Patient portal & services
│   │   │   ├── 📁 pharmacist/   # Pharmacy management
│   │   │   ├── 📁 receptionist/ # Reception & appointment booking
│   │   │   └── 📁 api/          # API route handlers
│   │   ├── 📁 components/       # Reusable React components
│   │   ├── 📁 contexts/         # React context providers
│   │   ├── 📁 services/         # API service functions
│   │   └── 📁 data/            # Static data & configurations
│   └── 📁 public/              # Static assets & images
│
├── 📁 MediXBackend/            # Spring Boot Backend API
│   ├── 📁 src/main/java/com/Backend/MediXBackend/
│   │   ├── 📁 User/            # Entity models (User, Doctor, Patient, etc.)
│   │   ├── 📁 UserController/  # REST API controllers
│   │   ├── 📁 UserRepository/  # Data access layer
│   │   ├── 📁 UserService/     # Business logic layer
│   │   └── 📁 Utils/           # Utility classes & helpers
│   └── 📁 src/main/resources/ # Configuration & database migrations
│
└── 📁 Documentation/           # Project documentation
    ├── 📄 API_DOCUMENTATION.md
    ├── 📄 PROJECT_DOCUMENTATION.md
    ├── 📄 PRESCRIPTION_SYSTEM_DOCUMENTATION.md
    └── 📄 Pharmacist_Full_API_Documentation.md
```

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following installed on your system:

- **Java 17+** - [Download here](https://www.oracle.com/java/technologies/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Maven 3.6+** - [Download here](https://maven.apache.org/)
- **MySQL 8.0+** - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

### 📥 Installation

1. **Clone the repository**

```bash
git clone https://github.com/RidwanRK/MediX.git
cd MediX
```

2. **Database Setup**

```sql
-- Create database
CREATE DATABASE medix_db;

-- Create user (optional)
CREATE USER 'medix_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON medix_db.* TO 'medix_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Backend Configuration**

```bash
cd MediXBackend
# Configure database connection in src/main/resources/application.properties
```

Create or update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medix_db
spring.datasource.username=medix_user
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

server.port=8080
```

4. **Start the Backend Server**

```bash
# In the MediXBackend directory
mvn clean install
mvn spring-boot:run
```

5. **Frontend Setup & Start**

```bash
# Open a new terminal and navigate to client directory
cd client
npm install
npm run dev
```

6. **Access the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: Available in the `/Documentation` folder

## 👥 User Roles & Features

### 👨‍⚕️ Doctor Dashboard

- **Patient Management**: View and manage patient records
- **Appointment Handling**: Schedule and manage appointments
- **Prescription System**: Create, edit, and manage prescriptions
- **Quick Prescribe**: Fast prescription creation with medicine suggestions
- **Medical History**: Access complete patient medical histories

### 💊 Pharmacist Interface

- **Prescription Processing**: View and process incoming prescriptions
- **Inventory Management**: Track medicine stock and availability
- **Invoice Generation**: Create and print invoices for patients
- **Stock Alerts**: Monitor low-stock medications
- **Sales Reports**: Track pharmacy sales and transactions

### 📋 Receptionist Portal

- **Appointment Booking**: Schedule appointments for patients
- **Patient Registration**: Register new patients in the system
- **Appointment Management**: Modify, cancel, or reschedule appointments
- **Patient Check-in**: Handle patient arrivals and check-ins
- **Vital Signs Entry**: Record patient vital signs and basic information

### 🏥 Patient Portal

- **Profile Management**: Update personal and contact information
- **Appointment Booking**: Book appointments with available doctors
- **Prescription History**: View past and current prescriptions
- **Medical Records**: Access personal medical history
- **Feedback System**: Provide feedback on services received

### 🔧 Admin Panel

- **User Management**: Create and manage system users
- **Role Assignment**: Assign and modify user roles
- **System Monitoring**: Monitor system usage and performance
- **Data Management**: Backup and restore system data
- **Settings Configuration**: System-wide settings and configurations

## 🔗 API Endpoints

### Authentication & Users

```
GET    /api/users              # Get all users
POST   /api/users              # Create new user
GET    /api/users/{id}         # Get user by ID
PUT    /api/users/{id}         # Update user
DELETE /api/users/{id}         # Delete user
```

### Appointments

```
GET    /api/appointments       # Get all appointments
POST   /api/appointments       # Create appointment
GET    /api/appointments/{id}  # Get appointment by ID
PUT    /api/appointments/{id}  # Update appointment
DELETE /api/appointments/{id}  # Delete appointment
```

### Prescriptions

```
GET    /api/prescriptions      # Get all prescriptions
POST   /api/prescriptions      # Create prescription
GET    /api/prescriptions/{id} # Get prescription by ID
PUT    /api/prescriptions/{id} # Update prescription
```

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🧪 Development & Testing

### Running Tests

```bash
# Backend tests
cd MediXBackend
mvn test

# Frontend tests
cd client
npm test
```

### Development Mode

```bash
# Backend with hot reload
cd MediXBackend
mvn spring-boot:run

# Frontend with hot reload
cd client
npm run dev
```

### Building for Production

```bash
# Backend
cd MediXBackend
mvn clean package

# Frontend
cd client
npm run build
npm start
```

## 📚 Documentation

- **[Project Documentation](./PROJECT_DOCUMENTATION.md)** - Comprehensive project overview
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Prescription System](./PRESCRIPTION_SYSTEM_DOCUMENTATION.md)** - Prescription workflow details
- **[Pharmacist Guide](./Pharmacist_Full_API_Documentation.md)** - Pharmacist module documentation
- **[Weekly Progress](./Weekly_Supervisor_Suggestions.md)** - Development timeline and feedback

## 🤝 Contributing

This is an academic project for SPL course by our team:

### Team Members

- **Nuren Fahmid**
- **Ridwan Raees Khan**
- **Mahadi Ahmed**

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## 🔮 Future Enhancements

- 🔔 **Real-time Notifications**: Push notifications for appointments and prescriptions
- 📊 **Analytics Dashboard**: Advanced reporting and analytics for all roles
- 🔒 **Enhanced Security**: Two-factor authentication and audit logging
- 📱 **Mobile App**: Native mobile applications for iOS and Android
- 🌐 **Multi-language Support**: Internationalization for multiple languages
- 🤖 **AI Integration**: AI-powered diagnosis suggestions and drug interaction checks
- 📋 **Electronic Health Records**: Complete EHR integration
- 💳 **Payment Gateway**: Online payment processing for appointments and medications

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**

- Ensure Java 17+ is installed
- Check database connection settings
- Verify MySQL is running

**Frontend build fails:**

- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Update dependencies: `npm update`

**Database connection errors:**

- Verify MySQL credentials
- Check database exists
- Ensure proper permissions

For more issues, check our [Issues page](https://github.com/RidwanRK/MediX/issues).

## 📄 License

This project is developed for academic purposes as part of the Software Project Lab (SPL) course. All rights reserved to **SPL Team 5**.

---

<div align="center">
  
**Built with ❤️ by SPL Team 5**

[⭐ Star this repository](https://github.com/RidwanRK/MediX) | [🐛 Report Bug](https://github.com/RidwanRK/MediX/issues) | [💡 Request Feature](https://github.com/RidwanRK/MediX/issues)

</div>
