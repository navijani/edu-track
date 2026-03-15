package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class StudentAnswerDAO {

    // 1. Fetch saved answers formatted as a JSON Object: {"0":"My answer", "1":"Another answer"}
    public String getVideoAnswersJson(String studentId, int videoId) {
        StringBuilder json = new StringBuilder("{");
        String sql = "SELECT question_index, student_answer FROM student_video_answers WHERE student_id = ? AND video_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            pstmt.setInt(2, videoId);
            ResultSet rs = pstmt.executeQuery();
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                int qIndex = rs.getInt("question_index");
                String answer = rs.getString("student_answer");
                
                json.append("\"").append(qIndex).append("\":\"")
                    .append(escapeJson(answer)).append("\"");
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("}");
        return json.toString();
    }

    // 2. Save a new answer permanently
    public boolean saveVideoAnswer(String studentId, int videoId, int questionIndex, String answer) {
        String sql = "INSERT INTO student_video_answers (student_id, video_id, question_index, student_answer) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            pstmt.setInt(2, videoId);
            pstmt.setInt(3, questionIndex);
            pstmt.setString(4, answer);
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper to prevent JSON crashes if a student types "quotes" or hits Enter in their answer
    private String escapeJson(String data) {
        if (data == null) return "";
        return data.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\b", "\\b")
                   .replace("\f", "\\f")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}