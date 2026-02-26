package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.edutrack.models.User;
import com.edutrack.models.Teacher;
import com.edutrack.dao.UserDAO;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class UserHandler implements HttpHandler {

    // Instantiate the DAO
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

        // --- GET: Fetch all users ---
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String jsonResponse = userDAO.getAllUsersJson();
            sendResponse(exchange, 200, jsonResponse);
        }

        // --- DELETE: Remove a user ---
        if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("id=")) {
                String userId = query.split("=")[1];
                if (userDAO.deleteUser(userId)) {
                    sendResponse(exchange, 200, "User deleted successfully.");
                } else {
                    sendResponse(exchange, 500, "Failed to delete user.");
                }
            }
        }

        // --- POST: Register a user ---
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                String id = body.split("\"id\":\"")[1].split("\"")[0];
                String name = body.split("\"name\":\"")[1].split("\"")[0];
                String email = body.split("\"email\":\"")[1].split("\"")[0];
                String password = body.split("\"password\":\"")[1].split("\"")[0];
                String role = body.split("\"role\":\"")[1].split("\"")[0];
                String subject = body.contains("\"subject\":\"") ? body.split("\"subject\":\"")[1].split("\"")[0] : "";

                // Instantiating the correct Model based on the role
                User newUser;
                if (role.equalsIgnoreCase("TEACHER")) {
                    newUser = new Teacher(id, name, email, password, role, subject);
                } else {
                    newUser = new User(id, name, email, password, role);
                }

                // Saving via the DAO
                if (userDAO.saveUser(newUser)) {
                    sendResponse(exchange, 200, "User registered successfully!");
                } else {
                    sendResponse(exchange, 500, "Database error.");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "Server error.");
            }
        }
    }

    // Helper method to keep code DRY (Don't Repeat Yourself)
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}