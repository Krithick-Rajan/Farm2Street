package com.farm2street.config;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Database Connectivity Manager for Supabase Cloud PostgreSQL via JDBC.
 * Satisfies Web Technology Syllabus: Topic 9 (JDBC), Topic 10 (SQL), Topic 12 (Database).
 */
public class DBConnection {

    private static final Properties props = new Properties();

    static {
        try {
            // Load database.properties from classpath
            InputStream is = DBConnection.class.getClassLoader().getResourceAsStream("database.properties");
            if (is != null) {
                props.load(is);
            }
            // Register PostgreSQL JDBC Driver
            Class.forName(props.getProperty("db.driver", "org.postgresql.Driver"));
        } catch (Exception e) {
            System.err.println("Notice: Initializing PostgreSQL JDBC Driver: " + e.getMessage());
        }
    }

    /**
     * Get a live connection to the Supabase PostgreSQL database.
     * @return Connection object
     * @throws SQLException on connection failure
     */
    public static Connection getConnection() throws SQLException {
        String url = System.getenv("SUPABASE_DB_URL");
        String user = System.getenv("SUPABASE_DB_USER");
        String pass = System.getenv("SUPABASE_DB_PASS");

        if (url == null || url.trim().isEmpty()) {
            url = props.getProperty("db.url");
            user = props.getProperty("db.username");
            pass = props.getProperty("db.password");
        }

        try {
            return DriverManager.getConnection(url, user, pass);
        } catch (SQLException e) {
            // Fallback for local development if cloud credentials are being configured
            System.err.println("Primary DB connection notice: " + e.getMessage());
            String fallbackUrl = props.getProperty("db.fallback.url", "jdbc:postgresql://localhost:5432/postgres");
            String fallbackUser = props.getProperty("db.fallback.username", "postgres");
            String fallbackPass = props.getProperty("db.fallback.password", "postgres");
            return DriverManager.getConnection(fallbackUrl, fallbackUser, fallbackPass);
        }
    }

    /**
     * Helper to safely close JDBC resources
     */
    public static void close(AutoCloseable... resources) {
        for (AutoCloseable res : resources) {
            if (res != null) {
                try {
                    res.close();
                } catch (Exception ignored) {
                }
            }
        }
    }
}
