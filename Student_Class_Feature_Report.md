# Feature Implementation Report: Student Class Assignment

## 1. Overview
This report details the implementation of the "Student Class Assignment" feature in the EduTrack system. Previously, all student users were created generically without a specific class/grade assignment. The system has been extended to allow administrators to assign a specific class (e.g., Kindergarten, Grade 1 to 12) when registering a new student.

## 2. Architectural Changes
The implementation required full-stack modifications across the Database, Java Backend, and React Frontend.

### 2.1 Database Schema Update
To persist the student's class information, a new column was added to the existing `users` table.
```sql
ALTER TABLE users ADD COLUMN student_class VARCHAR(50) DEFAULT NULL;
```
This nullable column allows the system to store class information exclusively for students, while remaining `NULL` for Teachers and Parents.

### 2.2 Backend: Object-Oriented Modeling
We adhered to Object-Oriented Programming principles by extending the data models:
- **`Student.java`**: A new class was created extending the base `User` class. It introduces the `studentClass` property and its associated getter method, mirroring how the `Teacher` class manages the `subject` property.

### 2.3 Backend: Design Patterns
The system leverages design patterns which were updated to accommodate the new feature:
- **Factory Pattern (`UserFactory.java`)**: The `createUser` method signature was updated to accept `studentClass`. It now instantiates and returns a `Student` object when the requested role is `"STUDENT"`.
- **Strategy Pattern (`UserHandler.java`)**: Inside the `UserPostStrategy` (responsible for handling registration requests), the JSON payload parsing was updated to extract the `studentClass` string and pass it to the `UserFactory`.

### 2.4 Backend: Data Access Object (DAO)
The `UserDAO.java` was comprehensively updated to handle the new database column:
- **`saveUser()`**: Updated the `INSERT` SQL statement to include the `student_class` column. Uses `PreparedStatement` to safely inject the value.
- **`getAllUsersJson()`**: Updated the `SELECT` statement to retrieve `student_class`. Formats the output for the frontend JSON array.
- **`authenticateUser()`**: Retrieves the `student_class` upon successful login to construct the correct polymorphic `Student` object via the Factory.

## 3. Frontend Implementation
The React administrative interface was updated to collect and display the new data.

### 3.1 Registration Form (`AddUser.js`)
- Added `studentClass` to the local React state.
- Implemented conditional rendering: When the admin selects "Student" from the Role dropdown, a new dynamic dropdown appears.
- The dropdown provides options ranging from "Kindergarten" to "Grade 12" using an array map function, eliminating the need to hardcode 12 separate HTML options.
- Ensure state cleanliness by resetting `studentClass`, `subject`, and `childId` whenever the user role is changed during form fill-out.

### 3.2 User Directory (`UsersList.js`)
- Updated the "View Details" modal.
- Added conditional rendering to display the `Class` field when the selected user's role is `"STUDENT"`.

## 4. Conclusion
The implementation successfully integrates the concept of student classes into the EduTrack ecosystem. By maintaining existing design patterns (Factory and Strategy) and applying proper OOP inheritance, the codebase remains clean, modular, and easily extensible for future academic features.
