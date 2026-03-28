package com.edutrack;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.edutrack.dao.ProgressSummaryDAO;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * ProgressSummaryHandler handles HTTP requests related to student progress metrics.
 * It acts as the bridge between the Frontend React application and the Database.
 */
public class ProgressSummaryHandler implements HttpHandler {
    private ProgressSummaryDAO summaryDAO = new ProgressSummaryDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // --- STEP 1: Handle CORS (Cross-Origin Resource Sharing) ---
        // This allows the React frontend (e.g., localhost:3000) to communicate with this Java backend.
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        // Handle pre-flight (OPTIONS) request sent by browsers
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // --- STEP 2: Handle GET Request for Progress Summary ---
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            
            // Validate if studentId is present in the query parameters
            if (query != null && query.contains("studentId=")) {
                try {
                    // Extracting the student ID from the URL (e.g., ?studentId=1)
                    String studentId = query.split("=")[1];
                    
                    // Fetch the progress data from DAO layer as a JSON string
                    String jsonResponse = summaryDAO.getSummaryJson(studentId);
                    
                    // Convert JSON string to byte array for the output stream
                    byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
                    
                    // Set Response Headers
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, bytes.length);
                    
                    // Write data to the response body
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(bytes);
                    }
                } catch (Exception e) {
                    // Send 500 Internal Server Error if something goes wrong during processing
                    System.err.println("Server Error: " + e.getMessage());
                    exchange.sendResponseHeaders(500, -1);
                }
            } else {
                // Send 400 Bad Request if studentId is missing
                exchange.sendResponseHeaders(400, -1);
            }
        } else {
            // Send 405 Method Not Allowed for non-GET/OPTIONS requests
            exchange.sendResponseHeaders(405, -1);
        }
    }
}