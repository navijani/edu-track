package com.edutrack.models;

public class Admin extends User {
    private String role;
    
    public Admin(String id, String email, String name, String role) {
        super(id, name, email, "", role);
        this.role = role;
    }

    @Override
    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
