package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class DocumentAnswerDAO {

    public String getDocumentAnswersJson(String studentId, int documentId) {
        StringBuilder json = new StringBuilder("{");
        String sql = "SELECT question_index, student_answer FROM student_document_answers WHERE student_id = ? AND document_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            pstmt.setInt(2, documentId);
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
        } catch (Exception e) { e.printStackTrace(); }
        json.append("}");
        return json.toString();
    }

    public boolean saveDocumentAnswer(String studentId, int documentId, int questionIndex, String answer) {
        // FIX: Added ON DUPLICATE KEY UPDATE to prevent crashes during testing
        String sql = "INSERT INTO student_document_answers (student_id, document_id, question_index, student_answer) " +
                     "VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE student_answer = ?";
                     
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, studentId);
            pstmt.setInt(2, documentId);
            pstmt.setInt(3, questionIndex);
            pstmt.setString(4, answer);
            pstmt.setString(5, answer); // Value for the UPDATE part
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String escapeJson(String data) {
        if (data == null) return "";
        return data.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}