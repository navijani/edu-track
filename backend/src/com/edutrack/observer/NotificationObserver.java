package com.edutrack.observer;

import com.edutrack.dao.NotificationDAO;

/**
 * OBSERVER PATTERN — NotificationObserver (Concrete Observer)
 *
 * This is the concrete implementation of ContentPublishObserver.
 * When notified that content has been published, it inserts a notification
 * record into the database via NotificationDAO.
 *
 * BEFORE (the problem in QuizHandler and VideoHandler):
 *   new com.edutrack.dao.NotificationDAO().addNotification(...) was called
 *   as an ad-hoc inline side-effect buried inside the save logic.
 *
 * AFTER (using Observer):
 *   Handlers register this observer. When content is saved successfully,
 *   they call notifyObservers(), which triggers this class automatically.
 *   The handler no longer needs to know HOW notifications are sent.
 */
public class NotificationObserver implements ContentPublishObserver {

    private final NotificationDAO notificationDAO;

    public NotificationObserver() {
        this.notificationDAO = new NotificationDAO();
    }

    /**
     * Reacts to the content-published event by writing a notification to the DB.
     */
    @Override
    public void onContentPublished(String teacherId, String targetClass, String subject, String contentType, String title) {
        boolean sent = notificationDAO.addNotification(teacherId, targetClass, subject, contentType, title);
        if (sent) {
            System.out.println("[NotificationObserver] Notification sent: " + contentType + " '" + title + "' → Class " + targetClass);
        } else {
            System.out.println("[NotificationObserver] WARNING: Failed to send notification for '" + title + "'");
        }
    }
}
