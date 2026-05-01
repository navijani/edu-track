package com.edutrack;

import com.edutrack.dao.DocumentAnswerDAO;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class DocumentAnswerHandler implements HttpHandler {
    private DocumentAnswerDAO answerDAO = new DocumentAnswerDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.contains("studentId=") && query.contains("documentId=")) {
                String studentId = extractQueryParam(query, "studentId");
                int docId = Integer.parseInt(extractQueryParam(query, "documentId"));
                sendResponse(exchange, 200, answerDAO.getDocumentAnswersJson(studentId, docId));
            } else {
                sendResponse(exchange, 400, "{}");
            }
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                System.out.println("\n--- [DEBUG] INCOMING DOCUMENT ANSWER ---");
                System.out.println("RAW JSON: " + body);

                // Safely extract values
                String studentId = extractJsonString(body, "studentId");
                if (studentId.isEmpty()) studentId = extractJsonNumber(body, "studentId");
                
                int docId = Integer.parseInt(extractJsonNumber(body, "documentId"));
                int qIndex = Integer.parseInt(extractJsonNumber(body, "questionIndex"));
                String answer = extractJsonString(body, "answer");

                System.out.println("Parsed Student ID: " + studentId);
                System.out.println("Parsed Document ID: " + docId);
                System.out.println("Parsed Q Index: " + qIndex);
                System.out.println("Parsed Answer: " + answer);

                if (answerDAO.saveDocumentAnswer(studentId, docId, qIndex, answer)) {
                    System.out.println("STATUS: Successfully saved to database!\n");
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    System.out.println("STATUS: Database rejected the save. Check your SQL tables!\n");
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            } catch (Exception e) { 
                System.out.println("STATUS: Server crashed while parsing JSON!");
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false}"); 
            }
        }
    }

    private String extractQueryParam(String query, String param) {
        for (String pair : query.split("&")) {
            if (pair.startsWith(param + "=")) return pair.split("=")[1];
        }
        return "";
    }

    private String extractJsonString(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":\"";
            if (!json.contains(searchKey)) return "";
            int start = json.indexOf(searchKey) + searchKey.length();
            int end = start;
            while (end < json.length()) {
                if (json.charAt(end) == '\"' && json.charAt(end - 1) != '\\') break;
                end++;
            }
            return json.substring(start, end).replace("\\\"", "\"").replace("\\\\", "\\");
        } catch (Exception e){
            return "";
        }
    }

    private String extractJsonNumber(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":";
            if (json.contains(searchKey)) return json.split(searchKey)[1].split("[,}]")[0].trim();
            return "0";
        } catch (Exception e) { return "0"; }
    }

    private void sendResponse(HttpExchange exchange, int code, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(code, bytes.length);
        try {
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}