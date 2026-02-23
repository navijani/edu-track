package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class UserHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Fixes CORS so your React App (Port 3000) can talk to Java (Port 8080)
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                // Manual JSON Parsing for: id, name, role, and subject
                String id = body.split("\"id\":\"")[1].split("\"")[0];
                String name = body.split("\"name\":\"")[1].split("\"")[0];
                String role = body.split("\"role\":\"")[1].split("\"")[0];
                String subject = body.contains("\"subject\":\"") ? body.split("\"subject\":\"")[1].split("\"")[0] : "";

                try (Connection conn = DBConnection.getConnection()) {
                    // SQL to save the user into your MySQL 'users' table
                    String sql = "INSERT INTO users (id, name, role, subject) VALUES (?, ?, ?, ?)";
                    PreparedStatement pstmt = conn.prepareStatement(sql);
                    pstmt.setString(1, id);
                    pstmt.setString(2, name);
                    pstmt.setString(3, role);
                    pstmt.setString(4, subject);
                    pstmt.executeUpdate();

                    String response = "User registered successfully!";
                    exchange.sendResponseHeaders(200, response.length());
                    OutputStream os = exchange.getResponseBody();
                    os.write(response.getBytes());
                    os.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
                exchange.sendResponseHeaders(500, -1);
            }
        }
    }
}