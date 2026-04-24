package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.User;
import com.edutrack.models.Teacher;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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

    // UPDATED: Now also fetches child_id so you can see it in the Admin Dashboard
    public String getAllUsersJson() {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT id, name, email, role, subject, child_id FROM users";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                String subject = rs.getString("subject") == null ? "None" : rs.getString("subject");
                String childId = rs.getString("child_id") == null ? "None" : rs.getString("child_id");
                
                json.append("{\"id\":\"").append(rs.getString("id"))
                    .append("\",\"name\":\"").append(rs.getString("name"))
                    .append("\",\"email\":\"").append(rs.getString("email"))
                    .append("\",\"role\":\"").append(rs.getString("role"))
                    .append("\",\"subject\":\"").append(subject)
                    .append("\",\"childId\":\"").append(childId).append("\"}");
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

                if ("TEACHER".equalsIgnoreCase(role)) {
                    return new Teacher(id, dbName, dbEmail, password, role, dbSubject);
                } else {
                    return new User(id, dbName, dbEmail, password, role);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean validateLogin(String id, String password, String role) {
    String query = "SELECT * FROM users WHERE id = ? AND password = ? AND role = ?";
    
    // Assuming you have a method to get a database connection
    try (Connection conn = this.getConnection(); 
         PreparedStatement pstmt = conn.prepareStatement(query)) {
        
        pstmt.setString(1, id);
        pstmt.setString(2, password);
        pstmt.setString(3, role);
        
        ResultSet rs = pstmt.executeQuery();
        
        // If a row is returned, the credentials are valid
        return rs.next(); 
        
    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}
}