package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.edutrack.dao.StudentQuizDAO;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class StudentQuizHandler implements HttpHandler {

    private StudentQuizDAO submissionDAO = new StudentQuizDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Standard CORS Headers
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // GET: Fetch all past submissions for the student to lock the UI
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("studentId=")) {
                String studentId = query.split("=")[1];
                
                String jsonResponse = submissionDAO.getSubmissionsByStudentJson(studentId);
                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 400, "{}");
            }
            return;
        }

        // POST: Save a new graded quiz
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                // Extract fields manually
                String studentId = extractJsonString(body, "studentId");
                int quizId = Integer.parseInt(extractJsonNumber(body, "quizId"));
                String answersJson = extractJsonString(body, "answersJson"); // Robust extraction handles internal quotes
                int score = Integer.parseInt(extractJsonNumber(body, "score"));
                String attendTime = extractJsonString(body, "attendTime");

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
            
            // Scan forward until we hit an unescaped quote
            while (endIndex < json.length()) {
                if (json.charAt(endIndex) == '\"' && json.charAt(endIndex - 1) != '\\') {
                    break;
                }
                endIndex++;
            }
            // Un-escape the string before saving to database
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

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}