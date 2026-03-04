package com.edutrack.models;

// Inheritance: Teacher gets all User properties, plus a subject
public class Teacher extends User {
    private String subject;

    public Teacher(
        String id, 
        String name, 
        String email, 
        String password, 
        String role, 
        String subject) {
            
        super(id, name, email, password, role); // Calls the User constructor
        this.subject = subject;
    }

    public String getSubject() {
        return subject;
    }
}