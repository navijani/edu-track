package com.edutrack.observer;

/**
 * OBSERVER PATTERN — ContentPublishObserver (Subject Interface)
 *
 * Defines the contract that all observers of content-publish events must implement.
 *
 * When a teacher publishes any content (Quiz, Video, Document), all registered
 * observers are notified automatically. This decouples the content-saving logic
 * from the notification side-effect.
 *
 * Used by: QuizHandler, VideoHandler, DocumentHandler
 */
public interface ContentPublishObserver {

    /**
     * Called automatically when a piece of content is successfully published.
     *
     * @param teacherId   ID of the teacher who created the content
     * @param targetClass The class the content is targeted at (e.g. "Grade 10")
     * @param subject     The subject (e.g. "Mathematics")
     * @param contentType Human-readable type label: "Quiz", "Video", or "Document"
     * @param title       Title of the published content
     */
    void onContentPublished(String teacherId, String targetClass, String subject, String contentType, String title);
}
