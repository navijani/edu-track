package com.edutrack;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws Exception {
        // Create server on port 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        
        // Route for adding subjects
        server.createContext("/api/subjects", new SubjectHandler());
        
        // Route for adding users
        server.createContext("/api/users/register", new UserHandler());

        server.createContext("/api/users/login", new LoginHandler());

        server.createContext("/api/contents/video", new VideoHandler());

        server.createContext("/api/contents/quiz", new QuizHandler());

        server.createContext("/api/contents/document", new DocumentHandler());
        
        server.setExecutor(null);
        System.out.println("EduTrack Backend started on port 8080...");
        server.start();
    }
}