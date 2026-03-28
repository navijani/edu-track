package com.edutrack;


import com.edutrack.dao.ZoomDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class ZoomHandler implements HttpHandler {
    private ZoomDAO dao = new ZoomDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // CORS Headers - Added DELETE to allowed methods
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        String response = "";
        try {
            String method = exchange.getRequestMethod();

            if (method.equalsIgnoreCase("POST")) {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                String topic = getValue(body, "topic");
                String link = getValue(body, "meetingLink");
                String date = getValue(body, "meetingDate");
                String time = getValue(body, "meetingTime");
                String subject = getValue(body, "subject");
                String teacher = getValue(body, "teacher");

                boolean success = dao.scheduleMeeting(topic, link, date, time, subject, teacher);
                response = "{\"success\":" + success + "}";
            } 
            else if (method.equalsIgnoreCase("GET")) {
                Map<String, String> params = getQueryParams(exchange.getRequestURI().getQuery());
                String subject = params.getOrDefault("subject", "");
                if (!subject.isEmpty()) {
                    response = dao.getMeetingsJson(URLDecoder.decode(subject, StandardCharsets.UTF_8));
                } else {
                    response = "[]";
                }
            }
            else if (method.equalsIgnoreCase("DELETE")) {
                Map<String, String> params = getQueryParams(exchange.getRequestURI().getQuery());
                String idStr = params.get("id");
                if (idStr != null) {
                    int id = Integer.parseInt(idStr);
                    boolean success = dao.deleteMeeting(id);
                    response = "{\"success\":" + success + "}";
                } else {
                    response = "{\"success\":false, \"message\":\"Missing ID\"}";
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response = "{\"error\":\"Internal Server Error\"}";
        }

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Helper to parse query parameters safely (?id=1&subject=Math)
    private Map<String, String> getQueryParams(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null) return result;
        for (String param : query.split("&")) {
            String[] entry = param.split("=");
            if (entry.length > 1) {
                result.put(entry[0], entry[1]);
            }
        }
        return result;
    }

    private String getValue(String json, String key) {
        try {
            String pattern = "\"" + key + "\":\"";
            int start = json.indexOf(pattern) + pattern.length();
            int end = json.indexOf("\"", start);
            return json.substring(start, end);
        } catch (Exception e) {
            return "";
        }
    }
}