package com.edutrack;

import com.edutrack.dao.DocumentDAO;
import com.edutrack.models.DocumentContent;
import com.edutrack.models.DocumentQuestion;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class DocumentHandler implements HttpHandler {

    private DocumentDAO documentDAO = new DocumentDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // Handle GET request to fetch documents 
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            
            // 1. Teacher Dashboard Request
            if (query != null && query.startsWith("teacherId=")) {
                String teacherId = query.split("=")[1];
                String jsonResponse = documentDAO.getDocumentsByTeacherJson(teacherId);
                sendResponse(exchange, 200, jsonResponse);
            } 
            // 2. Student Dashboard Request
            else if (query != null && query.startsWith("subject=")) {
                String subject = query.split("=")[1];
                
                // Safely decode the URL (so "Computer%20Science" becomes "Computer Science")
                try {
                    subject = URLDecoder.decode(subject, StandardCharsets.UTF_8.name());
                } catch (Exception e) {
                    System.out.println("Warning: Could not decode URL.");
                }
                
                String jsonResponse = documentDAO.getDocumentsBySubjectJson(subject);
                sendResponse(exchange, 200, jsonResponse);
            } 
            else {
                sendResponse(exchange, 400, "[]");
            }
            return;
        }

        // Handle DELETE request 
        if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
            String query = exchange.getRequestURI().getQuery(); // looks like "id=5"
            if (query != null && query.startsWith("id=")) {
                String id = query.split("=")[1];
                
                if (documentDAO.deleteDocument(id)) { // Change this line in Quiz/Doc handlers!
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            }
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                // Extract basic details
                String teacherId = body.split("\"teacherId\":\"")[1].split("\"")[0];
                String subject = body.split("\"subject\":\"")[1].split("\"")[0];
                String title = body.split("\"title\":\"")[1].split("\"")[0];
                String documentUrl = body.split("\"documentUrl\":\"")[1].split("\"")[0];

                // Parse the array of questions
                List<DocumentQuestion> questionList = new ArrayList<>();
                if (body.contains("\"questions\":[{")) {
                    String questionsPart = body.substring(body.indexOf("\"questions\":[{") + 13);
                    questionsPart = questionsPart.substring(0, questionsPart.lastIndexOf("]"));
                    
                    String[] qBlocks = questionsPart.split("},\\{");
                    for (String block : qBlocks) {
                        String q = block.split("\"question\":\"")[1].split("\"")[0];
                        String a = block.split("\"answer\":\"")[1].split("\"")[0];
                        questionList.add(new DocumentQuestion(q, a));
                    }
                }

                DocumentContent newDoc = new DocumentContent(teacherId, subject, title, documentUrl, questionList);
                
                if (documentDAO.saveDocumentAndQuestions(newDoc)) {
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

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}