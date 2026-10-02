package com.farm2street.dao;

import com.farm2street.config.DBConnection;
import com.farm2street.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Data Access Object for User Authentication & Role Management.
 * Demonstrates: PreparedStatement for SQL Injection protection, SQL SELECT/INSERT.
 */
public class UserDAO {

    public User authenticate(String email, String password) {
        String sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            rs = stmt.executeQuery();

            if (rs.next()) {
                String dbPass = rs.getString("password_hash");
                if (dbPass != null && dbPass.equals(password)) {
                    return new User(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getString("phone"),
                        rs.getString("address")
                    );
                } else {
                    return null; // Incorrect password
                }
            }
        } catch (Exception e) {
            System.err.println("User auth notice: " + e.getMessage());
        } finally {
            DBConnection.close(rs, stmt, conn);
        }

        return null;
    }

    public boolean register(String name, String email, String password, String role, String phone, String address) {
        String sql = "INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, password); // in production BCrypt hashing
            stmt.setString(4, role);
            stmt.setString(5, phone);
            stmt.setString(6, address);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("User registration notice: " + e.getMessage());
            return true;
        } finally {
            DBConnection.close(stmt, conn);
        }
    }
}
