package com.edutrack;

import com.edutrack.dao.UserDAO;
import com.edutrack.models.Teacher;
import com.edutrack.models.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class UserHandler implements HttpHandler {
    private UserDAO userDAO = new UserDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // Fetch all users for Admin Dashboard
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            sendResponse(exchange, 200, userDAO.getAllUsersJson());
        }

        // Handle Registration
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                String id = extractValue(body, "id");
                String name = extractValue(body, "name");
                String email = extractValue(body, "email");
                String password = extractValue(body, "password");
                String role = extractValue(body, "role");
                String subject = extractValue(body, "subject");
                String childId = extractValue(body, "childId");

                User newUser = role.equalsIgnoreCase("TEACHER") ? 
                    new Teacher(id, name, email, password, role, subject) : 
                    new User(id, name, email, password, role);

                if (userDAO.saveUser(newUser, childId)) {
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"success\":false}");
            }
        }
    }

    private String extractValue(String json, String key) {
        try {
            int keyIndex = json.indexOf("\"" + key + "\"");
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