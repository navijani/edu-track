package com.edutrack;

import com.edutrack.dao.StudentDashboardDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class StudentDashboardHandler implements HttpHandler {
    private StudentDashboardDAO dao = new StudentDashboardDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String studentId = exchange.getRequestURI().getQuery().split("=")[1];
            String response = dao.getDashboardDataJson(studentId);
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }
}