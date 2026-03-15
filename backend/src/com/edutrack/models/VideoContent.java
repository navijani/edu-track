package com.edutrack.models;
import java.util.List;

public class VideoContent {
    private String teacherId;
    private String subject;
    private String title;
    private String videoUrl;
    private List<VideoQuestion> questions;

    public VideoContent(String teacherId, String subject, String title, String videoUrl, List<VideoQuestion> questions) {
        this.teacherId = teacherId;
        this.subject = subject;
        this.title = title;
        this.videoUrl = videoUrl;
        this.questions = questions;
    }

    public String getTeacherId() { return teacherId; }
    public String getSubject() { return subject; }
    public String getTitle() { return title; }
    public String getVideoUrl() { return videoUrl; }
    public List<VideoQuestion> getQuestions() { return questions; }
}