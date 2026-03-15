package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class DocumentProgressDAO {

    public String getProgressByStudentJson(String studentId) {
        StringBuilder json = new StringBuilder("{");
        String sql = "SELECT document_id, watched_percentage, answered_count FROM student_document_progress WHERE student_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            ResultSet rs = pstmt.executeQuery();
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                int docId = rs.getInt("document_id");
                
                json.append("\"").append(docId).append("\":{")
                    .append("\"watchedPercentage\":").append(rs.getInt("watched_percentage")).append(",")
                    .append("\"answeredCount\":").append(rs.getInt("answered_count"))
                    .append("}");
                first = false;
            }
        } catch (Exception e) { e.printStackTrace(); }
        json.append("}");
        return json.toString();
    }

    public boolean saveProgress(String studentId, int documentId, int watchedPercentage, int answeredCount, String lastAccessed) {
        String sql = "INSERT INTO student_document_progress (student_id, document_id, watched_percentage, answered_count, last_accessed) " +
                     "VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE " +
                     "watched_percentage = GREATEST(watched_percentage, ?), " +
                     "answered_count = ?, last_accessed = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, studentId); pstmt.setInt(2, documentId);
            pstmt.setInt(3, watchedPercentage); pstmt.setInt(4, answeredCount); pstmt.setString(5, lastAccessed);
            pstmt.setInt(6, watchedPercentage); pstmt.setInt(7, answeredCount); pstmt.setString(8, lastAccessed);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}