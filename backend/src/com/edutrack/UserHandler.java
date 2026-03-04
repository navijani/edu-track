package com.edutrack;

import com.edutrack.dao.UserDAO;
import com.edutrack.models.Teacher;
import com.edutrack.models.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
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

        // GET: Fetch all users
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String jsonResponse = userDAO.getAllUsersJson();
            sendResponse(exchange, 200, jsonResponse);
        }

        // DELETE: Remove a user
        if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("id=")) {
                String userId = query.split("=")[1];
                if (userDAO.deleteUser(userId)) {
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            }
        }

        // POST: Register a user 
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                // Print the incoming data to the terminal for debugging!
                System.out.println("--- NEW REGISTRATION ATTEMPT ---");
                System.out.println("Received Payload: " + body);

                // Use our new safe extraction method
                String id = extractValue(body, "id");
                String name = extractValue(body, "name");
                String email = extractValue(body, "email");
                String password = extractValue(body, "password");
                String role = extractValue(body, "role");
                String subject = extractValue(body, "subject");

                // Instantiating the correct Model based on the role
                User newUser;
                if (role.equalsIgnoreCase("TEACHER")) {
                    newUser = new Teacher(id, name, email, password, role, subject);
                } else {
                    newUser = new User(id, name, email, password, role);
                }

                // Saving via the DAO
                if (userDAO.saveUser(newUser)) {
                    System.out.println("SUCCESS: User " + name + " added to database.");
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    System.out.println("FAIL: userDAO.saveUser returned false. Check database constraints (e.g., duplicate ID).");
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            } catch (Exception e) {
                System.out.println("CRASH: Server threw an error during registration.");
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false}");
            }
        }
    }

    // --- NEW HELPER METHOD ---
    // This safely extracts values from JSON without crashing if formatting is slightly off
    private String extractValue(String json, String key) {
        try {
            // This safely splits the JSON regardless of spaces before or after the colon
            String[] parts = json.split("\"" + key + "\"\\s*:\\s*\"");
            if (parts.length > 1) {
                return parts[1].split("\"")[0];
            }
            return ""; // Return empty if the key isn't found
        } catch (Exception e) {
            return "";
        }
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