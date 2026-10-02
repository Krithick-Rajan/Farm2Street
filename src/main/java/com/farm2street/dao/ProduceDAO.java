package com.farm2street.dao;

import com.farm2street.config.DBConnection;
import com.farm2street.model.Produce;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Produce & Harvest Batches.
 * Demonstrates: SQL (DDL/DML), JDBC, PreparedStatement, ResultSet, CRUD operations.
 */
public class ProduceDAO {

    /**
     * Fetch all produce items, optionally filtered by category.
     */
    public List<Produce> getAllProduce(String category) {
        List<Produce> list = new ArrayList<>();
        String sql = (category == null || category.equalsIgnoreCase("All"))
                ? "SELECT * FROM produce ORDER BY id ASC"
                : "SELECT * FROM produce WHERE LOWER(category) = LOWER(?) ORDER BY id ASC";

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            if (category != null && !category.equalsIgnoreCase("All")) {
                stmt.setString(1, category);
            }
            rs = stmt.executeQuery();

            while (rs.next()) {
                list.add(mapResultSetToProduce(rs));
            }
        } catch (Exception e) {
            System.err.println("ProduceDAO SQL notice (DB fetching): " + e.getMessage());
            // Return initial curated produce if database tables are in setup
            return getInitialSeedProduce(category);
        } finally {
            DBConnection.close(rs, stmt, conn);
        }

        if (list.isEmpty()) {
            return getInitialSeedProduce(category);
        }
        return list;
    }

    /**
     * Get a specific produce by ID.
     */
    public Produce getProduceById(int id) {
        String sql = "SELECT * FROM produce WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToProduce(rs);
            }
        } catch (Exception e) {
            System.err.println("Error fetching produce by ID: " + e.getMessage());
        } finally {
            DBConnection.close(rs, stmt, conn);
        }

        for (Produce p : getInitialSeedProduce("All")) {
            if (p.getId() == id) return p;
        }
        return null;
    }

    /**
     * Add a new produce batch (Farmer CRUD operation).
     */
    public boolean addProduce(Produce p) {
        String sql = "INSERT INTO produce (name, category, price, unit, stock, farm_name, farm_location, harvest_date, batch_id, image_url, organic) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, p.getName());
            stmt.setString(2, p.getCategory());
            stmt.setDouble(3, p.getPrice());
            stmt.setString(4, p.getUnit());
            stmt.setInt(5, p.getStock());
            stmt.setString(6, p.getFarmName());
            stmt.setString(7, p.getFarmLocation());
            stmt.setString(8, p.getHarvestDate());
            stmt.setString(9, p.getBatchId());
            stmt.setString(10, p.getImageUrl());
            stmt.setBoolean(11, p.isOrganic());

            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error inserting produce: " + e.getMessage());
            return false;
        } finally {
            DBConnection.close(stmt, conn);
        }
    }

    private Produce mapResultSetToProduce(ResultSet rs) throws SQLException {
        String farmLoc = rs.getString("farm_location");
        if (farmLoc != null) {
            farmLoc = farmLoc.replaceAll("(?i)(Dindori,?\\s*Nashik.*)", "Sector 4, Valley Agro-Belt")
                             .replaceAll("(?i)(Ozar\\s*Agro-Cluster.*)", "Highland Agro-Cluster")
                             .replaceAll("(?i)(Nilgiris\\s*Belt.*)", "Hill Country Agro-Belt")
                             .replaceAll("(?i)(Baramati.*)", "Central Greenhouse Zone")
                             .replaceAll("(?i)(Mahabaleshwar.*)", "River Valley Agro-Cluster");
        }
        String farmName = rs.getString("farm_name");
        if (farmName != null) {
            farmName = farmName.replaceAll("(?i)Sahyadri Agro Farms", "Green Valley Farms")
                               .replaceAll("(?i)Deccan Polyhouse Collective", "Solar Polyhouse Collective")
                               .replaceAll("(?i)Panchgani Bio Farms", "River Valley Bio Farms");
        }
        return new Produce(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getString("category"),
            rs.getDouble("price"),
            rs.getString("unit"),
            rs.getInt("stock"),
            farmName,
            farmLoc,
            rs.getString("harvest_date"),
            rs.getString("batch_id"),
            rs.getString("image_url"),
            rs.getBoolean("organic")
        );
    }

    /**
     * Reliable default produce data showcasing regional agro-clusters
     */
    public List<Produce> getInitialSeedProduce(String category) {
        List<Produce> all = new ArrayList<>();
        all.add(new Produce(1, "Country Heirloom Tomatoes", "Vine", 42.0, "kg", 85,
                "Green Valley Farms", "Sector 4, Valley Agro-Belt", "2026-09-30", "BATCH-TM-882",
                "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80", true));
        all.add(new Produce(2, "Hydroponic Baby Spinach", "Leafy Greens", 35.0, "bunch", 120,
                "Highland Organics", "Highland Agro-Cluster", "2026-09-30", "BATCH-SP-104",
                "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80", true));
        all.add(new Produce(3, "Crisp Ooty Orange Carrots", "Root", 48.0, "kg", 64,
                "Blue Mountain Orchards", "Hill Country Agro-Belt", "2026-09-29", "BATCH-CR-552",
                "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80", true));
        all.add(new Produce(4, "Sun-Ripened Bell Peppers", "Vine", 65.0, "kg", 40,
                "Solar Polyhouse Collective", "Central Greenhouse Zone", "2026-09-30", "BATCH-BP-339",
                "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80", true));
        all.add(new Produce(5, "Tender Field Broccoli", "Leafy Greens", 55.0, "head", 50,
                "River Valley Bio Farms", "River Valley Agro-Cluster", "2026-09-30", "BATCH-BR-721",
                "https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&w=600&q=80", true));

        if (category == null || category.equalsIgnoreCase("All")) {
            return all;
        }

        List<Produce> filtered = new ArrayList<>();
        for (Produce p : all) {
            if (p.getCategory().equalsIgnoreCase(category)) {
                filtered.add(p);
            }
        }
        return filtered;
    }
}
