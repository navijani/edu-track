package com.edutrack;

import com.edutrack.dao.TeacherStudentDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class TeacherStudentHandler implements HttpHandler {
    private final TeacherStudentDAO dao = new TeacherStudentDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);

        // 1. Handle Preflight
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // 2. Only Allow GET
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            return;
        }

        String response;
        int statusCode = 200;

        try {
            Map<String, String> params = getQueryParams(exchange.getRequestURI().getQuery());

            String studentId = params.get("studentId");
            String rawSubject = params.get("subject");

            if (studentId != null && rawSubject != null) {
                String subject = URLDecoder.decode(rawSubject, StandardCharsets.UTF_8);
                response = dao.getStudentProgressJson(studentId, subject);
            } else {
                response = dao.getStudentsJson();
            }
        } catch (Exception e) {
            e.printStackTrace();
            response = "{\"error\": \"Internal Server Error\"}";
            statusCode = 500;
        }

        sendJsonResponse(exchange, response, statusCode);
    }

    private void setCorsHeaders(HttpExchange exchange) {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.set("Content-Type", "application/json; charset=UTF-8");
    }

    private void sendJsonResponse(HttpExchange exchange, String response, int code) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private Map<String, String> getQueryParams(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null || query.isBlank())
            return result;

        for (String param : query.split("&")) {
            String[] entry = param.split("=", 2); // Split into max 2 parts
            if (entry.length == 2) {
                result.put(entry[0], entry[1]);
            }
        }
        return result;
    }
}