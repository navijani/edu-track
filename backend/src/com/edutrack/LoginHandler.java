package com.edutrack;

import com.edutrack.dao.UserDAO;
import com.edutrack.models.Teacher;
import com.edutrack.models.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class LoginHandler implements HttpHandler {
    private UserDAO userDAO = new UserDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                // --- 1. CLEAN EXTRACTION ---
                String id = extractValue(body, "id");
                String password = extractValue(body, "password");
                String role = extractValue(body, "role");

                // --- 2. THE ADMIN CHECK (Must be first) ---
                if ("ADMIN".equalsIgnoreCase(role)) {
                    if ("2004@gmail.com".equals(id) && "123".equals(password)) {
                        String adminJson = "{\"success\":true, \"role\":\"ADMIN\", \"name\":\"System Admin\", \"id\":\"admin-01\"}";
                        sendResponse(exchange, 200, adminJson);
                        return; // Stop here!
                    } else {
                        sendResponse(exchange, 401, "{\"success\":false, \"message\":\"Invalid Admin Credentials\"}");
                        return;
                    }
                }

                // --- 3. DATABASE CHECK (For everyone else) ---
                User authUser = userDAO.authenticateUser(id, password, role);

                if (authUser != null) {
                    String subject = (authUser instanceof Teacher) ? ((Teacher) authUser).getSubject() : "";
                    String jsonResponse = String.format(
                        "{\"success\":true, \"role\":\"%s\", \"name\":\"%s\", \"subject\":\"%s\", \"id\":\"%s\"}",
                        authUser.getRole(), authUser.getName(), subject, authUser.getId());
                    sendResponse(exchange, 200, jsonResponse);
                } else {
                    sendResponse(exchange, 401, "{\"success\":false, \"message\":\"Invalid Credentials\"}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false, \"message\":\"Server Error\"}");
            }
        }
    }

    private String extractValue(String json, String key) {
        try {
            String searchKey = "\"" + key + "\"";
            int keyIndex = json.indexOf(searchKey);
            if (keyIndex == -1) return "";
            int colonIndex = json.indexOf(":", keyIndex);
            int valueStart = json.indexOf("\"", colonIndex) + 1;
            int valueEnd = json.indexOf("\"", valueStart);
            return json.substring(valueStart, valueEnd).trim();
        } catch (Exception e) { return ""; }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.getResponseBody().close();
    }
}