package com.edutrack;

import com.edutrack.dao.UserDAO;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * ChangePasswordHandler – HTTP Handler for the Change Password feature.
 *
 * Endpoint : PUT /api/users/change-password
 * Request  : { "userId": "...", "currentPassword": "...", "newPassword": "..." }
 * Response : { "success": true/false, "message": "..." }
 *
 * Security notes:
 *  - The current password is verified against the stored BCrypt hash BEFORE
 *    any update is made. An incorrect current password returns HTTP 401.
 *  - The new password is validated server-side (min. 8 characters).
 *  - Password hashing is delegated to UserDAO, which uses BCrypt.
 */
public class ChangePasswordHandler implements HttpHandler {

    // DAO handles all database interaction for user records
    private final UserDAO userDAO = new UserDAO();

    /**
     * Main entry point called by the HTTP server for every request to this route.
     * Sets CORS headers, enforces the PUT method, then delegates to business logic.
     */
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // --- CORS headers: allow React frontend on any origin ---
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "PUT, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");

        String method = exchange.getRequestMethod().toUpperCase();

        // Handle browser pre-flight OPTIONS request (required for CORS)
        if (method.equals("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // Only PUT is supported; reject everything else with 405 Method Not Allowed
        if (!method.equals("PUT")) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        // --- Step 0.5: JWT Authorization Check (Secure Session) ---
        // This ensures the user is actually logged in before they can change 
        // a password. We extract the "Passport" from the Authorization header.
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        String tokenUserId = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer "
            
            // Verify token signature and expiration
            tokenUserId = JwtUtil.validateTokenAndGetUserId(token);
        }

        // Rejection if the token is invalid or missing
        if (tokenUserId == null) {
            System.out.println("SECURITY ALERT: Someone tried to change a password without a valid session.");
            sendResponse(exchange, 401, "{\"success\":false,\"message\":\"Unauthorized: Please login first.\"}");
            return;
        }

        try {
            // --- 1. Read and log the incoming JSON request body ---
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            System.out.println("\n--- CHANGE PASSWORD ATTEMPT ---");
            System.out.println("Payload: " + body);

            // --- 2. Extract the three required fields from the JSON payload ---
            String userId          = extractValue(body, "userId");
            String currentPassword = extractValue(body, "currentPassword");
            String newPassword     = extractValue(body, "newPassword");

            // --- 3. Server-side validation: reject if any field is missing ---
            if (userId.isEmpty() || currentPassword.isEmpty() || newPassword.isEmpty()) {
                sendResponse(exchange, 400, "{\"success\":false,\"message\":\"Missing required fields\"}");
                return;
            }

            // --- 4. Server-side validation: enforce minimum password length ---
            if (newPassword.length() < 8) {
                sendResponse(exchange, 400, "{\"success\":false,\"message\":\"New password must be at least 8 characters\"}");
                return;
            }

            // --- 5. Delegate to UserDAO: verify current password + update hash ---
            boolean ok = userDAO.changePassword(userId, currentPassword, newPassword);

            if (ok) {
                System.out.println("SUCCESS: Password changed for user " + userId);
                sendResponse(exchange, 200, "{\"success\":true,\"message\":\"Password changed successfully\"}");
            } else {
                // DAO returns false if userId not found OR current password is wrong
                System.out.println("FAIL: Wrong current password or user not found for " + userId);
                sendResponse(exchange, 401, "{\"success\":false,\"message\":\"Current password is incorrect\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"success\":false,\"message\":\"Server error\"}");
        }
    }

    /**
     * Extracts a string value from a raw JSON string by key name.
     * Uses the same manual parsing approach used throughout this project
     * (no external JSON library dependency required).
     *
     * @param json The raw JSON string
     * @param key  The key whose string value to extract
     * @return The value, or an empty string if not found
     */
    private String extractValue(String json, String key) {
        try {
            int keyIndex = json.indexOf("\"" + key + "\"");
            if (keyIndex == -1) return "";
            int colonIndex = json.indexOf(":", keyIndex);
            String afterColon = json.substring(colonIndex + 1).trim();
            if (afterColon.startsWith("\"")) {
                int valueStart = json.indexOf("\"", colonIndex) + 1;
                int valueEnd   = json.indexOf("\"", valueStart);
                return json.substring(valueStart, valueEnd);
            }
        } catch (Exception ignored) {}
        return "";
    }

    /**
     * Helper: writes a UTF-8 JSON string as the HTTP response body.
     *
     * @param exchange   The active HTTP exchange
     * @param statusCode HTTP status code to send (e.g. 200, 400, 401, 500)
     * @param response   JSON string to send as the response body
     */
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
