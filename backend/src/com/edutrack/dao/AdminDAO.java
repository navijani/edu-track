package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.Admin;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AdminDAO {

    public Admin authenticateAdmin(String email, String password) {
        String sql = "SELECT * FROM admins WHERE email = ? AND is_deleted = FALSE";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
             
            pstmt.setString(1, email);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                String dbPasswordHash = rs.getString("password_hash");
                
                if (BCrypt.checkpw(password, dbPasswordHash)) {
                    String id = String.valueOf(rs.getInt("id"));
                    String role = rs.getString("role");
                    return new Admin(id, email, "System Administrator", role);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public String getAllAdminsJson() {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT id, email, role, created_by, created_at FROM admins WHERE is_deleted = FALSE";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
             
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                
                json.append("{")
                    .append("\"id\":\"").append(rs.getInt("id")).append("\",")
                    .append("\"email\":\"").append(rs.getString("email")).append("\",")
                    .append("\"role\":\"").append(rs.getString("role")).append("\",")
                    .append("\"createdBy\":\"").append(rs.getString("created_by")).append("\",")
                    .append("\"createdAt\":\"").append(rs.getString("created_at")).append("\"")
                    .append("}");
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    public boolean addAdmin(String email, String password, String role, String createdBy) {
        String sql = "INSERT INTO admins (email, password_hash, role, created_by) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
             
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
            
            pstmt.setString(1, email);
            pstmt.setString(2, hashedPassword);
            pstmt.setString(3, role);
            pstmt.setString(4, createdBy);
            
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteAdmin(String email) {
        // Prevent deleting MAIN_ADMIN
        String checkSql = "SELECT role FROM admins WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
             
            checkStmt.setString(1, email);
            ResultSet rs = checkStmt.executeQuery();
            if (rs.next()) {
                String role = rs.getString("role");
                if ("MAIN_ADMIN".equals(role)) {
                    return false; // Cannot delete MAIN_ADMIN
                }
            } else {
                return false; // Admin not found
            }
            
            String updateSql = "UPDATE admins SET is_deleted = TRUE WHERE email = ?";
            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                updateStmt.setString(1, email);
                return updateStmt.executeUpdate() > 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
