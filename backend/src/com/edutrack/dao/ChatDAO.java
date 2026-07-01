package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;

public class ChatDAO {

    public ChatDAO() {
        createTableIfNotExists();
    }

    private void createTableIfNotExists() {
        String sql = "CREATE TABLE IF NOT EXISTS chat_messages (" +
                     "id INT PRIMARY KEY AUTO_INCREMENT, " +
                     "parent_id VARCHAR(50) NOT NULL, " +
                     "teacher_id VARCHAR(50) NOT NULL, " +
                     "sender_id VARCHAR(50) NOT NULL, " +
                     "sender_name VARCHAR(100), " +
                     "message TEXT NOT NULL, " +
                     "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        } catch (Exception e) {
            System.out.println("Error creating chat_messages table: " + e.getMessage());
        }
    }

    public boolean sendMessage(String parentId, String teacherId, String senderId, String senderName, String message) {
        String sql = "INSERT INTO chat_messages (parent_id, teacher_id, sender_id, sender_name, message) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, parentId);
            ps.setString(2, teacherId);
            ps.setString(3, senderId);
            ps.setString(4, senderName);
            ps.setString(5, message);
            return ps.executeUpdate() > 0;
        } catch (Exception e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    public String getMessagesJson(String parentId, String teacherId) {
        StringBuilder json = new StringBuilder("[");
        // Fetches the conversation and sorts it oldest to newest
        String sql = "SELECT * FROM chat_messages WHERE parent_id = ? AND teacher_id = ? ORDER BY created_at ASC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, parentId);
            ps.setString(2, teacherId);
            ResultSet rs = ps.executeQuery();
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"senderId\":\"").append(rs.getString("sender_id")).append("\",")
                    .append("\"senderName\":\"").append(escape(rs.getString("sender_name"))).append("\",")
                    .append("\"message\":\"").append(escape(rs.getString("message"))).append("\",")
                    .append("\"timestamp\":\"").append(rs.getTimestamp("created_at")).append("\"")
                    .append("}");
                first = false;
            }
        } catch (Exception e) { 
            e.printStackTrace(); 
        }
        return json.append("]").toString();
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("\"", "\\\"").replace("\n", "\\n");
    }
}