package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;

public class ParentDAO {
    public String getDashboardData(String parentId) {
        StringBuilder json = new StringBuilder();
        String childId = null;
        String childName = "";

        try (Connection conn = DBConnection.getConnection()) {
            // 1. Find the assigned child_id
            String pSql = "SELECT child_id FROM users WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(pSql)) {
                ps.setString(1, parentId);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) childId = rs.getString("child_id");
            }

            if (childId == null || childId.trim().isEmpty() || childId.equals("None")) {
                return "{\"error\":\"No child assigned to this account. Please contact admin.\"}";
            }

            // 2. Get Child's Name
            String cSql = "SELECT name FROM users WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(cSql)) {
                ps.setString(1, childId);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) childName = escape(rs.getString("name"));
            }

            json.append("{")
                .append("\"childId\":\"").append(childId).append("\",")
                .append("\"childName\":\"").append(childName).append("\",");

            // 3. Quizzes (All Subjects)
            json.append("\"quizzes\":[");
            String qSql = "SELECT q.title, q.subject, s.score, q.total_marks FROM student_quiz_submissions s JOIN quizzes q ON s.quiz_id = q.id WHERE s.student_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(qSql)) {
                ps.setString(1, childId);
                ResultSet rs = ps.executeQuery();
                boolean first = true;
                while(rs.next()) {
                    if(!first) json.append(",");
                    json.append("{\"title\":\"").append(escape(rs.getString("title"))).append("\",")
                        .append("\"subject\":\"").append(escape(rs.getString("subject"))).append("\",")
                        .append("\"score\":").append(rs.getInt("score")).append(",")
                        .append("\"total\":").append(rs.getInt("total_marks")).append("}");
                    first = false;
                }
            }
            json.append("],");

            // 4. Videos (All Subjects)
            json.append("\"videos\":[");
            String vSql = "SELECT v.title, v.subject, p.watched_percentage FROM student_video_progress p JOIN videos v ON p.video_id = v.id WHERE p.student_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(vSql)) {
                ps.setString(1, childId);
                ResultSet rs = ps.executeQuery();
                boolean first = true;
                while(rs.next()) {
                    if(!first) json.append(",");
                    json.append("{\"title\":\"").append(escape(rs.getString("title"))).append("\",")
                        .append("\"subject\":\"").append(escape(rs.getString("subject"))).append("\",")
                        .append("\"progress\":").append(rs.getInt("watched_percentage")).append("}");
                    first = false;
                }
            }
            json.append("],");

            // 5. Documents (All Subjects)
            json.append("\"documents\":[");
            String dSql = "SELECT d.title, d.subject, p.watched_percentage FROM student_document_progress p JOIN documents d ON p.document_id = d.id WHERE p.student_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(dSql)) {
                ps.setString(1, childId);
                ResultSet rs = ps.executeQuery();
                boolean first = true;
                while(rs.next()) {
                    if(!first) json.append(",");
                    json.append("{\"title\":\"").append(escape(rs.getString("title"))).append("\",")
                        .append("\"subject\":\"").append(escape(rs.getString("subject"))).append("\",")
                        .append("\"progress\":").append(rs.getInt("watched_percentage")).append("}");
                    first = false;
                }
            }
            json.append("]");
            json.append("}");

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\":\"Database error occurred.\"}";
        }
        return json.toString();
    }

    public String getTeachersListJson() throws Exception {
    StringBuilder json = new StringBuilder("[");
    String sql = "SELECT id, name, email, subject FROM users WHERE role = 'TEACHER' ORDER BY name ASC";
    
    try (Connection conn = DBConnection.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {
        
        boolean first = true;
        while (rs.next()) {
            if (!first) json.append(",");
            json.append("{")
                .append("\"id\":\"").append(rs.getString("id")).append("\",")
                .append("\"name\":\"").append(escape(rs.getString("name"))).append("\",")
                .append("\"email\":\"").append(escape(rs.getString("email"))).append("\",")
                .append("\"subject\":\"").append(escape(rs.getString("subject"))).append("\"")
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