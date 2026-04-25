package com.edutrack.models;

public class UserFactory {
    

    public static User createUser(String id, String name, String email, String password, String role, String subject) {
        if ("TEACHER".equalsIgnoreCase(role)) {
            return new Teacher(id, name, email, password, role, subject);
        } else {
            return new User(id, name, email, password, role);
        }
    }
}
