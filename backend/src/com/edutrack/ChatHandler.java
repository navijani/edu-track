package com.edutrack;

import com.edutrack.dao.ChatDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class ChatHandler implements HttpHandler {
    private ChatDAO dao = new ChatDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close(); 
            return;
        }

        String response = "[]";
        try {
            if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                // Save a new message
                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                String parentId = extractValue(body, "parentId");
                String teacherId = extractValue(body, "teacherId");
                String senderId = extractValue(body, "senderId");
                String senderName = extractValue(body, "senderName");
                String message = extractValue(body, "message");

                boolean success = dao.sendMessage(parentId, teacherId, senderId, senderName, message);
                response = "{\"success\":" + success + "}";
                
            } else if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                // Fetch chat history
                String query = exchange.getRequestURI().getQuery();
                if (query != null && query.contains("parentId=") && query.contains("teacherId=")) {
                    String parentId = query.split("parentId=")[1].split("&")[0];
                    String teacherId = query.split("teacherId=")[1].split("&")[0];
                    response = dao.getMessagesJson(parentId, teacherId);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private String extractValue(String json, String key) {
        try {
            int keyIndex = json.indexOf("\"" + key + "\"");
            if (keyIndex == -1) return "";
            int colonIndex = json.indexOf(":", keyIndex);
            int valueStart = json.indexOf("\"", colonIndex) + 1;
            int valueEnd = json.indexOf("\"", valueStart);
            return json.substring(valueStart, valueEnd);
        } catch (Exception e) { return ""; }
    }
}