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

        // FIX: Added exchange.close() so the browser doesn't freeze and block React!
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close(); 
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String jsonResponse = userDAO.getAllUsersJson();
            sendResponse(exchange, 200, jsonResponse);
        }

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

        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                System.out.println("\n--- NEW REGISTRATION ATTEMPT ---");
                System.out.println("Received Payload: " + body);

                String id = extractValue(body, "id");
                String name = extractValue(body, "name");
                String email = extractValue(body, "email");
                String password = extractValue(body, "password");
                String role = extractValue(body, "role");
                String subject = extractValue(body, "subject");

                User newUser;
                if (role.equalsIgnoreCase("TEACHER")) {
                    newUser = new Teacher(id, name, email, password, role, subject);
                } else {
                    newUser = new User(id, name, email, password, role);
                }

                if (userDAO.saveUser(newUser)) {
                    System.out.println("SUCCESS: User " + name + " added to database.\n");
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    System.out.println("FAIL: Database rejected it. Check for duplicate ID!\n");
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            } catch (Exception e) {
                System.out.println("CRASH: Server threw an error during registration.\n");
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false}");
            }
        }
    }

    private String extractValue(String json, String key) {
        try {
            String[] parts = json.split("\"" + key + "\"\\s*:\\s*\"");
            if (parts.length > 1) {
                return parts[1].split("\"")[0];
            }
            return ""; 
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