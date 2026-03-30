package com.edutrack;

import com.edutrack.dao.SubjectDAO;
import com.edutrack.models.Subject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class SubjectHandler implements HttpHandler {
    
    // Instantiate the DAO
    private SubjectDAO subjectDAO = new SubjectDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        //  GET: Fetch all subjects 
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String jsonResponse = subjectDAO.getAllSubjectsJson();
            sendResponse(exchange, 200, jsonResponse, "application/json");
        }

        //  POST: Save a new subject 
        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream i = exchange.getRequestBody();
                String body = new String(i.readAllBytes(), StandardCharsets.UTF_8);
                
                // Extract strings
                String code = body.split("\"code\":\"")[1].split("\"")[0];
                String title = body.split("\"title\":\"")[1].split("\"")[0];

                // Create Model Object
                Subject newSubject = new Subject(code, title);

                // Save using DAO
                if (subjectDAO.saveSubject(newSubject)) {
                    sendResponse(exchange, 200, "Subject saved successfully!", "text/plain");
                } else {
                    sendResponse(exchange, 500, "Database error.", "text/plain");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "Server error.", "text/plain");
            }
        }
    }

    // Helper method for clean HTTP responses
    private void sendResponse(HttpExchange exchange, int statusCode, String response, String contentType) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", contentType);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try {
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}