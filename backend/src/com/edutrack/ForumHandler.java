package com.edutrack;

import com.edutrack.dao.ForumDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class ForumHandler implements HttpHandler {
    private ForumDAO dao = new ForumDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        String response = "";
        try {
            if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                
                String name = getValue(body, "name");
                String role = getValue(body, "role");
                String subject = getValue(body, "subject");
                String msg = getValue(body, "message");

                // --- NEW REPLY LOGIC START ---
                String parentIdStr = getValue(body, "parentId");
                Integer parentId = null;
                // Check if a parent ID was actually sent and is not the word "null"
                if (!parentIdStr.isEmpty() && !parentIdStr.equals("null")) {
                    try {
                        parentId = Integer.parseInt(parentIdStr);
                    } catch (NumberFormatException e) {
                        // Ignore and leave as null if it fails to parse
                    }
                }

                // Pass the parentId variable here instead of the hardcoded 'null'
                boolean success = dao.savePost(name, role, subject, msg, parentId);
                // --- NEW REPLY LOGIC END ---

                response = "{\"success\":" + success + "}";
                
            } else if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                String query = exchange.getRequestURI().getQuery();
                String subject = "";
                // Safe extraction of the subject from the URL
                if (query != null && query.contains("subject=")) {
                    subject = URLDecoder.decode(query.split("subject=")[1].split("&")[0], StandardCharsets.UTF_8.toString());
                }
                response = dao.getPostsJson(subject);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response = "{\"success\":false, \"error\":\"Server crashed but connection saved!\"}";
        }

        // Bulletproof writing using strict UTF-8 bytes
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private String getValue(String json, String key) {
        try {
            int keyIndex = json.indexOf("\"" + key + "\"");
            if (keyIndex == -1) return "";
            
            // Handle cases where the value might not have quotes (like parentId: null)
            int colonIndex = json.indexOf(":", keyIndex);
            
            // If the next non-space character is a quote, it's a string
            String afterColon = json.substring(colonIndex + 1).trim();
            if (afterColon.startsWith("\"")) {
                int valueStart = json.indexOf("\"", colonIndex) + 1;
                int valueEnd = json.indexOf("\"", valueStart);
                return json.substring(valueStart, valueEnd);
            } else {
                // It's a number or unquoted null
                int commaIndex = afterColon.indexOf(",");
                int braceIndex = afterColon.indexOf("}");
                int end = (commaIndex != -1 && commaIndex < braceIndex) ? commaIndex : braceIndex;
                if (end == -1) end = afterColon.length();
                return afterColon.substring(0, end).trim();
            }
        } catch (Exception e) {
            return "";
        }
    }
}