package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;

public class NotificationDAO {

    public boolean addNotification(String teacherId, String targetClass, String subject, String contentType, String title) {
        String sql = "INSERT INTO notifications (teacher_id, target_class, subject, content_type, title) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, teacherId);
            pstmt.setString(2, targetClass);
            pstmt.setString(3, subject);
            pstmt.setString(4, contentType);
            pstmt.setString(5, title);
            
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public String getNotificationsForClassJson(String targetClass) {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT id, teacher_id, subject, content_type, title, created_at FROM notifications WHERE target_class = ? OR target_class = 'All' ORDER BY created_at DESC LIMIT 20";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, targetClass);
            ResultSet rs = pstmt.executeQuery();
            
            boolean first = true;
            while (rs.next()) {
                if (!first) {
                    json.append(",");
                }
                
                int id = rs.getInt("id");
                String teacherId = rs.getString("teacher_id");
                String subject = rs.getString("subject");
                String contentType = rs.getString("content_type");
                String title = rs.getString("title");
                Timestamp createdAt = rs.getTimestamp("created_at");
                
                json.append("{")
                    .append("\"id\":").append(id).append(",")
                    .append("\"teacherId\":\"").append(teacherId != null ? teacherId.replace("\"", "\\\"") : "").append("\",")
                    .append("\"subject\":\"").append(subject != null ? subject.replace("\"", "\\\"") : "").append("\",")
                    .append("\"contentType\":\"").append(contentType != null ? contentType.replace("\"", "\\\"") : "").append("\",")
                    .append("\"title\":\"").append(title != null ? title.replace("\"", "\\\"") : "").append("\",")
                    .append("\"createdAt\":\"").append(createdAt.toString()).append("\"")
                    .append("}");
                
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }
}
