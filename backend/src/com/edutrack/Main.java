package com.edutrack;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws Exception {
        // Create server on port 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Route for adding subjects
        server.createContext("/api/subjects", new SubjectHandler());
        
        // Route for adding users
        server.createContext("/api/users", new UserHandler());

        server.createContext("/api/users/login", new LoginHandler());

        server.createContext("/api/contents/video", new VideoHandler());

        server.createContext("/api/contents/quiz", new QuizHandler());

        server.createContext("/api/contents/document", new DocumentHandler());

        server.createContext("/api/answers/video", new StudentAnswerHandler());

        server.createContext("/api/answers/quiz", new StudentQuizHandler());

        server.createContext("/api/progress/video", new VideoProgressHandler());

        server.createContext("/api/answers/document", new DocumentAnswerHandler());

        server.createContext("/api/progress/document", new DocumentProgressHandler());

        server.createContext("/api/progress/summary", new ProgressSummaryHandler());

        server.createContext("/api/student/dashboard", new StudentDashboardHandler());

        server.createContext("/api/zoom", new ZoomHandler());

        server.createContext("/api/forum", new ForumHandler());

        server.createContext("/api/teacher/students", new TeacherStudentHandler());

        server.createContext("/api/teacher/dashboard", new TeacherDashboardHandler());

        server.createContext("/api/parent/dashboard", new ParentHandler());
        
        server.createContext("/api/notifications", new NotificationHandler());

        server.createContext("/api/chat", new ChatHandler());

        server.createContext("/api/parent/teachers", new ParentTeachersHandler());

        server.createContext("/api/teacher/parents", new TeacherParentHandler());
        
        server.setExecutor(null);
        System.out.println("EduTrack Backend started on port 8080...");
        server.start();
    }
}