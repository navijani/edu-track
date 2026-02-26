package com.edutrack.models;

public class VideoQuestion {
    private String question;
    private String answer;

    public VideoQuestion(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }

    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
}