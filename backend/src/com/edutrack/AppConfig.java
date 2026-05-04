package com.edutrack;

/**
 * SINGLETON PATTERN — AppConfig
 *
 * Centralizes all application configuration values in one place.
 * Only ONE instance of this class will ever exist (guaranteed by the
 * private constructor + static getInstance() method).
 *
 * This prevents scattering config values (like DB credentials) across
 * multiple files. Change the DB URL here and it updates everywhere.
 */
public class AppConfig {

    // --- The single, static instance (created once when the class is loaded) ---
    private static AppConfig instance;

    // --- Database Configuration ---
    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;

    // --- Server Configuration ---
    private final int serverPort;

    /**
     * Private constructor — no other class can call `new AppConfig()`.
     * All configuration values are defined here.
     */
    private AppConfig() {
        this.dbUrl      = "jdbc:mysql://localhost:3306/studentdb";
        this.dbUser     = "root";
        this.dbPassword = "";
        this.serverPort = 8080;
    }

    /**
     * The single global access point to the config.
     * Thread-safe via `synchronized` — safe even if two requests arrive simultaneously.
     *
     * @return the one-and-only AppConfig instance
     */
    public static synchronized AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig();
            System.out.println("[AppConfig] Singleton instance created.");
        }
        return instance;
    }

    // --- Getters ---
    public String getDbUrl()      { return dbUrl; }
    public String getDbUser()     { return dbUser; }
    public String getDbPassword() { return dbPassword; }
    public int    getServerPort() { return serverPort; }
}
