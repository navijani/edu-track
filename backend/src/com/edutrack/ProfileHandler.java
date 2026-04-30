package com.edutrack;

import com.edutrack.dao.UserDAO;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * ProfileHandler – HTTP Handler for fetching a user's complete profile.
 *
 * ─────────────────────────────────────────────────────────────────
 * Endpoint : GET /api/users/profile?userId=<id>
 * ─────────────────────────────────────────────────────────────────
 *
 * Response JSON fields (all roles):
 *   id, name, email, role
 *
 * Role-specific response fields:
 *   Students → studentClass, parentId, parentName, parentEmail
 *   Teachers → subject
 *   Parents  → childId, childName, childClass
 *
 * This handler is intentionally read-only (GET).
 * Password changes are handled by ChangePasswordHandler (PUT).
 * Profile registration/deletion is handled by UserHandler (POST/DELETE).
 *
 * HTTP Status codes returned:
 *   200 – Profile found and returned successfully
 *   400 – userId query parameter is missing from the request URL
 *   404 – No user with the given userId exists in the database
 *   405 – HTTP method other than GET or OPTIONS was used
 *   500 – Unexpected server-side exception
 */
public class ProfileHandler implements HttpHandler {

    /**
     * UserDAO instance used to query the database.
     * Declared final because it does not need to change after construction.
     */
    private final UserDAO userDAO = new UserDAO();

    /**
     * Main entry point – called by the HTTP server for every request
     * to /api/users/profile.
     *
     * Flow:
     *   1. Set CORS headers (allows the React frontend to call this endpoint)
     *   2. Handle browser pre-flight OPTIONS request
     *   3. Reject non-GET methods with 405
     *   4. Parse the `userId` query parameter
     *   5. Delegate profile lookup to UserDAO.getUserProfile()
     *   6. Return 200 with profile JSON, or 404/500 on failure
     *
     * @param exchange  The com.sun.net.httpserver.HttpExchange object that
     *                  represents the incoming request and outgoing response
     * @throws IOException if writing the response body fails
     */
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // ─── Step 1: CORS headers ────────────────────────────────────────────
        // These headers allow the React dev server (different origin) to call
        // this endpoint without being blocked by the browser's same-origin policy.
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        String method = exchange.getRequestMethod().toUpperCase();

        // ─── Step 2: Handle browser pre-flight ───────────────────────────────
        // Before making cross-origin GET requests, browsers send an OPTIONS
        // "pre-flight" request to check what the server allows.
        // We respond with 204 No Content to satisfy this check.
        if (method.equals("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // ─── Step 3: Method guard ─────────────────────────────────────────────
        // This endpoint is read-only; only GET is meaningful here.
        // Reject anything else (POST, PUT, DELETE…) with 405 Method Not Allowed.
        if (!method.equals("GET")) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        try {
            // ─── Step 4: Parse the userId query parameter ─────────────────────
            // The expected URL format is: /api/users/profile?userId=S001
            // getQuery() returns the raw query string, e.g. "userId=S001".
            // We split on "&" in case multiple parameters are passed in the future.
            String query  = exchange.getRequestURI().getQuery();
            String userId = ""; // will be populated from the query string

            if (query != null) {
                for (String param : query.split("&")) {
                    if (param.startsWith("userId=")) {
                        // Extract the value after "userId="
                        userId = param.substring("userId=".length());
                        break; // stop as soon as we find the parameter
                    }
                }
            }

            // Guard: userId must be present and non-empty
            if (userId.isEmpty()) {
                sendResponse(exchange, 400, "{\"error\":\"Missing userId parameter\"}");
                return;
            }

            System.out.println("\n--- PROFILE FETCH for userId: " + userId + " ---");

            // ─── Step 5: Delegate to UserDAO ──────────────────────────────────
            // UserDAO.getUserProfile() performs:
            //   a) SELECT the base user row
            //   b) For students: also SELECT the linked parent row
            //   c) For parents:  also SELECT the linked child row
            //   d) Build and return a complete JSON string
            String jsonResponse = userDAO.getUserProfile(userId);

            System.out.println("Profile response: " + jsonResponse);

            // ─── Step 6: Return the profile JSON ─────────────────────────────
            // If the DAO could not find the user it returns JSON with an
            // "error" key – we map that to an HTTP 404 response.
            // Otherwise we return 200 with the full profile JSON.
            if (jsonResponse.contains("\"error\"")) {
                sendResponse(exchange, 404, jsonResponse);
            } else {
                sendResponse(exchange, 200, jsonResponse);
            }

        } catch (Exception e) {
            // Catch-all for unexpected exceptions (e.g. database connectivity issues)
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Server error\"}");
        }
    }

    /**
     * Convenience helper that writes a UTF-8 JSON string as the HTTP response.
     *
     * Sets Content-Type: application/json before sending so the React client
     * knows how to parse the body automatically.
     *
     * @param exchange   The active HTTP exchange (request + response pair)
     * @param statusCode HTTP status code to send  (e.g. 200, 400, 404, 500)
     * @param response   The JSON string to use as the response body
     * @throws IOException if the underlying output stream throws
     */
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);

        // Content-Type header must be set BEFORE sendResponseHeaders is called
        exchange.getResponseHeaders().add("Content-Type", "application/json");

        // Second argument is the exact body length in bytes (-1 = no body)
        exchange.sendResponseHeaders(statusCode, bytes.length);

        // Write response body and close the stream with try-with-resources
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
