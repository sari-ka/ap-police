# AP Police Academy – Healthcare Management System

## Project Overview

The AP Police Academy Healthcare Management System is a web-based application designed to digitize healthcare-related services for police employees and their family members.

The platform connects employees, administrators, and hospital staff, allowing medical information and healthcare activities to be managed through a centralized system.

Employees can access their medical information and reports digitally, while hospital staff can manage their respective operations.

## Problem Statement

Traditional healthcare processes often require employees to visit hospitals physically to access medical information and reports. Managing employee and family medical records and coordinating different hospital departments can also involve manual processes.

This application aims to simplify these activities through a centralized digital platform.

## Key Features

- Employee management and profile handling.
- Family member registration and management.
- Medical diagnosis and prescription management.
- Medicine and pharmacy management.
- Disease and diagnostic record management.
- Hospital/institute management.
- Medicine inventory and ledger management.
- Analytics and reporting.
- Role-based access to different application functionalities.

## User Roles

The application supports different categories of users:

- Admin
- Employees
- Hospital Staff:
  - Hospital Administrator
  - Doctor
  - Pharmacist
  - Diagnostics Staff
  - X-Ray Staff

## Technology Stack

<img width="762" height="607" alt="image" src="https://github.com/user-attachments/assets/7394389c-2587-41ea-8ea1-6004f1d1aeff" />


## System Architecture

The application follows a client-server architecture.

1. **Frontend:** React provides the user interface and handles user interactions.
2. **Backend:** Node.js and Express.js handle HTTP requests, application logic, and API operations.
3. **Database:** MongoDB stores application data, with Mongoose used for database operations.
4. **Communication:** The frontend communicates with the backend through REST APIs using Axios.

## Backend API Modules

The backend contains separate API modules for different functionalities:

- Employee API
- Family Member API
- Prescription API
- Diagnosis API
- Medicine API
- Institute API
- Manufacturer API
- Disease API
- Ledger API
- Indent API
- Analytics API
- Medicine Limit API

## Project Structure

```text
ap-police/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── apis/
│   ├── models/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- MongoDB

### 1. Clone the repository

```bash
git clone <repository-url>
cd ap-police
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the server directory:

```env
PORT=5200
MONGO_URL=your_mongodb_connection_string
```

Start the backend using:

```bash
node server.js
```

### 3. Setup Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will run on the local development URL displayed by Vite.

## Future Enhancements

- Improve healthcare report accessibility.
- Enhance notification and appointment management.
- Improve analytics and reporting capabilities.
- Strengthen validation and security mechanisms.
- Improve the overall user experience.

