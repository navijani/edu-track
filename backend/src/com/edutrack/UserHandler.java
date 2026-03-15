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
                String childId = extractValue(body, "childId");

                // DEBUG LOG: This will prove if Java is successfully reading the childId
                System.out.println("Extracted Role: " + role);
                System.out.println("Extracted Child ID: '" + childId + "'");

                User newUser;
                if (role.equalsIgnoreCase("TEACHER")) {
                    newUser = new Teacher(id, name, email, password, role, subject);
                } else {
                    newUser = new User(id, name, email, password, role);
                }

                if (userDAO.saveUser(newUser, childId)) {
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

    // UPDATED: Bulletproof JSON Extractor
    private String extractValue(String json, String key) {
        try {
            int keyIndex = json.indexOf("\"" + key + "\"");
            if (keyIndex == -1) return "";
            
            int colonIndex = json.indexOf(":", keyIndex);
            String afterColon = json.substring(colonIndex + 1).trim();
            
            // Check if the value is wrapped in quotes
            if (afterColon.startsWith("\"")) {
                int valueStart = json.indexOf("\"", colonIndex) + 1;
                int valueEnd = json.indexOf("\"", valueStart);
                return json.substring(valueStart, valueEnd);
            } else {
                // If it's a number, null, or unquoted value at the end of the JSON
                int commaIndex = afterColon.indexOf(",");
                int braceIndex = afterColon.indexOf("}");
                int end = (commaIndex != -1 && commaIndex < braceIndex) ? commaIndex : braceIndex;
                if (end == -1) end = afterColon.length();
                
                String val = afterColon.substring(0, end).trim();
                return val.equals("null") ? "" : val;
            }
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