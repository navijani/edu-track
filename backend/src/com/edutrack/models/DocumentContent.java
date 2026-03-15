package com.edutrack.models;
import java.util.List;

public class DocumentContent {
    private String teacherId;
    private String subject;
    private String title;
    private String documentUrl;
    private List<DocumentQuestion> questions;

    public DocumentContent(String teacherId, String subject, String title, String documentUrl, List<DocumentQuestion> questions) {
        this.teacherId = teacherId;
        this.subject = subject;
        this.title = title;
        this.documentUrl = documentUrl;
        this.questions = questions;
    }

    public String getTeacherId() { return teacherId; }
    public String getSubject() { return subject; }
    public String getTitle() { return title; }
    public String getDocumentUrl() { return documentUrl; }
    public List<DocumentQuestion> getQuestions() { return questions; }
}