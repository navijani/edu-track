package com.edutrack;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import org.mindrot.jbcrypt.BCrypt;

public class InitAdminDB {
    public static void main(String[] args) {
        try {
            Connection conn = DBConnection.getConnection();
            Statement stmt = conn.createStatement();
            
            // 1. Create table
            String createTableSql = "CREATE TABLE IF NOT EXISTS admins (" +
                    "id INT PRIMARY KEY AUTO_INCREMENT, " +
                    "email VARCHAR(255) UNIQUE NOT NULL, " +
                    "password_hash VARCHAR(255) NOT NULL, " +
                    "role ENUM('MAIN_ADMIN','ADMIN') NOT NULL, " +
                    "is_deleted BOOLEAN DEFAULT FALSE, " +
                    "created_by VARCHAR(255), " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                    ")";
            stmt.execute(createTableSql);
            System.out.println("Table 'admins' checked/created.");

            // 2. Seed main admin if not exists
            String email = "2004@gmail.com";
            String rawPassword = "123";
            String hashedPassword = BCrypt.hashpw(rawPassword, BCrypt.gensalt());
            
            String insertSql = "INSERT IGNORE INTO admins (email, password_hash, role, created_by) VALUES (?, ?, 'MAIN_ADMIN', 'SYSTEM')";
            PreparedStatement pstmt = conn.prepareStatement(insertSql);
            pstmt.setString(1, email);
            pstmt.setString(2, hashedPassword);
            int rows = pstmt.executeUpdate();
            
            if (rows > 0) {
                System.out.println("Seeded MAIN_ADMIN: " + email);
            } else {
                System.out.println("MAIN_ADMIN already exists: " + email);
            }
            
            pstmt.close();
            stmt.close();
            // Do not close conn as it is a Singleton managed by DBConnection, but since it's a script we can exit.
            System.exit(0);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
