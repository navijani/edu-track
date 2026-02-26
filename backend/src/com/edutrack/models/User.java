package com.edutrack.models;

public class User {
    // Encapsulation: Private data hidden from other classes
    private String id;
    private String name;
    private String email;
    private String password;
    private String role;

    public User(String id, String name, String email, String password, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters for controlled access
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
}