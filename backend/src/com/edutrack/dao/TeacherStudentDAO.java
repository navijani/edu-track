package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;

public class TeacherStudentDAO {
    
    public String getStudentsJson() throws Exception {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name ASC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":\"").append(rs.getString("id")).append("\",")
                    .append("\"name\":\"").append(escape(rs.getString("name"))).append("\",")
                    .append("\"email\":\"").append(escape(rs.getString("email"))).append("\"")
                    .append("}");
                first = false;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return json.append("]").toString();
    }

    // NEW: Fetches progress data for a specific student and subject
    public String getStudentProgressJson(String studentId, String subject) {
        StringBuilder json = new StringBuilder("{");
        
        // 1. Quizzes
        json.append("\"quizzes\":[");
        String qSql = "SELECT q.title, s.score, q.total_marks FROM student_quiz_submissions s JOIN quizzes q ON s.quiz_id = q.id WHERE s.student_id = ? AND q.subject = ?";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(qSql)) {
            ps.setString(1, studentId); ps.setString(2, subject);
            ResultSet rs = ps.executeQuery();
            boolean first = true;
            while(rs.next()) {
                if(!first) json.append(",");
                json.append("{\"title\":\"").append(escape(rs.getString("title"))).append("\",")
                    .append("\"score\":").append(rs.getInt("score")).append(",")
                    .append("\"total\":").append(rs.getInt("total_marks")).append("}");
                first = false;
            }
        } catch (Exception e) {}
        json.append("],");

        // 2. Videos
        json.append("\"videos\":[");
        String vSql = "SELECT v.title, p.watched_percentage FROM student_video_progress p JOIN videos v ON p.video_id = v.id WHERE p.student_id = ? AND v.subject = ?";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(vSql)) {
            ps.setString(1, studentId); ps.setString(2, subject);
            ResultSet rs = ps.executeQuery();
            boolean first = true;
            while(rs.next()) {
                if(!first) json.append(",");
                json.append("{\"title\":\"").append(escape(rs.getString("title"))).append("\",")
                    .append("\"progress\":").append(rs.getInt("watched_percentage")).append("}");
                first = false;
            }
        } catch (Exception e) {}
        json.append("],");

        // 3. Documents
        json.append("\"documents\":[");
        String dSql = "SELECT d.title, p.watched_percentage FROM student_document_progress p JOIN documents d ON p.document_id = d.id WHERE p.student_id = ? AND d.subject = ?";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(dSql)) {
            ps.setString(1, studentId); ps.setString(2, subject);
            ResultSet rs = ps.executeQuery();
            boolean first = true;
            while(rs.next()) {
                if(!first) json.append(",");
                json.append("{\"title\":\"").append(escape(rs.getString("title"))).append("\",")
                    .append("\"progress\":").append(rs.getInt("watched_percentage")).append("}");
                first = false;
            }
        } catch (Exception e) {}
        json.append("]");

        return json.append("}").toString();
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", "");
    }
}