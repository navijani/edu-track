package com.edutrack.models;

public class Subject {
    // Encapsulation: Private fields
    private String code;
    private String title;

    // Constructor
    public Subject(String code, String title) {
        this.code = code;
        this.title = title;
    }

    // Getters
    public String getCode() { return code; }
    public String getTitle() { return title; }
}