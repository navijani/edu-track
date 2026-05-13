package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.edutrack.dao.QuizDAO;
import com.edutrack.models.QuizContent;
import com.edutrack.models.QuizQuestion;
import com.edutrack.observer.ContentPublisher;
import com.edutrack.observer.NotificationObserver;
import java.net.URLDecoder;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * TEMPLATE METHOD PATTERN — extends BaseHandler
 *   The CORS headers and OPTIONS preflight are handled by BaseHandler.handle().
 *   This class only implements handleRequest() with QuizHandler-specific logic.
 *
 * OBSERVER PATTERN — uses ContentPublisher
 *   When a quiz is saved, notifyObservers() is called instead of the old
 *   ad-hoc `new NotificationDAO().addNotification(...)` inline call.
 *   Any number of new reactions (e.g. email, analytics) can be added by
 *   registering more observers — no changes to this file required.
 */
public class QuizHandler extends BaseHandler {

    private final QuizDAO quizDAO = new QuizDAO();

    // Observer Pattern: the publisher that will broadcast to all registered observers
    private final ContentPublisher publisher;

    public QuizHandler() {
        this.publisher = new ContentPublisher();
        // Register the notification observer — it will fire on every successful publish
        publisher.addObserver(new NotificationObserver());
    }

    /**
     * Hook method from BaseHandler (Template Method pattern).
     * Handles GET (fetch), POST (create), and DELETE quiz operations.
     */
    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {

        // --- GET: Fetch quizzes ---
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();

            // 1. Teacher Dashboard Request
            if (query != null && query.startsWith("teacherId=")) {
                String teacherId = query.split("=")[1];
                sendResponse(exchange, 200, quizDAO.getQuizzesByTeacherJson(teacherId));
            }
            // 2. Student Dashboard Request: filter by subject AND class
            else if (query != null && query.startsWith("subject=")) {
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
                sendResponse(exchange, 200, quizDAO.getQuizzesBySubjectAndClassJson(subject, targetClass));
            } else {
                sendResponse(exchange, 400, "[]");
            }
            return;
        }

        // --- DELETE: Remove a quiz ---
        if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("id=")) {
                String id = query.split("=")[1];
                sendResponse(exchange, quizDAO.deleteQuiz(id) ? 200 : 500,
                        quizDAO.deleteQuiz(id) ? "{\"success\":true}" : "{\"success\":false}");
            }
            return;
        }

        // --- POST: Create a new quiz ---
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                String teacherId     = body.split("\"teacherId\":\"")[1].split("\"")[0];
                String subject       = body.split("\"subject\":\"")[1].split("\"")[0];
                String title         = body.split("\"title\":\"")[1].split("\"")[0];
                int    duration      = Integer.parseInt(body.split("\"duration\":")[1].split(",")[0].trim());
                int    totalMarks    = Integer.parseInt(body.split("\"totalMarks\":")[1].split(",")[0].trim());
                String scheduledDate = body.split("\"scheduledDate\":\"")[1].split("\"")[0];
                String deadline      = body.contains("\"deadline\":\"") ? body.split("\"deadline\":\"")[1].split("\"")[0] : "";
                String targetClass   = body.contains("\"targetClass\":\"") ? body.split("\"targetClass\":\"")[1].split("\"")[0] : "";

                // Parse questions array
                List<QuizQuestion> questionList = new ArrayList<>();
                if (body.contains("\"questions\":[{")) {
                    String questionsPart = body.substring(body.indexOf("\"questions\":[{") + 13);
                    questionsPart = questionsPart.substring(0, questionsPart.lastIndexOf("]"));
                    for (String block : questionsPart.split("},\\{")) {
                        String q       = block.split("\"question\":\"")[1].split("\"")[0];
                        String imgUrl  = block.contains("\"imageUrl\":\"") ? block.split("\"imageUrl\":\"")[1].split("\"")[0] : "";
                        String options = "[" + block.split("\"options\":\\[")[1].split("\\]")[0] + "]";
                        String correct = block.split("\"correctAnswer\":\"")[1].split("\"")[0];
                        questionList.add(new QuizQuestion(q, imgUrl, options, correct));
                    }
                }

                QuizContent newQuiz = new QuizContent(teacherId, subject, title, duration, scheduledDate, totalMarks, targetClass, questionList);
                newQuiz.setDeadline(deadline);

                if (quizDAO.saveQuizAndQuestions(newQuiz)) {
                    // OBSERVER PATTERN: Notify all observers — no inline DAO call needed
                    publisher.notifyObservers(teacherId, targetClass, subject, "Quiz", title);
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