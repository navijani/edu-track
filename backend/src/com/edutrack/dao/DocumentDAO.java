package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.DocumentContent;
import com.edutrack.models.DocumentQuestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class DocumentDAO {

    public boolean saveDocumentAndQuestions(DocumentContent document) {
        String docSql = "INSERT INTO documents (teacher_id, subject, title, document_url, target_class) VALUES (?, ?, ?, ?, ?)";
        String questionSql = "INSERT INTO document_questions (document_id, question, answer) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConnection()) {
            // 1. Save main Document and get the new ID
            PreparedStatement docStmt = conn.prepareStatement(docSql, Statement.RETURN_GENERATED_KEYS);
            docStmt.setString(1, document.getTeacherId());
            docStmt.setString(2, document.getSubject());
            docStmt.setString(3, document.getTitle());
            docStmt.setString(4, document.getDocumentUrl());
            docStmt.setString(5, document.getTargetClass());
            docStmt.executeUpdate();

            ResultSet rs = docStmt.getGeneratedKeys();
            int newDocId = -1;
            if (rs.next()) {
                newDocId = rs.getInt(1);
            }

            // 2. Save Questions linked to the new Document ID
            if (newDocId != -1 && document.getQuestions() != null) {
                PreparedStatement qStmt = conn.prepareStatement(questionSql);
                for (DocumentQuestion q : document.getQuestions()) {
                    qStmt.setInt(1, newDocId);
                    qStmt.setString(2, q.getQuestion());
                    qStmt.setString(3, q.getAnswer());
                    qStmt.executeUpdate();
                }
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Abstraction: Fetching documents AND their associated reading questions
    public String getDocumentsByTeacherJson(String teacherId) {
        StringBuilder json = new StringBuilder("[");
        // ORDER BY id DESC puts the newest documents at the top!
        String docSql = "SELECT id, title, subject, document_url FROM documents WHERE teacher_id = ? ORDER BY id DESC";
        String questionSql = "SELECT question, answer FROM document_questions WHERE document_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmtDoc = conn.prepareStatement(docSql);
             PreparedStatement pstmtQuestion = conn.prepareStatement(questionSql)) {
            
            pstmtDoc.setString(1, teacherId);
            ResultSet rsDoc = pstmtDoc.executeQuery();
            
            boolean firstDoc = true;
            while (rsDoc.next()) {
                if (!firstDoc) json.append(",");
                int docId = rsDoc.getInt("id");

                // Start Document Object
                json.append("{")
                    .append("\"id\":").append(docId).append(",")
                    .append("\"title\":\"").append(escapeJson(rsDoc.getString("title"))).append("\",")
                    .append("\"subject\":\"").append(escapeJson(rsDoc.getString("subject"))).append("\",")
                    .append("\"documentUrl\":\"").append(escapeJson(rsDoc.getString("document_url"))).append("\",")
                    .append("\"questions\":["); // Start Questions Array

                // Fetch questions for THIS specific document
                pstmtQuestion.setInt(1, docId);
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
                json.append("}"); // Close Document Object
                firstDoc = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    // Fetch Documents by Subject and Class for the Student Dashboard 
    public String getDocumentsBySubjectAndClassJson(String subject, String targetClass) {
        StringBuilder json = new StringBuilder("[");
        // We search by subject and target_class
        String docSql = "SELECT id, title, subject, document_url FROM documents WHERE subject = ? AND target_class = ? ORDER BY id DESC";
        String questionSql = "SELECT question, answer FROM document_questions WHERE document_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmtDoc = conn.prepareStatement(docSql);
             PreparedStatement pstmtQuestion = conn.prepareStatement(questionSql)) {
            
            pstmtDoc.setString(1, subject);
            pstmtDoc.setString(2, targetClass);
            ResultSet rsDoc = pstmtDoc.executeQuery();
            
            boolean firstDoc = true;
            while (rsDoc.next()) {
                if (!firstDoc) json.append(",");
                int docId = rsDoc.getInt("id");

                // Start Document Object
                json.append("{")
                    .append("\"id\":").append(docId).append(",")
                    .append("\"title\":\"").append(escapeJson(rsDoc.getString("title"))).append("\",")
                    .append("\"subject\":\"").append(escapeJson(rsDoc.getString("subject"))).append("\",")
                    .append("\"documentUrl\":\"").append(escapeJson(rsDoc.getString("document_url"))).append("\",")
                    .append("\"questions\":["); // Start Questions Array

                // Fetch questions for THIS specific document
                pstmtQuestion.setInt(1, docId);
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
                json.append("}"); // Close Document Object
                firstDoc = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    public boolean deleteDocument(String id) {
        String sql = "DELETE FROM documents WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper method to safely format text for JSON
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}