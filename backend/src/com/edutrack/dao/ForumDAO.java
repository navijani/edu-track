package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;

public class ForumDAO {
    
    // Removed 'throws Exception' to handle the error cleanly inside the method
    public boolean savePost(String name, String role, String subject, String msg, Integer parentId) throws Exception {
        String sql = "INSERT INTO forum_posts (user_name, user_role, subject, message, parent_id) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setString(2, role);
            ps.setString(3, subject);
            ps.setString(4, msg);
            if (parentId == null) ps.setNull(5, Types.INTEGER);
            else ps.setInt(5, parentId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    public String getPostsJson(String subject) throws Exception {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT * FROM forum_posts WHERE subject = ? ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, subject);
            ResultSet rs = ps.executeQuery();
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"name\":\"").append(escape(rs.getString("user_name"))).append("\",")
                    .append("\"role\":\"").append(escape(rs.getString("user_role"))).append("\",")
                    .append("\"message\":\"").append(escape(rs.getString("message"))).append("\",")
                    .append("\"parentId\":").append(rs.getInt("parent_id")).append(",")
                    .append("\"date\":\"").append(rs.getTimestamp("created_at")).append("\"")
                    .append("}");
                first = false;
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return json.append("]").toString();
    }

    // Crucial: Escapes quotes AND newlines so JSON remains valid
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}