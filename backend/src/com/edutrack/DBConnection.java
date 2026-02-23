package com.edutrack;
import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {
    public static Connection getConnection() throws Exception {
        // Updated for your specific phpMyAdmin port
        String url = "jdbc:mysql://localhost:3308/studentdb"; 
        return DriverManager.getConnection(url, "root", "");
    }
}