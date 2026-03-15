package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.edutrack.dao.StudentAnswerDAO;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class StudentAnswerHandler implements HttpHandler {

    private StudentAnswerDAO answerDAO = new StudentAnswerDAO();

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

        // GET: Fetch existing answers for a specific student and video
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.contains("studentId=") && query.contains("videoId=")) {
                
                String studentId = extractQueryParam(query, "studentId");
                int videoId = Integer.parseInt(extractQueryParam(query, "videoId"));
                
                String jsonResponse = answerDAO.getVideoAnswersJson(studentId, videoId);
                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 400, "{}");
            }
        }

        // POST: Save a new answer
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                String studentId = extractJsonString(body, "studentId");
                int videoId = Integer.parseInt(extractJsonNumber(body, "videoId"));
                int questionIndex = Integer.parseInt(extractJsonNumber(body, "questionIndex"));
                String answer = extractJsonString(body, "answer");

                if (answerDAO.saveVideoAnswer(studentId, videoId, questionIndex, answer)) {
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

    // --- Helpers to extract URL Queries ---
    private String extractQueryParam(String query, String param) {
        for (String pair : query.split("&")) {
            if (pair.startsWith(param + "=")) {
                return pair.split("=")[1];
            }
        }
        return "";
    }

    // --- Helpers to extract JSON safely without a library ---
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
                // Splits at the comma or closing bracket to isolate the number
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