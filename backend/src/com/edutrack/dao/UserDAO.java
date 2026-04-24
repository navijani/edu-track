package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.Teacher;
import com.edutrack.models.User;
import java.sql.*; // This covers Connection, PreparedStatement, etc.

public class UserDAO {
    
    public boolean saveUser(User user, String childId) {
        String sql = "INSERT INTO users (id, name, email, password, role, subject, child_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, user.getId());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getEmail());
            pstmt.setString(4, user.getPassword());
            pstmt.setString(5, user.getRole());
            
            if (user instanceof Teacher) {
                pstmt.setString(6, ((Teacher) user).getSubject());
            } else {
                pstmt.setNull(6, Types.VARCHAR);
            }
            
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
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    if ("TEACHER".equalsIgnoreCase(role)) {
                        return new Teacher(id, rs.getString("name"), rs.getString("email"), password, role, rs.getString("subject"));
                    } else {
                        return new User(id, rs.getString("name"), rs.getString("email"), password, role);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean validateLogin(String id, String password, String role) {
        String query = "SELECT * FROM users WHERE id = ? AND password = ? AND role = ?";
        try (Connection conn = DBConnection.getConnection(); 
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setString(1, id);
            pstmt.setString(2, password);
            pstmt.setString(3, role);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next(); 
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}