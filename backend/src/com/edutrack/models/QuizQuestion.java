package com.edutrack.models;

public class QuizQuestion {
    private String question;
    private String imageUrl;
    private String optionsJson; // Holds the dynamic options array
    private String correctAnswer;

    public QuizQuestion(String question, String imageUrl, String optionsJson, String correctAnswer) {
        this.question = question;
        this.imageUrl = imageUrl;
        this.optionsJson = optionsJson;
        this.correctAnswer = correctAnswer;
    }

    public String getQuestion() { return question; }
    public String getImageUrl() { return imageUrl; }
    public String getOptionsJson() { return optionsJson; }
    public String getCorrectAnswer() { return correctAnswer; }
}