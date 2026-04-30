# Target Class Assignment for Materials Implementation Plan

## Overview
Currently, when a teacher uploads educational material (Documents, Videos, Quizzes) to a subject, it becomes visible to all students enrolled in that subject, regardless of their grade level. The goal is to allow teachers to specify a "Target Class" (e.g., Grade 10) when creating materials so that students only see content relevant to their grade level.

## User Review Required

> [!CAUTION]
> **Database Modification Required**
> Implementing this will require adding a new column to three tables in your database: `documents`, `videos`, and `quizzes`. Please review the **Verification Plan** below for the SQL commands you will need to run in phpMyAdmin before testing these changes.

## Proposed Changes

---

### 1. Database Schema Updates
Three tables must be updated to store the target class:
- `documents`
- `videos`
- `quizzes`
A new column `target_class` will be added to each.

### 2. Backend (Java Models)
The Content models must be updated to hold the `targetClass` property.
- #### [MODIFY] `backend/src/com/edutrack/models/DocumentContent.java`
- #### [MODIFY] `backend/src/com/edutrack/models/VideoContent.java`
- #### [MODIFY] `backend/src/com/edutrack/models/QuizContent.java`
  *Add `targetClass` to the fields, constructor, and getters.*

### 3. Backend (Data Access Objects)
The DAOs must be updated to save and query by the new column.
- #### [MODIFY] `backend/src/com/edutrack/dao/DocumentDAO.java`
- #### [MODIFY] `backend/src/com/edutrack/dao/VideoDAO.java`
- #### [MODIFY] `backend/src/com/edutrack/dao/QuizDAO.java`
  - Update `save...` methods to `INSERT INTO ... (..., target_class)`
  - Update `get...BySubjectJson` to `get...BySubjectAndClassJson` by modifying the `SELECT` to use `WHERE subject = ? AND target_class = ?`

### 4. Backend (API Handlers)
The Handlers must extract the new data from the API calls.
- #### [MODIFY] `backend/src/com/edutrack/DocumentHandler.java`
- #### [MODIFY] `backend/src/com/edutrack/VideoHandler.java`
- #### [MODIFY] `backend/src/com/edutrack/QuizHandler.java`
  - **POST**: Extract `targetClass` from the incoming JSON body.
  - **GET**: Extract `targetClass` from the URL query parameters and pass it to the DAO.

### 5. Frontend (Teacher Upload Forms)
Teachers need a dropdown to select the target class.
- #### [MODIFY] `frontend/src/teacher/TeacherAddDocument.js`
- #### [MODIFY] `frontend/src/teacher/TeacherAddVideo.js`
- #### [MODIFY] `frontend/src/teacher/TeacherAddQuiz.js`
  - Add `targetClass` to React state.
  - Render a dropdown matching the student classes (Kindergarten to Grade 12).
  - Include `targetClass` in the POST `payload`.

### 6. Frontend (Student Dashboards)
Students need to only fetch materials for their class.
- #### [MODIFY] `frontend/src/student/StudentDocuments.js`
- #### [MODIFY] `frontend/src/student/StudentVideos.js`
- #### [MODIFY] `frontend/src/student/StudentQuizzes.js`
  - Update the `axios.get` call to include `&targetClass=${encodeURIComponent(user.studentClass)}`.

---

## Verification Plan

### Database Migration
Before testing, execute the following SQL commands in phpMyAdmin:
```sql
ALTER TABLE documents ADD COLUMN target_class VARCHAR(50) DEFAULT NULL;
ALTER TABLE videos ADD COLUMN target_class VARCHAR(50) DEFAULT NULL;
ALTER TABLE quizzes ADD COLUMN target_class VARCHAR(50) DEFAULT NULL;
```

### Manual Verification
1. Log in as a Teacher and assign a Document to "Grade 10" and a Video to "Grade 11".
2. Log in as a Grade 10 Student. Verify that only the Document appears.
3. Log in as a Grade 11 Student. Verify that only the Video appears.
