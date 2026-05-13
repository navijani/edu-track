package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * TEMPLATE METHOD PATTERN — BaseHandler
 *
 * Defines the skeleton of the HTTP request-handling algorithm in one place.
 * All concrete handlers (QuizHandler, VideoHandler, etc.) extend this class
 * and inherit CORS handling and the sendResponse() utility for free.
 *
 * This eliminates the ~5 lines of duplicated CORS boilerplate that existed
 * in every single handler across the project.
 *
 * The Template Method is `handle()`:
 *   1. Set CORS headers          ← defined HERE, always the same
 *   2. Handle OPTIONS preflight  ← defined HERE, always the same
 *   3. Route to concrete logic   ← defined in SUBCLASS via handleRequest()
 */
public abstract class BaseHandler implements HttpHandler {

    /**
     * Template Method — the fixed skeleton every HTTP handler follows.
     * Subclasses must NOT override this. They implement handleRequest() instead.
     */
    @Override
    public final void handle(HttpExchange exchange) throws IOException {
        // Step 1: Set standard CORS headers (same for every handler)
        setCorsHeaders(exchange);

        // Step 2: Handle the browser's OPTIONS preflight request (same for every handler)
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        // Step 3: Delegate to the subclass-specific implementation
        handleRequest(exchange);
    }

    /**
     * Hook method — subclasses implement their specific GET/POST/DELETE logic here.
     * This is the only part that changes between handlers.
     */
    protected abstract void handleRequest(HttpExchange exchange) throws IOException;

    /**
     * Shared utility: writes a JSON string response with the given HTTP status code.
     * Eliminates copy-pasted sendResponse() methods across all handlers.
     */
    protected void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Shared utility: attaches CORS headers required for the React frontend.
     */
    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }
}
