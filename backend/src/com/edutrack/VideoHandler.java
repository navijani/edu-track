package com.edutrack;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.io.IOException;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.edutrack.dao.VideoDAO;
import com.edutrack.models.VideoContent;
import com.edutrack.models.VideoQuestion;
import java.net.URLDecoder;



public class VideoHandler implements HttpHandler {

    private VideoDAO videoDAO = new VideoDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // Handle GET request 
        if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            String query = exchange.getRequestURI().getQuery();
            
            // 1. Teacher Dashboard Request
            if (query != null && query.startsWith("teacherId=")) {
                String teacherId = query.split("=")[1];
                String jsonResponse = videoDAO.getVideosByTeacherJson(teacherId);
                sendResponse(exchange, 200, jsonResponse);
            } 
            // 2.Student Dashboard Request
            else if (query != null && query.startsWith("subject=")) {
                String subject = query.split("=")[1];
                
                // Decode the URL safely! (Converts "Data%20Structures" back to "Data Structures")
                subject = URLDecoder.decode(subject, StandardCharsets.UTF_8);
                
                String jsonResponse = videoDAO.getVideosBySubjectJson(subject);
                sendResponse(exchange, 200, jsonResponse);
            } 
            else {
                sendResponse(exchange, 400, "[]");
            }
            return;
        }

        //  Handle DELETE request 
        if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
            String query = exchange.getRequestURI().getQuery(); // looks like "id=5"
            if (query != null && query.startsWith("id=")) {
                String id = query.split("=")[1];
                
                if (videoDAO.deleteVideo(id)) { // Change this line in Quiz/Doc handlers!
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }
            }
            return;
        }

        if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                // Extract basic video details
                String teacherId = body.split("\"teacherId\":\"")[1].split("\"")[0];
                String subject = body.split("\"subject\":\"")[1].split("\"")[0];
                String title = body.split("\"title\":\"")[1].split("\"")[0];
                String videoUrl = body.split("\"videoUrl\":\"")[1].split("\"")[0];

                // Extract the Questions Array manually
                List<VideoQuestion> questionList = new ArrayList<>();
                if (body.contains("\"questions\":[{")) {
                    String questionsPart = body.substring(body.indexOf("\"questions\":[{") + 13);
                    questionsPart = questionsPart.substring(0, questionsPart.lastIndexOf("]"));
                    
                    // Split the array into individual question blocks
                    String[] qBlocks = questionsPart.split("},\\{");
                    for (String block : qBlocks) {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode node = mapper.readTree(block);

                        String q = node.get("question").asText();
                        String a = node.get("answer").asText();
                        questionList.add(new VideoQuestion(q, a));
                    }
                }

                // Create the Model and send to DAO
                VideoContent newVideo = new VideoContent(teacherId, subject, title, videoUrl, questionList);
                
                if (videoDAO.saveVideoAndQuestions(newVideo)) {
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"success\":false}");
                }

            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"success\":false}");
            }
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
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
}