package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.User;
import com.edutrack.models.Teacher;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;

public class UserDAO {
    
    // UPDATED: Now accepts childId as a parameter
    public boolean saveUser(User user, String childId) {
        // Added child_id to the INSERT statement
        String sql = "INSERT INTO users (id, name, email, password, role, subject, child_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, user.getId());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getEmail());
            pstmt.setString(4, user.getPassword());
            pstmt.setString(5, user.getRole());
            
            // Handle Teacher Subject
            if (user instanceof Teacher) {
                pstmt.setString(6, ((Teacher) user).getSubject());
            } else {
                pstmt.setNull(6, Types.VARCHAR); // Using setNull is cleaner for databases than empty strings
            }
            
            // Handle Parent childId
            if (childId != null && !childId.trim().isEmpty()) {
                pstmt.setString(7, childId);
            } else {
                pstmt.setNull(7, Types.VARCHAR);
            }
            
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteUser(String id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public String getAllUsersJson() {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT id, name, email, role, subject, child_id FROM users";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                
                String id = rs.getString("id");
                String name = rs.getString("name");
                String email = rs.getString("email");
                String role = rs.getString("role");
                String subject = rs.getString("subject");
                String childId = rs.getString("child_id");
                
                // 1. Use the Factory during fetching operations as stated in the report
                User user = com.edutrack.models.UserFactory.createUser(id, name, email, "", role, subject);
                
                String displaySubject = (user instanceof Teacher) ? ((Teacher) user).getSubject() : "None";
                String displayChildId = (childId == null) ? "None" : childId;
                
                // 2. Build JSON from the actual Factory-created object
                json.append("{\"id\":\"").append(user.getId())
                    .append("\",\"name\":\"").append(user.getName())
                    .append("\",\"email\":\"").append(user.getEmail())
                    .append("\",\"role\":\"").append(user.getRole())
                    .append("\",\"subject\":\"").append(displaySubject)
                    .append("\",\"childId\":\"").append(displayChildId).append("\"}");
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    public User authenticateUser(String id, String password, String role) {
        String sql = "SELECT * FROM users WHERE id = ? AND password = ? AND role = ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, id);
            pstmt.setString(2, password);
            pstmt.setString(3, role);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                String dbName = rs.getString("name");
                String dbEmail = rs.getString("email");
                String dbSubject = rs.getString("subject");

                return com.edutrack.models.UserFactory.createUser(id, dbName, dbEmail, password, role, dbSubject);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}