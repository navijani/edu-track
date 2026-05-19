package com.edutrack;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import com.edutrack.dao.AdminDAO;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class AdminHandler implements HttpHandler {

    private final Map<String, HttpMethodStrategy> strategies;

    public AdminHandler() {
        AdminDAO adminDAO = new AdminDAO();
        strategies = new HashMap<>();
        strategies.put("GET", new AdminGetStrategy(adminDAO));
        strategies.put("POST", new AdminPostStrategy(adminDAO));
        strategies.put("DELETE", new AdminDeleteStrategy(adminDAO));
        strategies.put("OPTIONS", new OptionsStrategy());
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        String method = exchange.getRequestMethod().toUpperCase();
        HttpMethodStrategy strategy = strategies.get(method);

        if (strategy != null) {
            strategy.execute(exchange);
        } else {
            exchange.sendResponseHeaders(405, -1);
            exchange.close();
        }
    }

    interface HttpMethodStrategy {
        void execute(HttpExchange exchange) throws IOException;
    }

    abstract class BaseStrategy implements HttpMethodStrategy {
        protected void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(statusCode, bytes.length);
            try {
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        protected String extractValue(String json, String key) {
            try {
                int keyIndex = json.indexOf("\"" + key + "\"");
                if (keyIndex == -1) return "";

                int colonIndex = json.indexOf(":", keyIndex);
                String afterColon = json.substring(colonIndex + 1).trim();

                if (afterColon.startsWith("\"")) {
                    int valueStart = json.indexOf("\"", colonIndex) + 1;
                    int valueEnd = json.indexOf("\"", valueStart);
                    return json.substring(valueStart, valueEnd);
                } else {
                    int commaIndex = afterColon.indexOf(",");
                    int braceIndex = afterColon.indexOf("}");
                    int end = (commaIndex != -1 && commaIndex < braceIndex) ? commaIndex : braceIndex;
                    if (end == -1) end = afterColon.length();

                    String val = afterColon.substring(0, end).trim();
                    return val.equals("null") ? "" : val;
                }
            } catch (Exception e) {
                return "";
            }
        }
    }

    class AdminGetStrategy extends BaseStrategy {
        private final AdminDAO adminDAO;

        public AdminGetStrategy(AdminDAO adminDAO) {
            this.adminDAO = adminDAO;
        }

        @Override
        public void execute(HttpExchange exchange) throws IOException {
            String adminsData = adminDAO.getAllAdminsJson();
            String jsonResponse = String.format("{\"success\":true, \"message\":\"Admins fetched successfully\", \"data\":%s}", adminsData);
            sendResponse(exchange, 200, jsonResponse);
        }
    }

    class AdminPostStrategy extends BaseStrategy {
        private final AdminDAO adminDAO;

        public AdminPostStrategy(AdminDAO adminDAO) {
            this.adminDAO = adminDAO;
        }

        @Override
        public void execute(HttpExchange exchange) throws IOException {
            // Note: In a production system, we must verify the Authorization token here
            // to ensure the caller is allowed to create admins.
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                String email = extractValue(body, "email");
                String password = extractValue(body, "password");
                String createdBy = extractValue(body, "createdBy");
                
                // Enforce ADMIN role to prevent privilege escalation via API
                String role = "ADMIN";

                if (adminDAO.addAdmin(email, password, role, createdBy)) {
                    sendResponse(exchange, 200, "{\"success\":true, \"message\":\"Admin created successfully\"}");
                } else {
                    sendResponse(exchange, 400, "{\"success\":false, \"message\":\"Failed to create admin. Email might already exist.\"}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false, \"message\":\"Server error\"}");
            }
        }
    }

    class AdminDeleteStrategy extends BaseStrategy {
        private final AdminDAO adminDAO;

        public AdminDeleteStrategy(AdminDAO adminDAO) {
            this.adminDAO = adminDAO;
        }

        @Override
        public void execute(HttpExchange exchange) throws IOException {
            // Note: In a production system, we must verify the Authorization token here
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.contains("email=")) {
                String[] params = query.split("&");
                String targetEmail = "";
                String currentUserEmail = "";
                
                for (String param : params) {
                    String[] pair = param.split("=");
                    if (pair.length == 2) {
                        try {
                            String decodedValue = java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8.name());
                            if (pair[0].equals("email")) targetEmail = decodedValue;
                            if (pair[0].equals("currentUser")) currentUserEmail = decodedValue;
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
                
                if (targetEmail.equals(currentUserEmail)) {
                    sendResponse(exchange, 400, "{\"success\":false, \"message\":\"Prevented self-deletion. Admins cannot delete their own currently logged-in account.\"}");
                    return;
                }

                if (adminDAO.deleteAdmin(targetEmail)) {
                    sendResponse(exchange, 200, "{\"success\":true, \"message\":\"Admin deactivated successfully\"}");
                } else {
                    sendResponse(exchange, 400, "{\"success\":false, \"message\":\"Cannot delete MAIN_ADMIN or Admin not found\"}");
                }
            } else {
                sendResponse(exchange, 400, "{\"success\":false, \"message\":\"Missing email parameter\"}");
            }
        }
    }

    class OptionsStrategy extends BaseStrategy {
        @Override
        public void execute(HttpExchange exchange) throws IOException {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
        }
    }
}
