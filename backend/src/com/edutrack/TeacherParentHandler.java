package com.edutrack;

import com.edutrack.dao.TeacherParentDAO;
import com.sun.net.httpserver.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class TeacherParentHandler implements HttpHandler {
    private TeacherParentDAO dao = new TeacherParentDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        String response = "[]";
        try {
            if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                // This correctly calls the Parents list for the Teacher
                response = dao.getParentsListJson();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}