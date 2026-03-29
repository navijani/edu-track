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

        // GET: Fetch all progress for the student to build the UI Grid
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("studentId=")) {
                String studentId = query.split("=")[1];
                
                String jsonResponse = progressDAO.getProgressByStudentJson(studentId);
                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 400, "{}");
            }
            return;
        }
        // POST: Save new progress when they close the video
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                // Extract fields manually
                String studentId = extractJsonString(body, "studentId");
                int videoId = Integer.parseInt(extractJsonNumber(body, "videoId"));
                int watchedPercentage = Integer.parseInt(extractJsonNumber(body, "watchedPercentage"));
                int watchedSeconds = Integer.parseInt(extractJsonNumber(body, "watchedSeconds"));
                int answeredCount = Integer.parseInt(extractJsonNumber(body, "answeredCount"));
                String lastAccessed = extractJsonString(body, "lastAccessed");

                if (progressDAO.saveProgress(studentId, videoId, watchedPercentage, watchedSeconds, answeredCount, lastAccessed)) {
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

    // --- Helpers to safely extract JSON without a library ---
    private String extractJsonString(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":\"";
            if (json.contains(searchKey)) {
                return json.split(searchKey)[1].split("\"")[0];
            }
            return "";
        } catch (Exception e) { return ""; }
    }

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
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}