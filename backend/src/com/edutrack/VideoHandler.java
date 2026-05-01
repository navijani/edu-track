package com.edutrack;

import com.edutrack.dao.VideoDAO;
import com.edutrack.models.VideoContent;
import com.edutrack.models.VideoQuestion;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;



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
            // 2.Student Dashboard Request: Fetch videos filtered by Subject AND Student's Class
            else if (query != null && query.startsWith("subject=")) {
                String subject = "";
                
                // targetClass is used to filter out videos that don't match the student's grade
                String targetClass = "";
                
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length > 1) {
                        try {
                            String value = URLDecoder.decode(pair[1], StandardCharsets.UTF_8.name());
                            if (pair[0].equals("subject")) subject = value;
                            
                            // Extract the targetClass parameter sent by the React frontend
                            if (pair[0].equals("targetClass")) targetClass = value;
                        } catch (Exception e) {
                            System.out.println("Warning: Could not decode URL parameter.");
                        }
                    }
                }
                
                // Call the DAO to fetch only videos matching BOTH the subject and the student's class
                String jsonResponse = videoDAO.getVideosBySubjectAndClassJson(subject, targetClass);
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
                
                String targetClass = "";
                if (body.contains("\"targetClass\":\"")) {
                    targetClass = body.split("\"targetClass\":\"")[1].split("\"")[0];
                }

                // Extract the Questions Array manually
                List<VideoQuestion> questionList = new ArrayList<>();
                if (body.contains("\"questions\":[{")) {
                    String questionsPart = body.substring(body.indexOf("\"questions\":[{") + 13);
                    questionsPart = questionsPart.substring(0, questionsPart.lastIndexOf("]"));
                    
                    // Split the array into individual question blocks
                    String[] qBlocks = questionsPart.split("},\\{");
                    for (String block : qBlocks) {
                        String q = block.split("\"question\":\"")[1].split("\"")[0];
                        String a = block.split("\"answer\":\"")[1].split("\"")[0];
                        questionList.add(new VideoQuestion(q, a));
                    }
                }

                // Create the Model and send to DAO
                VideoContent newVideo = new VideoContent(teacherId, subject, title, videoUrl, targetClass, questionList);
                
                if (videoDAO.saveVideoAndQuestions(newVideo)) {
                    new com.edutrack.dao.NotificationDAO().addNotification(teacherId, targetClass, subject, "Video", title);
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