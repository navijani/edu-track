package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class StudentDashboardDAO {

    // Helper class to calculate true fractions for the graph
    class Stats {
        int quizEarned = 0; int quizTotal = 0;
        int videoCount = 0; int videoWatchSum = 0;
        int docCount = 0; int docCompleted = 0;
    }

    public String getDashboardDataJson(String studentId) {
        int totalSubjects = 0;
        int avgQuizScore = 0;
        StringBuilder recentJson = new StringBuilder("[");
        StringBuilder graphJson = new StringBuilder("[");

        try (Connection conn = DBConnection.getConnection()) {
            
            // 1. STATS: Total Subjects & Avg Quiz Score
            String statsSql = "SELECT COUNT(DISTINCT q.subject) as subCount, AVG(IFNULL(s.score,0)) as avgScore " +
                              "FROM student_quiz_submissions s " +
                              "JOIN quizzes q ON s.quiz_id = q.id " +
                              "WHERE s.student_id = ?";
            try(PreparedStatement ps = conn.prepareStatement(statsSql)) {
                ps.setString(1, studentId);
                ResultSet rs = ps.executeQuery();
                if(rs.next()) {
                    totalSubjects = rs.getInt("subCount");
                    avgQuizScore = (int) Math.round(rs.getDouble("avgScore"));
                }
            } catch (Exception e) {}

            // 2. RECENT CONTENT: Pulls the absolute newest uploads across ALL subjects!
            String recentSql = "SELECT * FROM (" +
                               "SELECT 'Quiz' as type, title, subject, id FROM quizzes " +
                               "UNION SELECT 'Video' as type, title, subject, id FROM videos " +
                               "UNION SELECT 'Document' as type, title, subject, id FROM documents" +
                               ") AS combined ORDER BY id DESC LIMIT 5"; 
            try(Statement st = conn.createStatement()) {
                ResultSet rs = st.executeQuery(recentSql);
                boolean first = true;
                while(rs.next()) {
                    if(!first) recentJson.append(",");
                    recentJson.append("{\"type\":\"").append(rs.getString("type")).append("\",")
                              .append("\"title\":\"").append(escapeJson(rs.getString("title"))).append("\",")
                              .append("\"subject\":\"").append(escapeJson(rs.getString("subject"))).append("\"}");
                    first = false;
                }
            } catch (Exception e) {}
            recentJson.append("]");

            // 3. GRAPH DATA: Real Progress across all Subjects
            Map<String, Stats> map = new HashMap<>();
            
            String allSubjectsSql = "SELECT title FROM subjects"; 
            try(PreparedStatement ps = conn.prepareStatement(allSubjectsSql)) {
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString(1);
                    if (sub != null && !sub.trim().isEmpty()) map.putIfAbsent(sub, new Stats());
                }
            } catch (Exception e) {}

            // Quizzes
            String qSql = "SELECT q.subject, IFNULL(q.total_marks, 0) as total_marks, s.score FROM quizzes q LEFT JOIN student_quiz_submissions s ON q.id = s.quiz_id AND s.student_id = ?";
            try(PreparedStatement ps = conn.prepareStatement(qSql)) {
                ps.setString(1, studentId);
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString("subject");
                    if (sub == null) continue;
                    map.putIfAbsent(sub, new Stats()); 
                    map.get(sub).quizTotal += rs.getInt("total_marks"); 
                    if (rs.getObject("score") != null) map.get(sub).quizEarned += rs.getInt("score");
                }
            }

            // Videos
            String vSql = "SELECT v.subject, p.watched_percentage FROM videos v LEFT JOIN student_video_progress p ON v.id = p.video_id AND p.student_id = ?";
            try(PreparedStatement ps = conn.prepareStatement(vSql)) {
                ps.setString(1, studentId);
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString("subject");
                    if (sub == null) continue;
                    map.putIfAbsent(sub, new Stats());
                    map.get(sub).videoCount++;
                    if (rs.getObject("watched_percentage") != null) map.get(sub).videoWatchSum += rs.getInt("watched_percentage");
                }
            }

            // Docs
            String dSql = "SELECT d.subject, p.watched_percentage FROM documents d LEFT JOIN student_document_progress p ON d.id = p.document_id AND p.student_id = ?";
            try(PreparedStatement ps = conn.prepareStatement(dSql)) {
                ps.setString(1, studentId);
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString("subject");
                    if (sub == null) continue;
                    map.putIfAbsent(sub, new Stats());
                    map.get(sub).docCount++;
                    if (rs.getObject("watched_percentage") != null && rs.getInt("watched_percentage") == 100) map.get(sub).docCompleted++;
                }
            }

            boolean first = true;
            for (Map.Entry<String, Stats> entry : map.entrySet()) {
                if(!first) graphJson.append(",");
                Stats s = entry.getValue();
                int vidAvg = s.videoCount == 0 ? 0 : s.videoWatchSum / s.videoCount;
                int docPct = s.docCount == 0 ? 0 : (int)(((double)s.docCompleted / s.docCount) * 100);
                int quizPct = s.quizTotal == 0 ? 0 : (int)(((double)s.quizEarned / s.quizTotal) * 100);

                graphJson.append("{")
                    .append("\"subject\":\"").append(escapeJson(entry.getKey())).append("\",")
                    .append("\"quiz\":").append(quizPct).append(",")
                    .append("\"video\":").append(vidAvg).append(",")
                    .append("\"doc\":").append(docPct)
                    .append("}");
                first = false;
            }
            graphJson.append("]");

        } catch (Exception e) { 
            e.printStackTrace(); 
            if (recentJson.length() == 1) recentJson.append("]"); 
            if (graphJson.length() == 1) graphJson.append("]");
        }

        return "{" +
            "\"totalSubjects\":" + totalSubjects + "," +
            "\"avgQuizScore\":" + avgQuizScore + "," +
            "\"recentContent\":" + recentJson.toString() + "," +
            "\"growthData\":" + graphJson.toString() +
            "}";
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}