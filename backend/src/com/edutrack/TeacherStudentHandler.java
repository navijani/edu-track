package com.edutrack;

import com.edutrack.dao.TeacherStudentDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class TeacherStudentHandler implements HttpHandler {
    private TeacherStudentDAO dao = new TeacherStudentDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        String response = "[]";
        try {
            if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                String query = exchange.getRequestURI().getQuery();
                Map<String, String> params = getQueryParams(query);
                
                // If a specific student ID is requested, return their progress
                if (params.containsKey("studentId") && params.containsKey("subject")) {
                    String studentId = params.get("studentId");
                    String subject = URLDecoder.decode(params.get("subject"), StandardCharsets.UTF_8);
                    response = dao.getStudentProgressJson(studentId, subject);
                } else {
                    // Otherwise, return the whole list
                    response = dao.getStudentsJson();
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

    private Map<String, String> getQueryParams(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null) return result;
        for (String param : query.split("&")) {
            String[] entry = param.split("=");
            if (entry.length > 1) result.put(entry[0], entry[1]);
        }
        return result;
    }
}