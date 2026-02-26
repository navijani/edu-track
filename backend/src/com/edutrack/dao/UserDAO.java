package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.User;
import com.edutrack.models.Teacher;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UserDAO {
    
    // Abstraction: The handler just says "saveUser", it doesn't need to know SQL
    public boolean saveUser(User user) {
        String sql = "INSERT INTO users (id, name, email, password, role, subject) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, user.getId());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getEmail());
            pstmt.setString(4, user.getPassword());
            pstmt.setString(5, user.getRole());
            
            // Polymorphism: Check if the user is a Teacher to get the subject
            if (user instanceof Teacher) {
                pstmt.setString(6, ((Teacher) user).getSubject());
            } else {
                pstmt.setString(6, ""); 
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

    // Returns a raw JSON string of all users to keep your Handler clean
    public String getAllUsersJson() {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT id, name, email, role, subject FROM users";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                String subject = rs.getString("subject") == null ? "None" : rs.getString("subject");
                json.append("{\"id\":\"").append(rs.getString("id"))
                    .append("\",\"name\":\"").append(rs.getString("name"))
                    .append("\",\"email\":\"").append(rs.getString("email"))
                    .append("\",\"role\":\"").append(rs.getString("role"))
                    .append("\",\"subject\":\"").append(subject).append("\"}");
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

                // Polymorphism: Return a Teacher object if the role matches, else return a standard User
                if ("TEACHER".equalsIgnoreCase(role)) {
                    return new Teacher(id, dbName, dbEmail, password, role, dbSubject);
                } else {
                    return new User(id, dbName, dbEmail, password, role);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null; // Return null if login fails
    }
}