package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class VideoProgressDAO {

    public String getProgressByStudentJson(String studentId) {
        StringBuilder json = new StringBuilder("{");
        String sql = "SELECT video_id, watched_percentage, watched_seconds, answered_count FROM student_video_progress WHERE student_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, studentId);
            ResultSet rs = pstmt.executeQuery();
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                String videoId = rs.getString("video_id");
                
                json.append("\"").append(videoId).append("\":{")
                    .append("\"watchedPercentage\":").append(rs.getInt("watched_percentage")).append(",")
                    .append("\"watchedSeconds\":").append(rs.getInt("watched_seconds")).append(",")
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

    public boolean saveProgress(String studentId, String videoId, int watchedPercentage, int watchedSeconds, int answeredCount, String lastAccessed) {
        // We use GREATEST() to ensure progress only goes forward, never backwards
        String sql = "INSERT INTO student_video_progress (student_id, video_id, watched_percentage, watched_seconds, answered_count, last_accessed) " +
                     "VALUES (?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE " +
                     "watched_percentage = GREATEST(watched_percentage, ?), " +
                     "watched_seconds = GREATEST(watched_seconds, ?), " + 
                     "answered_count = ?, " +
                     "last_accessed = ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            // Insert params
            pstmt.setString(1, studentId);
            pstmt.setString(2, videoId);
            pstmt.setInt(3, watchedPercentage);
            pstmt.setInt(4, watchedSeconds);
            pstmt.setInt(5, answeredCount);
            pstmt.setString(6, lastAccessed);
            
            // Update params
            pstmt.setInt(7, watchedPercentage);
            pstmt.setInt(8, watchedSeconds);
            pstmt.setInt(9, answeredCount);
            pstmt.setString(10, lastAccessed);
            
            pstmt.executeUpdate();
            return true;
            
        } catch (Exception e) {
            System.err.println("DAO Error: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}