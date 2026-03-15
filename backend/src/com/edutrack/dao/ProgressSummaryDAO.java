package com.edutrack.dao;

import com.edutrack.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class ProgressSummaryDAO {

    class Stats {
        int quizEarned = 0; int quizTotal = 0;
        int videoCount = 0; int videoWatchSum = 0;
        int docCount = 0; int docCompleted = 0;
    }

    public String getSummaryJson(String studentId) {
        Map<String, Stats> map = new HashMap<>();

        try (Connection conn = DBConnection.getConnection()) {
            
            // 1. Fetch EVERY SUBJECT from Master Table first
            String allSubjectsSql = "SELECT title FROM subjects"; 
            try(PreparedStatement ps = conn.prepareStatement(allSubjectsSql)) {
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString("name");
                    if (sub != null && !sub.trim().isEmpty()) {
                        map.putIfAbsent(sub, new Stats());
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ WARNING: Could not read from 'subjects' table.");
            }

            // 2. Quizzes: LEFT JOIN with student_id in the ON clause is CRITICAL
            String qSql = "SELECT q.subject, IFNULL(q.total_marks, 0) as total_marks, s.score FROM quizzes q " +
                          "LEFT JOIN student_quiz_submissions s ON q.id = s.quiz_id AND s.student_id = ?";
            try(PreparedStatement ps = conn.prepareStatement(qSql)) {
                ps.setString(1, studentId);
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString("subject");
                    if (sub == null) continue;
                    map.putIfAbsent(sub, new Stats()); 
                    
                    // FIX: Use total_marks instead of marks
                    map.get(sub).quizTotal += rs.getInt("total_marks"); 
                    
                    if (rs.getObject("score") != null) {
                        map.get(sub).quizEarned += rs.getInt("score");
                    }
                }
            }
            // 3. Videos: Calculate average watch time across ALL existing videos
            String vSql = "SELECT v.subject, p.watched_percentage " +
                          "FROM videos v " +
                          "LEFT JOIN student_video_progress p ON v.id = p.video_id AND p.student_id = ?";
            try(PreparedStatement ps = conn.prepareStatement(vSql)) {
                ps.setString(1, studentId);
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString("subject");
                    if (sub == null) continue;
                    map.putIfAbsent(sub, new Stats());
                    
                    map.get(sub).videoCount++;
                    if (rs.getObject("watched_percentage") != null) {
                        map.get(sub).videoWatchSum += rs.getInt("watched_percentage");
                    }
                }
            }

            // 4. Documents: Fraction of total documents opened (100%)
            String dSql = "SELECT d.subject, p.watched_percentage " +
                          "FROM documents d " +
                          "LEFT JOIN student_document_progress p ON d.id = p.document_id AND p.student_id = ?";
            try(PreparedStatement ps = conn.prepareStatement(dSql)) {
                ps.setString(1, studentId);
                ResultSet rs = ps.executeQuery();
                while(rs.next()) {
                    String sub = rs.getString("subject");
                    if (sub == null) continue;
                    map.putIfAbsent(sub, new Stats());
                    
                    map.get(sub).docCount++;
                    if (rs.getObject("watched_percentage") != null && rs.getInt("watched_percentage") == 100) {
                        map.get(sub).docCompleted++;
                    }
                }
            }
        } catch(Exception e) { 
            e.printStackTrace(); 
        }

        // Build the final JSON Array
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        for (Map.Entry<String, Stats> entry : map.entrySet()) {
            if(!first) json.append(",");
            Stats s = entry.getValue();
            
            // Percentage Math
            int vidAvg = s.videoCount == 0 ? 0 : s.videoWatchSum / s.videoCount;
            int docPct = s.docCount == 0 ? 0 : (int)(((double)s.docCompleted / s.docCount) * 100);
            int quizPct = s.quizTotal == 0 ? 0 : (int)(((double)s.quizEarned / s.quizTotal) * 100);

            json.append("{")
                .append("\"subject\":\"").append(escapeJson(entry.getKey())).append("\",")
                .append("\"quizPercentage\":").append(quizPct).append(",")
                .append("\"quizEarned\":").append(s.quizEarned).append(",")
                .append("\"quizTotal\":").append(s.quizTotal).append(",")
                .append("\"videoAvg\":").append(vidAvg).append(",")
                .append("\"videoCount\":").append(s.videoCount).append(",")
                .append("\"docPercentage\":").append(docPct).append(",")
                .append("\"docCompleted\":").append(s.docCompleted).append(",")
                .append("\"docCount\":").append(s.docCount)
                .append("}");
            first = false;
        }
        json.append("]");
        return json.toString();
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}