package com.edutrack.models;

public class UserFactory {
    

    public static User createUser(String id, String name, String email, String password, String role, String subject, String studentClass) {
        if ("TEACHER".equalsIgnoreCase(role)) {
            return new Teacher(id, name, email, password, role, subject);
        } else if ("STUDENT".equalsIgnoreCase(role)) {
            return new Student(id, name, email, password, role, studentClass);
        } else {
            return new User(id, name, email, password, role);
        }
    }
}
