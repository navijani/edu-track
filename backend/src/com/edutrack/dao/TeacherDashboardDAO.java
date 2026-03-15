package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;

public class TeacherDashboardDAO {

    public String getDashboardStats(String subject) {
        int students = 0, videos = 0, docs = 0, quizzes = 0;
        StringBuilder upcoming = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection()) {
            // 1. Total Students
            try (Statement st = conn.createStatement(); 
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM users WHERE role='student'")) {
                if (rs.next()) students = rs.getInt(1);
            }

            // 2. Count Videos for Subject
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM videos WHERE subject=?")) {
                ps.setString(1, subject);
                try (ResultSet rs = ps.executeQuery()) { if (rs.next()) videos = rs.getInt(1); }
            }

            // 3. Count Documents for Subject
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM documents WHERE subject=?")) {
                ps.setString(1, subject);
                try (ResultSet rs = ps.executeQuery()) { if (rs.next()) docs = rs.getInt(1); }
            }

            // 4. Count Quizzes for Subject
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM quizzes WHERE subject=?")) {
                ps.setString(1, subject);
                try (ResultSet rs = ps.executeQuery()) { if (rs.next()) quizzes = rs.getInt(1); }
            }

            // 5. Next 3 Upcoming Zoom Meetings
            String zSql = "SELECT topic, meeting_date, meeting_time FROM zoom_meetings WHERE subject=? AND expires_at > NOW() ORDER BY meeting_date ASC LIMIT 3";
            try (PreparedStatement ps = conn.prepareStatement(zSql)) {
                ps.setString(1, subject);
                ResultSet rs = ps.executeQuery();
                boolean first = true;
                while (rs.next()) {
                    if (!first) upcoming.append(",");
                    upcoming.append("{")
                            .append("\"topic\":\"").append(escape(rs.getString("topic"))).append("\",")
                            .append("\"date\":\"").append(rs.getString("meeting_date")).append("\",")
                            .append("\"time\":\"").append(rs.getString("meeting_time")).append("\"")
                            .append("}");
                    first = false;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        upcoming.append("]");

        return "{" +
            "\"totalStudents\":" + students + "," +
            "\"totalVideos\":" + videos + "," +
            "\"totalDocs\":" + docs + "," +
            "\"totalQuizzes\":" + quizzes + "," +
            "\"upcomingMeetings\":" + upcoming.toString() +
        "}";
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("\"", "\\\"").replace("\n", "");
    }
}