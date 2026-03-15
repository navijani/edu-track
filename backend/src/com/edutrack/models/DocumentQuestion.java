package com.edutrack.models;

public class DocumentQuestion {
    private String question;
    private String answer;

    public DocumentQuestion(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }

    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
}