package com.farm2street.dao;

import com.farm2street.config.DBConnection;
import com.farm2street.model.CartItem;
import com.farm2street.model.Order;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Orders & Escrow Settlements.
 * Demonstrates: Transaction Management, SQL Foreign Keys, PreparedStatement, JDBC.
 */
public class OrderDAO {

    /**
     * Persist order and child line-items in a single database transaction.
     */
    public boolean saveOrder(Order order) {
        String insertOrderSql = "INSERT INTO orders (order_code, customer_name, customer_phone, delivery_address, total_amount, payment_status, payment_id, order_status) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        String insertItemSql = "INSERT INTO order_items (order_id, produce_id, produce_name, unit_price, quantity, subtotal) " +
                               "VALUES (?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement stmtOrder = null;
        PreparedStatement stmtItem = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Begin SQL transaction

            stmtOrder = conn.prepareStatement(insertOrderSql, Statement.RETURN_GENERATED_KEYS);
            stmtOrder.setString(1, order.getOrderCode());
            stmtOrder.setString(2, order.getCustomerName());
            stmtOrder.setString(3, order.getCustomerPhone());
            stmtOrder.setString(4, order.getDeliveryAddress());
            stmtOrder.setDouble(5, order.getTotalAmount());
            stmtOrder.setString(6, order.getPaymentStatus());
            stmtOrder.setString(7, order.getPaymentId());
            stmtOrder.setString(8, order.getOrderStatus());

            int affected = stmtOrder.executeUpdate();
            if (affected == 0) {
                conn.rollback();
                return false;
            }

            rs = stmtOrder.getGeneratedKeys();
            int generatedOrderId = 0;
            if (rs.next()) {
                generatedOrderId = rs.getInt(1);
                order.setId(generatedOrderId);
            }

            if (order.getItems() != null && !order.getItems().isEmpty()) {
                stmtItem = conn.prepareStatement(insertItemSql);
                for (CartItem item : order.getItems()) {
                    stmtItem.setInt(1, generatedOrderId);
                    stmtItem.setInt(2, item.getProduce().getId());
                    stmtItem.setString(3, item.getProduce().getName());
                    stmtItem.setDouble(4, item.getProduce().getPrice());
                    stmtItem.setInt(5, item.getQuantity());
                    stmtItem.setDouble(6, item.getSubtotal());
                    stmtItem.addBatch();
                }
                stmtItem.executeBatch();
            }

            conn.commit(); // Commit transaction
            return true;
        } catch (Exception e) {
            System.err.println("Order transaction error: " + e.getMessage());
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            return false; // Transaction failed - order was not recorded
        } finally {
            DBConnection.close(rs, stmtOrder, stmtItem, conn);
        }
    }

    /**
     * Retrieve all orders for Admin / Logistics portal.
     */
    public List<Order> getAllOrders() {
        List<Order> list = new ArrayList<>();
        String sql = "SELECT * FROM orders ORDER BY id DESC LIMIT 50";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            while (rs.next()) {
                Order o = new Order();
                o.setId(rs.getInt("id"));
                o.setOrderCode(rs.getString("order_code"));
                o.setCustomerName(rs.getString("customer_name"));
                o.setCustomerPhone(rs.getString("customer_phone"));
                o.setDeliveryAddress(rs.getString("delivery_address"));
                o.setTotalAmount(rs.getDouble("total_amount"));
                o.setPaymentStatus(rs.getString("payment_status"));
                o.setPaymentId(rs.getString("payment_id"));
                o.setOrderStatus(rs.getString("order_status"));
                list.add(o);
            }
        } catch (Exception e) {
            System.err.println("Notice fetching orders: " + e.getMessage());
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
        return list;
    }
}
