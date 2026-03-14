package com.edutrack;

import com.sun.net.httpserver.*;
import java.io.*;
import java.sql.*;
import java.nio.charset.StandardCharsets;

public class ParentTeachersHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Headers for React
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        StringBuilder json = new StringBuilder("[");
        // FETCH USERS WHERE ROLE IS TEACHER
        String sql = "SELECT id, name, email, subject FROM users WHERE UPPER(role) = 'TEACHER' ORDER BY name ASC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":\"").append(rs.getString("id")).append("\",")
                    .append("\"name\":\"").append(rs.getString("name")).append("\",")
                    .append("\"email\":\"").append(rs.getString("email")).append("\",")
                    .append("\"subject\":\"").append(rs.getString("subject")).append("\"")
                    .append("}");
                first = false;
            }
        } catch (Exception e) { e.printStackTrace(); }
        
        String response = json.append("]").toString();
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}