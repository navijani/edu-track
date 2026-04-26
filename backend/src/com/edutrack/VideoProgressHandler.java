package com.edutrack;

import com.edutrack.dao.VideoProgressDAO;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class VideoProgressHandler implements HttpHandler {

    private VideoProgressDAO progressDAO = new VideoProgressDAO();

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

        // GET: Fetch progress for a student
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.contains("studentId=")) {
                // Better extraction of studentId from query string
                String studentId = query.split("studentId=")[1].split("&")[0];
                String jsonResponse = progressDAO.getProgressByStudentJson(studentId);
                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 400, "{}");
            }
            return;
        }

        // POST: Save progress
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                // --- DATA EXTRACTION ---
                // We use String for videoId to match your DB IDs like "v01"
                String studentId = extractJsonValue(body, "studentId");
                String videoId = extractJsonValue(body, "videoId");
                
                int watchedPercentage = Integer.parseInt(extractJsonValue(body, "watchedPercentage"));
                int watchedSeconds = Integer.parseInt(extractJsonValue(body, "watchedSeconds"));
                int answeredCount = Integer.parseInt(extractJsonValue(body, "answeredCount"));
                String lastAccessed = extractJsonValue(body, "lastAccessed");

                if (progressDAO.saveProgress(studentId, videoId, watchedPercentage, watchedSeconds, answeredCount, lastAccessed)) {
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            } catch (Exception e) {
                System.err.println("Error processing video progress: " + e.getMessage());
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false, \"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    // Unified helper to extract JSON values regardless of quotes
    private String extractJsonValue(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":";
            int start = json.indexOf(searchKey) + searchKey.length();
            String sub = json.substring(start).trim();
            
            if (sub.startsWith("\"")) {
                return sub.split("\"")[1]; // It's a string
            } else {
                return sub.split("[,}]")[0].trim(); // It's a number
            }
        } catch (Exception e) { return ""; }
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