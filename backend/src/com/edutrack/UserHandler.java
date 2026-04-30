package com.edutrack;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import com.edutrack.dao.UserDAO;
import com.edutrack.models.User;
import com.edutrack.models.UserFactory;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

/**
 * HTTP Handler for all User-related API endpoints.
 * This class uses the Strategy Design Pattern to handle different HTTP methods
 * (GET, POST, DELETE, OPTIONS) cleanly without long switch/if-else blocks.
 */
public class UserHandler implements HttpHandler {

    private final Map<String, HttpMethodStrategy> strategies;

    public UserHandler() {
        UserDAO userDAO = new UserDAO();
        strategies = new HashMap<>();
        strategies.put("GET", new UserGetStrategy(userDAO));
        strategies.put("POST", new UserPostStrategy(userDAO));
        strategies.put("DELETE", new UserDeleteStrategy(userDAO));
        strategies.put("OPTIONS", new OptionsStrategy());
    }

    /**
     * The main entry point for requests to the user endpoint.
     * Sets CORS headers and delegates execution to the appropriate Strategy
     * based on the HTTP method.
     */
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Set CORS headers to allow cross-origin requests from the React frontend
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        String method = exchange.getRequestMethod().toUpperCase();
        HttpMethodStrategy strategy = strategies.get(method);

        // Execute the strategy if found, otherwise return 405 Method Not Allowed
        if (strategy != null) {
            strategy.execute(exchange);
        } else {
            exchange.sendResponseHeaders(405, -1);
            exchange.close();
        }
    }

    // --- STRATEGY PATTERN INNER CLASSES ---

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
                if (keyIndex == -1)
                    return "";

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
                    if (end == -1)
                        end = afterColon.length();

                    String val = afterColon.substring(0, end).trim();
                    return val.equals("null") ? "" : val;
                }
            } catch (Exception e) {
                return "";
            }
        }
    }

    class UserGetStrategy extends BaseStrategy {
        private final UserDAO userDAO;

        public UserGetStrategy(UserDAO userDAO) {
            this.userDAO = userDAO;
        }

        @Override
        public void execute(HttpExchange exchange) throws IOException {
            String jsonResponse = userDAO.getAllUsersJson();
            sendResponse(exchange, 200, jsonResponse);
        }
    }

    /**
     * Strategy for handling POST requests (User Registration).
     */
    class UserPostStrategy extends BaseStrategy {
        private final UserDAO userDAO;

        public UserPostStrategy(UserDAO userDAO) {
            this.userDAO = userDAO;
        }

        @Override
        public void execute(HttpExchange exchange) throws IOException {
            try {
                // Read the incoming JSON payload from the request body
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                System.out.println("\n--- NEW REGISTRATION ATTEMPT ---");
                System.out.println("Received Payload: " + body);

                // Extract all fields from the JSON payload manually
                String id = extractValue(body, "id");
                String name = extractValue(body, "name");
                String email = extractValue(body, "email");
                String password = extractValue(body, "password");
                String role = extractValue(body, "role");
                String subject = extractValue(body, "subject");
                String childId = extractValue(body, "childId");
                String studentClass = extractValue(body, "studentClass");

                System.out.println("Extracted Role: " + role);
                System.out.println("Extracted Child ID: '" + childId + "'");
                System.out.println("Extracted Student Class: '" + studentClass + "'");

                // --- Default password rule ---
                // If the password field is empty (e.g. sent from the admin form which
                // auto-sets it, or a direct API call that omits it), fall back to
                // the user's own ID as their initial password.
                // BCrypt will hash this value before it is written to the database.
                if (password == null || password.isEmpty()) {
                    password = id;
                    System.out.println("INFO: No password provided – defaulting to User ID: " + id);
                }

                // Delegate object creation to the Factory
                User newUser = UserFactory.createUser(id, name, email, password, role, subject, studentClass);

                // Save the newly instantiated user object to the database
                if (userDAO.saveUser(newUser, childId)) {
                    System.out.println("SUCCESS: User " + name + " added to database.\n");
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    System.out.println("FAIL: Database rejected the insert.\n");
                    sendResponse(exchange, 500, "{\"success\":false,\"message\":\"Registration failed. Please try again.\"}");
                }

            } catch (RuntimeException e) {
                // UserDAO throws a RuntimeException with a DUPLICATE_* prefix
                // when the database rejects the INSERT due to a unique constraint violation.
                // Return 409 Conflict so the frontend knows it is a data problem, not a server crash.
                String userMessage = e.getMessage() != null
                    ? e.getMessage().replaceFirst("^DUPLICATE[^:]*: ", "") // strip internal prefix, keep readable part
                    : "A duplicate entry was detected.";
                System.out.println("DUPLICATE: " + e.getMessage() + "\n");
                sendResponse(exchange, 409, "{\"success\":false,\"message\":\"" + userMessage + "\"}");

            } catch (Exception e) {
                System.out.println("CRASH: Server threw an error during registration.\n");
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false,\"message\":\"Server error. Ensure the backend is running.\"}");
            }
        }
    }

    class UserDeleteStrategy extends BaseStrategy {
        private final UserDAO userDAO;

        public UserDeleteStrategy(UserDAO userDAO) {
            this.userDAO = userDAO;
        }

        @Override
        public void execute(HttpExchange exchange) throws IOException {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("id=")) {
                String userId = query.split("=")[1];
                if (userDAO.deleteUser(userId)) {
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            } else {
                sendResponse(exchange, 400, "{\"success\":false, \"error\":\"Missing or invalid id parameter\"}");
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