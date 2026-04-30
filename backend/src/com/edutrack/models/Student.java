package com.edutrack.models;

// Inheritance: Student gets all User properties, plus a studentClass
public class Student extends User {
    private String studentClass;

    public Student(
        String id, 
        String name, 
        String email, 
        String password, 
        String role, 
        String studentClass) {
            
        super(id, name, email, password, role); // Calls the User constructor
        this.studentClass = studentClass;
    }

    public String getStudentClass() {
        return studentClass;
    }
}
