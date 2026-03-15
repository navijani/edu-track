package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.Subject;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class SubjectDAO {
    
    // Saves a Subject object to the database
    public boolean saveSubject(Subject subject) {
        String sql = "INSERT INTO subjects (code, title) VALUES (?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, subject.getCode());
            pstmt.setString(2, subject.getTitle());
            
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Retrieves all subjects and formats them as a JSON string
    public String getAllSubjectsJson() {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT code, title FROM subjects";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{\"code\":\"").append(rs.getString("code"))
                    .append("\",\"title\":\"").append(rs.getString("title")).append("\"}");
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }
}