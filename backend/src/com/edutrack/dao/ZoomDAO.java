package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;

public class ZoomDAO {

    public boolean scheduleMeeting(String topic, String link, String date, String time, String subject, String teacher) throws Exception {
    // Combine date and time to create an 'expires_at' (Setting it to 2 hours after start)
    String expiresAt = date + " " + time; 
    
    String sql = "INSERT INTO zoom_meetings (topic, meeting_link, meeting_date, meeting_time, subject, teacher_name, expires_at) " +
                 "VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL 2 HOUR))";
    try (Connection conn = DBConnection.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setString(1, topic);
        ps.setString(2, link);
        ps.setString(3, date);
        ps.setString(4, time);
        ps.setString(5, subject);
        ps.setString(6, teacher);
        ps.setString(7, expiresAt);
        return ps.executeUpdate() > 0;
    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}

    public String getMeetingsJson(String subject) throws Exception {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT * FROM zoom_meetings WHERE subject = ? AND expires_at > NOW() ORDER BY meeting_date ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, subject);
            ResultSet rs = ps.executeQuery();
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"topic\":\"").append(escape(rs.getString("topic"))).append("\",")
                    .append("\"meetingLink\":\"").append(escape(rs.getString("meeting_link"))).append("\",")
                    .append("\"meetingDate\":\"").append(rs.getString("meeting_date")).append("\",")
                    .append("\"meetingTime\":\"").append(rs.getString("meeting_time")).append("\",")
                    .append("\"teacher\":\"").append(escape(rs.getString("teacher_name"))).append("\"")
                    .append("}");
                first = false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return json.append("]").toString();
    }

    public boolean deleteMeeting(int id) throws Exception {
    String sql = "DELETE FROM zoom_meetings WHERE id = ?";
    try (Connection conn = DBConnection.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, id);
        return ps.executeUpdate() > 0;
    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ");
    }
}