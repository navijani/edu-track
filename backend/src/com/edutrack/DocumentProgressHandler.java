package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.edutrack.dao.DocumentProgressDAO;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class DocumentProgressHandler implements HttpHandler {
    private DocumentProgressDAO progressDAO = new DocumentProgressDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("studentId=")) {
                sendResponse(exchange, 200, progressDAO.getProgressByStudentJson(query.split("=")[1]));
            } else sendResponse(exchange, 400, "{}");
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                // FIX: Added the fallback parser for studentId!
                String studentId = extractJsonString(body, "studentId");
                if (studentId.isEmpty()) {
                    studentId = extractJsonNumber(body, "studentId");
                }
                
                int docId = Integer.parseInt(extractJsonNumber(body, "documentId"));
                int pct = Integer.parseInt(extractJsonNumber(body, "watchedPercentage"));
                int ans = Integer.parseInt(extractJsonNumber(body, "answeredCount"));
                String lastAcc = extractJsonString(body, "lastAccessed");

                if (progressDAO.saveProgress(studentId, docId, pct, ans, lastAcc)) {
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else sendResponse(exchange, 500, "{\"success\":false}");
            } catch (Exception e) { 
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false}"); 
            }
        }
    }

    private String extractJsonString(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":\"";
            if (json.contains(searchKey)) return json.split(searchKey)[1].split("\"")[0];
            return "";
        } catch (Exception e) { return ""; }
    }

    private String extractJsonNumber(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":";
            if (json.contains(searchKey)) return json.split(searchKey)[1].split("[,}]")[0].trim();
            return "0";
        } catch (Exception e) { return "0"; }
    }

    private void sendResponse(HttpExchange exchange, int code, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(code, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}