package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.QuizContent;
import com.edutrack.models.QuizQuestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class QuizDAO {

    public boolean saveQuizAndQuestions(QuizContent quiz) {
        // 1. NEW: Added deadline to the INSERT statement
        String quizSql = "INSERT INTO quizzes (teacher_id, subject, title, duration_minutes, scheduled_date, deadline, total_marks) VALUES (?, ?, ?, ?, ?, ?, ?)";
        String questionSql = "INSERT INTO quiz_questions (quiz_id, question, image_url, options_json, correct_answer) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection()) {
            // 1. Save main Quiz with new settings
            PreparedStatement quizStmt = conn.prepareStatement(quizSql, Statement.RETURN_GENERATED_KEYS);
            quizStmt.setString(1, quiz.getTeacherId());
            quizStmt.setString(2, quiz.getSubject());
            quizStmt.setString(3, quiz.getTitle());
            quizStmt.setInt(4, quiz.getDurationMinutes());
            quizStmt.setString(5, quiz.getScheduledDate());
            quizStmt.setString(6, quiz.getDeadline()); // <-- NEW: Insert deadline
            quizStmt.setInt(7, quiz.getTotalMarks());
            quizStmt.executeUpdate();

            ResultSet rs = quizStmt.getGeneratedKeys();
            int newQuizId = -1;
            if (rs.next()) {
                newQuizId = rs.getInt(1);
            }

            // 2. Save Questions with images and dynamic options
            if (newQuizId != -1 && quiz.getQuestions() != null) {
                PreparedStatement qStmt = conn.prepareStatement(questionSql);
                for (QuizQuestion q : quiz.getQuestions()) {
                    qStmt.setInt(1, newQuizId);
                    qStmt.setString(2, q.getQuestion());
                    qStmt.setString(3, q.getImageUrl());
                    qStmt.setString(4, q.getOptionsJson());
                    qStmt.setString(5, q.getCorrectAnswer());
                    qStmt.executeUpdate();
                }
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Abstraction: Fetching quizzes AND their associated questions
    public String getQuizzesByTeacherJson(String teacherId) {
        StringBuilder json = new StringBuilder("[");
        // NEW: Added deadline to SELECT
        String quizSql = "SELECT id, title, subject, duration_minutes, scheduled_date, deadline, total_marks FROM quizzes WHERE teacher_id = ? ORDER BY id DESC";
        String questionSql = "SELECT question, image_url, options_json, correct_answer FROM quiz_questions WHERE quiz_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmtQuiz = conn.prepareStatement(quizSql);
             PreparedStatement pstmtQuestion = conn.prepareStatement(questionSql)) {
            
            pstmtQuiz.setString(1, teacherId);
            ResultSet rsQuiz = pstmtQuiz.executeQuery();
            
            boolean firstQuiz = true;
            while (rsQuiz.next()) {
                if (!firstQuiz) json.append(",");
                int quizId = rsQuiz.getInt("id");

                json.append("{")
                    .append("\"id\":").append(quizId).append(",")
                    .append("\"title\":\"").append(escapeJson(rsQuiz.getString("title"))).append("\",")
                    .append("\"subject\":\"").append(escapeJson(rsQuiz.getString("subject"))).append("\",")
                    .append("\"duration\":").append(rsQuiz.getInt("duration_minutes")).append(",")
                    .append("\"marks\":").append(rsQuiz.getInt("total_marks")).append(",")
                    .append("\"scheduledDate\":\"").append(escapeJson(rsQuiz.getString("scheduled_date"))).append("\",")
                    .append("\"deadline\":\"").append(escapeJson(rsQuiz.getString("deadline"))).append("\",") // <-- NEW: Append deadline to JSON
                    .append("\"questions\":[");

                pstmtQuestion.setInt(1, quizId);
                ResultSet rsQuestion = pstmtQuestion.executeQuery();
                boolean firstQuestion = true;
                while (rsQuestion.next()) {
                    if (!firstQuestion) json.append(",");
                    
                    json.append("{")
                        .append("\"question\":\"").append(escapeJson(rsQuestion.getString("question"))).append("\",")
                        .append("\"imageUrl\":\"").append(escapeJson(rsQuestion.getString("image_url"))).append("\",")
                        .append("\"options\":").append(rsQuestion.getString("options_json") != null ? rsQuestion.getString("options_json") : "[]").append(",")
                        .append("\"correctAnswer\":\"").append(escapeJson(rsQuestion.getString("correct_answer"))).append("\"")
                        .append("}");
                    firstQuestion = false;
                }
                
                json.append("]"); 
                json.append("}"); 
                firstQuiz = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    // Fetch Quizzes by Subject for the Student Dashboard ---
    public String getQuizzesBySubjectJson(String subject) {
        StringBuilder json = new StringBuilder("[");
        // NEW: Added deadline to SELECT
        String quizSql = "SELECT id, title, subject, duration_minutes, scheduled_date, deadline, total_marks FROM quizzes WHERE subject = ? ORDER BY id DESC";
        String questionSql = "SELECT question, image_url, options_json, correct_answer FROM quiz_questions WHERE quiz_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmtQuiz = conn.prepareStatement(quizSql);
             PreparedStatement pstmtQuestion = conn.prepareStatement(questionSql)) {
            
            pstmtQuiz.setString(1, subject);
            ResultSet rsQuiz = pstmtQuiz.executeQuery();
            
            boolean firstQuiz = true;
            while (rsQuiz.next()) {
                if (!firstQuiz) json.append(",");
                int quizId = rsQuiz.getInt("id");

                json.append("{")
                    .append("\"id\":").append(quizId).append(",")
                    .append("\"title\":\"").append(escapeJson(rsQuiz.getString("title"))).append("\",")
                    .append("\"subject\":\"").append(escapeJson(rsQuiz.getString("subject"))).append("\",")
                    .append("\"duration\":").append(rsQuiz.getInt("duration_minutes")).append(",")
                    .append("\"marks\":").append(rsQuiz.getInt("total_marks")).append(",")
                    .append("\"scheduledDate\":\"").append(escapeJson(rsQuiz.getString("scheduled_date"))).append("\",")
                    .append("\"deadline\":\"").append(escapeJson(rsQuiz.getString("deadline"))).append("\",") // <-- NEW: Append deadline to JSON
                    .append("\"questions\":[");

                pstmtQuestion.setInt(1, quizId);
                ResultSet rsQuestion = pstmtQuestion.executeQuery();
                boolean firstQuestion = true;
                while (rsQuestion.next()) {
                    if (!firstQuestion) json.append(",");
                    
                    json.append("{")
                        .append("\"question\":\"").append(escapeJson(rsQuestion.getString("question"))).append("\",")
                        .append("\"imageUrl\":\"").append(escapeJson(rsQuestion.getString("image_url"))).append("\",")
                        .append("\"options\":").append(rsQuestion.getString("options_json") != null ? rsQuestion.getString("options_json") : "[]").append(",")
                        .append("\"correctAnswer\":\"").append(escapeJson(rsQuestion.getString("correct_answer"))).append("\"")
                        .append("}");
                    firstQuestion = false;
                }
                
                json.append("]"); 
                json.append("}"); 
                firstQuiz = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    public boolean deleteQuiz(String id) {
        String sql = "DELETE FROM quizzes WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}