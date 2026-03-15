package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;

public class TeacherParentDAO {
    
    public String getParentsListJson() throws Exception {
        StringBuilder json = new StringBuilder("[");
        // Fetches Parents and joins the users table to get the Child's name!
        String sql = "SELECT p.id, p.name, p.email, s.name AS child_name " +
             "FROM users p " +
             "LEFT JOIN users s ON p.child_id = s.id " +
             "WHERE UPPER(p.role) = 'PARENT' ORDER BY p.name ASC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                String childName = rs.getString("child_name");
                if (childName == null) childName = "Unknown Student";

                json.append("{")
                    .append("\"id\":\"").append(rs.getString("id")).append("\",")
                    .append("\"name\":\"").append(escape(rs.getString("name"))).append("\",")
                    .append("\"email\":\"").append(escape(rs.getString("email"))).append("\",")
                    .append("\"childName\":\"").append(escape(childName)).append("\"")
                    .append("}");
                first = false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return json.append("]").toString();
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", "");
    }
}