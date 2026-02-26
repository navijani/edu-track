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
}