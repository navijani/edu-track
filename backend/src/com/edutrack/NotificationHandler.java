package com.edutrack;

import com.edutrack.dao.NotificationDAO;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class NotificationHandler implements HttpHandler {

    private NotificationDAO notificationDAO = new NotificationDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.startsWith("targetClass=")) {
                String targetClass = "";
                try {
                    targetClass = URLDecoder.decode(query.split("=")[1], StandardCharsets.UTF_8.name());
                } catch (Exception e) {
                    System.out.println("Warning: Could not decode URL parameter.");
                }

                String jsonResponse = notificationDAO.getNotificationsForClassJson(targetClass);
                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 400, "[]");
            }
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
