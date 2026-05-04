package com.edutrack.observer;

import java.util.ArrayList;
import java.util.List;

/**
 * OBSERVER PATTERN — ContentPublisher (Subject / Publisher)
 *
 * Maintains the list of observers and broadcasts events to all of them.
 * This is the "Subject" role in the classic Observer pattern.
 *
 * Handlers (QuizHandler, VideoHandler) extend or hold a ContentPublisher
 * and call notifyObservers() after successfully saving content.
 *
 * To add a new reaction to content publishing (e.g., sending emails, updating
 * analytics), simply create a new ContentPublishObserver and register it —
 * zero changes needed in any Handler.
 */
public class ContentPublisher {

    // List of all registered observers
    private final List<ContentPublishObserver> observers = new ArrayList<>();

    /**
     * Registers a new observer to receive publish notifications.
     */
    public void addObserver(ContentPublishObserver observer) {
        observers.add(observer);
    }

    /**
     * Removes an observer (e.g. if its functionality should be disabled).
     */
    public void removeObserver(ContentPublishObserver observer) {
        observers.remove(observer);
    }

    /**
     * Broadcasts a content-publish event to ALL registered observers.
     * Called by the handler after content is successfully saved to the DB.
     *
     * @param teacherId   ID of the teacher who published the content
     * @param targetClass Target class/grade
     * @param subject     Subject area
     * @param contentType "Quiz", "Video", or "Document"
     * @param title       Title of the published item
     */
    public void notifyObservers(String teacherId, String targetClass, String subject, String contentType, String title) {
        System.out.println("[ContentPublisher] Broadcasting publish event to " + observers.size() + " observer(s)...");
        for (ContentPublishObserver observer : observers) {
            observer.onContentPublished(teacherId, targetClass, subject, contentType, title);
        }
    }
}
