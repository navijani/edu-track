package com.edutrack;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {
    public static Connection getConnection() throws Exception {
        // 1. Explicitly load the MySQL Driver (Prevents "No suitable driver" errors)
        Class.forName("com.mysql.cj.jdbc.Driver");

        // 2. The Connection URL 
        // IMPORTANT: Verify that 'studentdb' is the exact name of your database in phpMyAdmin!
        // Also verify that your XAMPP MySQL port is actually 3308, not the default 3306.
        String url = "jdbc:mysql://localhost:3308/studentdb"; 
        
        try {
            Connection conn = DriverManager.getConnection(url, "root", "");
            return conn;
        } catch (Exception e) {
            System.out.println("[ERROR] DATABASE CONNECTION FAILED: " + e.getMessage());
            throw e; // Rethrow the error so we can see it
        }
    }
}