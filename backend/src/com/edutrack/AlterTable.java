package com.edutrack;
import java.sql.Connection;
import java.sql.Statement;

public class AlterTable {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
             
             try {
                 stmt.execute("ALTER TABLE quizzes ADD COLUMN target_class VARCHAR(50)");
                 System.out.println("Added target_class column to quizzes.");
             } catch (Exception e) {
                 System.out.println("target_class might already exist: " + e.getMessage());
             }
             
             try {
                 stmt.execute("ALTER TABLE quizzes ADD COLUMN deadline VARCHAR(50)");
                 System.out.println("Added deadline column to quizzes.");
             } catch (Exception e) {
                 System.out.println("deadline might already exist: " + e.getMessage());
             }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
