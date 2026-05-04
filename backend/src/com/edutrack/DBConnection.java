package com.edutrack;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * SINGLETON PATTERN — DBConnection
 *
 * Ensures only ONE database connection is shared across the entire application.
 *
 * BEFORE (the problem):
 *   Every DAO method called DBConnection.getConnection() which opened a brand
 *   new TCP connection to MySQL. Under load, this exhausts the MySQL connection
 *   limit and slows down the server significantly.
 *
 * AFTER (the fix):
 *   A single Connection is created the first time it is requested, then reused
 *   for all subsequent calls. If the connection becomes stale or closed, it is
 *   automatically re-established (self-healing Singleton).
 *
 * Config is read from AppConfig (also a Singleton) — no more hardcoded strings.
 */
public class DBConnection {

    // The single shared connection — volatile ensures visibility across threads
    private static volatile Connection connection = null;

    // Private constructor prevents `new DBConnection()` from anywhere
    private DBConnection() {}

    /**
     * Returns the single shared database connection.
     * Creates it on first call; reuses it on all subsequent calls.
     * Self-heals if the connection was closed externally.
     *
     * @return the active Connection
     * @throws Exception if the DB is unreachable
     */
    public static Connection getConnection() throws Exception {
        // Double-checked locking — fast path avoids synchronization after first init
        if (connection == null || connection.isClosed()) {
            synchronized (DBConnection.class) {
                if (connection == null || connection.isClosed()) {
                    // Read credentials from AppConfig Singleton
                    AppConfig config = AppConfig.getInstance();

                    Class.forName("com.mysql.cj.jdbc.Driver");
                    try {
                        connection = DriverManager.getConnection(
                            config.getDbUrl(),
                            config.getDbUser(),
                            config.getDbPassword()
                        );
                        System.out.println("[DBConnection] Singleton DB connection established.");
                    } catch (Exception e) {
                        System.out.println("[ERROR] DATABASE CONNECTION FAILED: " + e.getMessage());
                        throw e;
                    }
                }
            }
        }
        return connection;
    }
}