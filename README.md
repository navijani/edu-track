# 🎓 EduTrack

![EduTrack](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/Frontend-React.js-blue)
![Java](https://img.shields.io/badge/Backend-Java%2021-red)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)

EduTrack is an educational tracking and learning management system built for administrators, teachers, and students. It streamlines the distribution of educational materials and centralizes student data, all within a beautiful and intuitive interface.

## ✨ Features

*   **Role-Based Dashboards**: Tailored experiences for Administrators, Teachers, and Students.
*   **Student Class Assignment**: Administrators can assign students to specific classes (Kindergarten to Grade 12) during registration.
*   **Targeted Content Delivery**: Teachers can upload materials (Documents, Videos, Quizzes) and target them to specific grade levels, ensuring students only see relevant content.
*   **Comprehensive Media Support**: Full support for video playback, rich document viewing, and interactive quizzes.
*   **User Directory**: Easily manage and view details of all users within the system.

## 🛠️ Technology Stack

*   **Frontend**: React.js, React Router, Axios, Recharts, React-Icons
*   **Backend**: Java (Eclipse Temurin 21 JDK), Custom Lightweight HTTP Server, JDBC
*   **Database**: MySQL
*   **Architecture**: Object-Oriented Design (Factory and Strategy Patterns)
*   **Containerization**: Docker support for the backend service

## 🚀 Getting Started

### Prerequisites

*   **Node.js** and **npm** (for the frontend)
*   **Java 21 JDK** (for the backend)
*   **MySQL Server**
*   *(Optional)* **Docker**

### 1. Database Setup

1.  Create a MySQL database.
2.  Import the provided schema and data:
    ```bash
    mysql -u [username] -p [database_name] < studentdb.sql
    ```

### 2. Backend Setup

The backend runs on port `8080` by default.

**Option A: Local Development**
1. Navigate to the `backend/` directory.
2. Compile and run the Java application. Ensure the MySQL connector jar in `lib/` is on your classpath.

**Option B: Using Docker**
1. Navigate to the `backend/` directory.
2. Build the Docker image:
   ```bash
   docker build -t edutrack-backend .
   ```
3. Run the container:
   ```bash
   docker run -p 8080:8080 edutrack-backend
   ```

### 3. Frontend Setup

The frontend is a React application built with Create React App.

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
The frontend will typically run on `http://localhost:3000`.

## 📜 Documentation

For more detailed technical information on feature implementations, refer to the following reports:
*   [Student Class Feature Report](./Student_Class_Feature_Report.md)
*   [Material Target Class Plan](./Material_Target_Class_Plan.md)

---
*Created as the first project in the program construction module.*
