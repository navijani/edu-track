package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.VideoContent;
import com.edutrack.models.VideoQuestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class VideoDAO {

    public boolean saveVideoAndQuestions(VideoContent video) {
        String videoSql = "INSERT INTO videos (teacher_id, subject, title, video_url) VALUES (?, ?, ?, ?)";
        String questionSql = "INSERT INTO video_questions (video_id, question, answer) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConnection()) {
            // 1. Save the Video and ask MySQL to return the new auto-generated ID
            PreparedStatement videoStmt = conn.prepareStatement(videoSql, Statement.RETURN_GENERATED_KEYS);
            videoStmt.setString(1, video.getTeacherId());
            videoStmt.setString(2, video.getSubject());
            videoStmt.setString(3, video.getTitle());
            videoStmt.setString(4, video.getVideoUrl());
            videoStmt.executeUpdate();

            // 2. Retrieve that new ID
            ResultSet rs = videoStmt.getGeneratedKeys();
            int newVideoId = -1;
            if (rs.next()) {
                newVideoId = rs.getInt(1);
            }

            // 3. Save all the associated questions using that newVideoId
            if (newVideoId != -1 && video.getQuestions() != null) {
                PreparedStatement questionStmt = conn.prepareStatement(questionSql);
                for (VideoQuestion q : video.getQuestions()) {
                    questionStmt.setInt(1, newVideoId);
                    questionStmt.setString(2, q.getQuestion());
                    questionStmt.setString(3, q.getAnswer());
                    questionStmt.executeUpdate();
                }
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    
    // Abstraction: Fetching videos AND their associated questions
    public String getVideosByTeacherJson(String teacherId) {
        StringBuilder json = new StringBuilder("[");
        String videoSql = "SELECT id, title, subject, video_url FROM videos WHERE teacher_id = ? ORDER BY id DESC";
        String questionSql = "SELECT question, answer FROM video_questions WHERE video_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmtVideo = conn.prepareStatement(videoSql);
             PreparedStatement pstmtQuestion = conn.prepareStatement(questionSql)) {
            
            pstmtVideo.setString(1, teacherId);
            ResultSet rsVideo = pstmtVideo.executeQuery();
            
            boolean firstVideo = true;
            while (rsVideo.next()) {
                if (!firstVideo) json.append(",");
                int videoId = rsVideo.getInt("id");

                // Start Video Object
                json.append("{")
                    .append("\"id\":").append(videoId).append(",")
                    .append("\"title\":\"").append(escapeJson(rsVideo.getString("title"))).append("\",")
                    .append("\"subject\":\"").append(escapeJson(rsVideo.getString("subject"))).append("\",")
                    .append("\"videoUrl\":\"").append(escapeJson(rsVideo.getString("video_url"))).append("\",")
                    .append("\"questions\":["); // Start Questions Array

                // Fetch questions for THIS specific video
                pstmtQuestion.setInt(1, videoId);
                ResultSet rsQuestion = pstmtQuestion.executeQuery();
                boolean firstQuestion = true;
                while (rsQuestion.next()) {
                    if (!firstQuestion) json.append(",");
                    json.append("{")
                        .append("\"question\":\"").append(escapeJson(rsQuestion.getString("question"))).append("\",")
                        .append("\"answer\":\"").append(escapeJson(rsQuestion.getString("answer"))).append("\"")
                        .append("}");
                    firstQuestion = false;
                }
                
                json.append("]"); // Close Questions Array
                json.append("}"); // Close Video Object
                firstVideo = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }


    
    public String getVideosBySubjectJson(String subject) {
        StringBuilder json = new StringBuilder("[");
        // Look closely: WHERE subject = ? instead of teacher_id = ?
        String videoSql = "SELECT id, title, subject, video_url FROM videos WHERE subject = ? ORDER BY id DESC";
        String questionSql = "SELECT question, answer FROM video_questions WHERE video_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmtVideo = conn.prepareStatement(videoSql);
             PreparedStatement pstmtQuestion = conn.prepareStatement(questionSql)) {
            
            pstmtVideo.setString(1, subject);
            ResultSet rsVideo = pstmtVideo.executeQuery();
            
            boolean firstVideo = true;
            while (rsVideo.next()) {
                if (!firstVideo) json.append(",");
                int videoId = rsVideo.getInt("id");

                json.append("{")
                    .append("\"id\":").append(videoId).append(",")
                    .append("\"title\":\"").append(escapeJson(rsVideo.getString("title"))).append("\",")
                    .append("\"subject\":\"").append(escapeJson(rsVideo.getString("subject"))).append("\",")
                    .append("\"videoUrl\":\"").append(escapeJson(rsVideo.getString("video_url"))).append("\",")
                    .append("\"questions\":["); 

                pstmtQuestion.setInt(1, videoId);
                ResultSet rsQuestion = pstmtQuestion.executeQuery();
                boolean firstQuestion = true;
                while (rsQuestion.next()) {
                    if (!firstQuestion) json.append(",");
                    json.append("{")
                        .append("\"question\":\"").append(escapeJson(rsQuestion.getString("question"))).append("\",")
                        .append("\"answer\":\"").append(escapeJson(rsQuestion.getString("answer"))).append("\"")
                        .append("}");
                    firstQuestion = false;
                }
                
                json.append("]"); 
                json.append("}"); 
                firstVideo = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    public boolean deleteVideo(String id) {
        String sql = "DELETE FROM videos WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper method to ensure safe JSON formatting in Vanilla Java
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}