package com.edutrack;

import com.edutrack.dao.TeacherDashboardDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class TeacherDashboardHandler implements HttpHandler {
    private TeacherDashboardDAO dao = new TeacherDashboardDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        String response = "{}";
        try {
            if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                String query = exchange.getRequestURI().getQuery();
                if (query != null && query.contains("subject=")) {
                    String subject = URLDecoder.decode(query.split("subject=")[1].split("&")[0], StandardCharsets.UTF_8);
                    response = dao.getDashboardStats(subject);
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
}