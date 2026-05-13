package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class StudentQuizDAO {

    // 0. Fetch ranklist for a specific quiz (name, score, rank)
    public String getRanklistByQuizJson(int quizId) {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT u.name, s.student_id, s.score, s.attend_time "
                   + "FROM student_quiz_submissions s "
                   + "JOIN users u ON s.student_id = u.id "
                   + "WHERE s.quiz_id = ? "
                   + "ORDER BY s.score DESC, s.attend_time ASC"; // Tiebreaker: earlier submission wins

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, quizId);
            ResultSet rs = pstmt.executeQuery();
            boolean first = true;
            int rank = 1;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"rank\":").append(rank).append(",")
                    .append("\"name\":\"").append(escapeJson(rs.getString("name"))).append("\",")
                    .append("\"studentId\":\"").append(escapeJson(rs.getString("student_id"))).append("\",")
                    .append("\"score\":").append(rs.getInt("score")).append(",")
                    .append("\"attendTime\":\"").append(escapeJson(rs.getString("attend_time"))).append("\"")
                    .append("}");

                first = false;
                rank++;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    public String getSubmissionsByStudentJson(String studentId) {
        StringBuilder json = new StringBuilder("{");
        String sql = "SELECT quiz_id, answers_json, score, attend_time FROM student_quiz_submissions WHERE student_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            ResultSet rs = pstmt.executeQuery();
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                int quizId = rs.getInt("quiz_id");
                
                // We create a JSON object where the Quiz ID is the key
                json.append("\"").append(quizId).append("\":{")
                    .append("\"score\":").append(rs.getInt("score")).append(",")
                    .append("\"answers\":\"").append(escapeJson(rs.getString("answers_json"))).append("\",")
                    .append("\"attendTime\":\"").append(escapeJson(rs.getString("attend_time"))).append("\"")
                    .append("}");
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("}");
        return json.toString();
    }

    // 2. Save a new completed quiz submission
    public boolean saveSubmission(String studentId, int quizId, String answersJson, int score, String attendTime) {
        String sql = "INSERT INTO student_quiz_submissions (student_id, quiz_id, answers_json, score, attend_time) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            pstmt.setInt(2, quizId);
            pstmt.setString(3, answersJson);
            pstmt.setInt(4, score);
            pstmt.setString(5, attendTime);
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper to prevent JSON syntax crashes
    private String escapeJson(String data) {
        if (data == null) return "";
        return data.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "");
    }
}