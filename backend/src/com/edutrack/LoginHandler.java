package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.edutrack.dao.UserDAO;
import com.edutrack.models.User;
import com.edutrack.models.Teacher;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class LoginHandler implements HttpHandler {

    // Instantiate the DAO
    private UserDAO userDAO = new UserDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Enable CORS
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

                // 1. Extract the exact fields sent by React
                String id = body.split("\"id\":\"")[1].split("\"")[0];
                String password = body.split("\"password\":\"")[1].split("\"")[0];
                String role = body.split("\"role\":\"")[1].split("\"")[0];

                // 2. Use the DAO to authenticate (Abstraction)
                User authenticatedUser = userDAO.authenticateUser(id, password, role);

                if (authenticatedUser != null) {
                    // User found! Build JSON using the Model's getters (Encapsulation)
                    String subject = "";
                    
                    // Added studentClass variable to fix the bug where student contents wouldn't load.
                    // This ensures the frontend receives the student's assigned class upon login.
                    String studentClass = "";

                    // Polymorphism: Check if the returned object is specifically a Teacher or Student
                    if (authenticatedUser instanceof Teacher) {
                        subject = ((Teacher) authenticatedUser).getSubject();
                    } else if (authenticatedUser instanceof com.edutrack.models.Student) {
                        // Extract the studentClass if the user is a Student
                        studentClass = ((com.edutrack.models.Student) authenticatedUser).getStudentClass();
                    }

                    // Added \"studentClass\":\"%s\" to the JSON string payload so the frontend React application
                    // can save it to its local user state and use it to fetch class-specific contents.
                    String jsonResponse = String.format(
                            "{\"success\":true, \"role\":\"%s\", \"name\":\"%s\", \"subject\":\"%s\", \"studentClass\":\"%s\", \"id\":\"%s\"}",
                            authenticatedUser.getRole(), authenticatedUser.getName(), subject, studentClass,
                            authenticatedUser.getId());

                    sendResponse(exchange, 200, jsonResponse);
                } else {
                    // Invalid login
                    String error = "{\"success\":false, \"message\":\"Invalid credentials\"}";
                    sendResponse(exchange, 401, error);
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false, \"message\":\"Server error\"}");
            }
        }
    }

    // Helper method to keep code DRY
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}