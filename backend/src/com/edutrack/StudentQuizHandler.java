package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.edutrack.dao.StudentQuizDAO;

import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * TEMPLATE METHOD PATTERN — extends BaseHandler
 *   CORS headers and OPTIONS preflight are handled by BaseHandler.handle().
 *   This class only contains Student Quiz submission-specific logic.
 */
public class StudentQuizHandler extends BaseHandler {

    private final StudentQuizDAO submissionDAO = new StudentQuizDAO();

    /**
     * Hook method from BaseHandler (Template Method pattern).
     * Handles GET (fetch submissions) and POST (save a graded quiz).
     */
    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {

        // GET: Route by query parameter
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("studentId=")) {
                // Fetch all past submissions for a student
                String studentId = query.split("=")[1];
                sendResponse(exchange, 200, submissionDAO.getSubmissionsByStudentJson(studentId));
            } else if (query != null && query.startsWith("quizId=")) {
                // Fetch the ranklist for a specific quiz
                int quizId = Integer.parseInt(query.split("=")[1]);
                sendResponse(exchange, 200, submissionDAO.getRanklistByQuizJson(quizId));
            } else {
                sendResponse(exchange, 400, "{}");
            }
            return;
        }


        // POST: Save a new graded quiz submission
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                String studentId   = extractJsonString(body, "studentId");
                int    quizId      = Integer.parseInt(extractJsonNumber(body, "quizId"));
                String answersJson = extractJsonString(body, "answersJson");
                int    score       = Integer.parseInt(extractJsonNumber(body, "score"));
                String attendTime  = extractJsonString(body, "attendTime");

                if (submissionDAO.saveSubmission(studentId, quizId, answersJson, score, attendTime)) {
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

    // --- Robust Helper to extract JSON Strings (handles nested escaped quotes) ---
    private String extractJsonString(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":\"";
            if (!json.contains(searchKey)) return "";
            int startIndex = json.indexOf(searchKey) + searchKey.length();
            int endIndex = startIndex;
            while (endIndex < json.length()) {
                if (json.charAt(endIndex) == '\"' && json.charAt(endIndex - 1) != '\\') break;
                endIndex++;
            }
            return json.substring(startIndex, endIndex).replace("\\\"", "\"").replace("\\\\", "\\");
        } catch (Exception e) { return ""; }
    }

    // --- Helper to extract Numbers ---
    private String extractJsonNumber(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":";
            if (json.contains(searchKey)) {
                return json.split(searchKey)[1].split("[,}]")[0].trim();
            }
            return "0";
        } catch (Exception e) { return "0"; }
    }
}