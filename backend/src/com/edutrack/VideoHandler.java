package com.edutrack;

import com.edutrack.dao.VideoDAO;
import com.edutrack.models.VideoContent;
import com.edutrack.models.VideoQuestion;
import com.edutrack.observer.ContentPublisher;
import com.edutrack.observer.NotificationObserver;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * TEMPLATE METHOD PATTERN — extends BaseHandler
 *   CORS headers + OPTIONS preflight handled by BaseHandler.handle().
 *   Only video-specific GET/POST/DELETE logic is here.
 *
 * OBSERVER PATTERN — uses ContentPublisher
 *   Replaces the old ad-hoc `new NotificationDAO().addNotification(...)` call
 *   with a clean observer notification.
 */
public class VideoHandler extends BaseHandler {

    private final VideoDAO videoDAO = new VideoDAO();

    // Observer Pattern: publisher broadcasts to all registered observers
    private final ContentPublisher publisher;

    public VideoHandler() {
        this.publisher = new ContentPublisher();
        publisher.addObserver(new NotificationObserver());
    }

    /**
     * Hook method from BaseHandler (Template Method pattern).
     */
    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {

        // --- GET: Fetch videos ---
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();

            if (query != null && query.startsWith("teacherId=")) {
                String teacherId = query.split("=")[1];
                sendResponse(exchange, 200, videoDAO.getVideosByTeacherJson(teacherId));
            } else if (query != null && query.startsWith("subject=")) {
                String subject = "";
                String targetClass = "";
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length > 1) {
                        try {
                            String value = URLDecoder.decode(pair[1], StandardCharsets.UTF_8.name());
                            if (pair[0].equals("subject"))     subject     = value;
                            if (pair[0].equals("targetClass")) targetClass = value;
                        } catch (Exception e) {
                            System.out.println("Warning: Could not decode URL parameter.");
                        }
                    }
                }
                sendResponse(exchange, 200, videoDAO.getVideosBySubjectAndClassJson(subject, targetClass));
            } else {
                sendResponse(exchange, 400, "[]");
            }
            return;
        }

        // --- DELETE: Remove a video ---
        if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("id=")) {
                String id = query.split("=")[1];
                boolean deleted = videoDAO.deleteVideo(id);
                sendResponse(exchange, deleted ? 200 : 500, deleted ? "{\"success\":true}" : "{\"success\":false}");
            }
            return;
        }

        // --- POST: Upload a new video ---
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                String teacherId  = body.split("\"teacherId\":\"")[1].split("\"")[0];
                String subject    = body.split("\"subject\":\"")[1].split("\"")[0];
                String title      = body.split("\"title\":\"")[1].split("\"")[0];
                String videoUrl   = body.split("\"videoUrl\":\"")[1].split("\"")[0];
                String targetClass = body.contains("\"targetClass\":\"") ? body.split("\"targetClass\":\"")[1].split("\"")[0] : "";

                List<VideoQuestion> questionList = new ArrayList<>();
                if (body.contains("\"questions\":[{")) {
                    String questionsPart = body.substring(body.indexOf("\"questions\":[{") + 13);
                    questionsPart = questionsPart.substring(0, questionsPart.lastIndexOf("]"));
                    for (String block : questionsPart.split("},\\{")) {
                        String q = block.split("\"question\":\"")[1].split("\"")[0];
                        String a = block.split("\"answer\":\"")[1].split("\"")[0];
                        questionList.add(new VideoQuestion(q, a));
                    }
                }

                VideoContent newVideo = new VideoContent(teacherId, subject, title, videoUrl, targetClass, questionList);

                if (videoDAO.saveVideoAndQuestions(newVideo)) {
                    // OBSERVER PATTERN: Notify all observers — no inline DAO call needed
                    publisher.notifyObservers(teacherId, targetClass, subject, "Video", title);
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false}");
            }
        }
    }
}