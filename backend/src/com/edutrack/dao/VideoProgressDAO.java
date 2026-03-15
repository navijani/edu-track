package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class VideoProgressDAO {

    // 1. Fetch all video progress for a specific student
    // Inside VideoProgressDAO.java

    public String getProgressByStudentJson(String studentId) {
        StringBuilder json = new StringBuilder("{");
        // NEW: Select watched_seconds
        String sql = "SELECT video_id, watched_percentage, watched_seconds, answered_count FROM student_video_progress WHERE student_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            ResultSet rs = pstmt.executeQuery();
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                int videoId = rs.getInt("video_id");
                
                json.append("\"").append(videoId).append("\":{")
                    .append("\"watchedPercentage\":").append(rs.getInt("watched_percentage")).append(",")
                    .append("\"watchedSeconds\":").append(rs.getInt("watched_seconds")).append(",") // NEW
                    .append("\"answeredCount\":").append(rs.getInt("answered_count"))
                    .append("}");
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("}");
        return json.toString();
    }

    // NEW: Added watchedSeconds parameter and GREATEST logic
    public boolean saveProgress(String studentId, int videoId, int watchedPercentage, int watchedSeconds, int answeredCount, String lastAccessed) {
        String sql = "INSERT INTO student_video_progress (student_id, video_id, watched_percentage, watched_seconds, answered_count, last_accessed) " +
                     "VALUES (?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE " +
                     "watched_percentage = GREATEST(watched_percentage, ?), " +
                     "watched_seconds = GREATEST(watched_seconds, ?), " + // NEW
                     "answered_count = ?, " +
                     "last_accessed = ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            pstmt.setInt(2, videoId);
            pstmt.setInt(3, watchedPercentage);
            pstmt.setInt(4, watchedSeconds); // NEW
            pstmt.setInt(5, answeredCount);
            pstmt.setString(6, lastAccessed);
            
            pstmt.setInt(7, watchedPercentage);
            pstmt.setInt(8, watchedSeconds); // NEW
            pstmt.setInt(9, answeredCount);
            pstmt.setString(10, lastAccessed);
            
            pstmt.executeUpdate();
            return true;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}