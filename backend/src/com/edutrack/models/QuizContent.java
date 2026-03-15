package com.edutrack.models;
import java.util.List;

public class QuizContent {
    private String teacherId;
    private String subject;
    private String title;
    private int durationMinutes;
    private String scheduledDate;
    private int totalMarks;
    private String deadline;
    private List<QuizQuestion> questions;

    public QuizContent(String teacherId, String subject, String title, int durationMinutes, String scheduledDate, int totalMarks, List<QuizQuestion> questions) {
        this.teacherId = teacherId;
        this.subject = subject;
        this.title = title;
        this.durationMinutes = durationMinutes;
        this.scheduledDate = scheduledDate;
        this.totalMarks = totalMarks;
        this.questions = questions;
    }

    public String getTeacherId() { return teacherId; }
    public String getSubject() { return subject; }
    public String getTitle() { return title; }
    public int getDurationMinutes() { return durationMinutes; }
    public String getScheduledDate() { return scheduledDate; }
    public int getTotalMarks() { return totalMarks; }
    public List<QuizQuestion> getQuestions() { return questions; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
}