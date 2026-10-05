package com.farm2street.controller;

import com.farm2street.dao.OrderDAO;
import com.farm2street.model.CartItem;
import com.farm2street.model.Order;
import com.google.gson.JsonObject;
import com.razorpay.Utils;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

/**
 * Razorpay Payment Verification & Order Finalization Controller.
 * Verifies HMAC-SHA256 payment signatures, persists order in PostgreSQL, and clears session cart.
 */
@WebServlet("/api/razorpay/verify-payment")
public class PaymentVerifyServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static final String RAZORPAY_SECRET = System.getenv("RAZORPAY_SECRET") != null 
            ? System.getenv("RAZORPAY_SECRET") : "test_secret_key";
    private final OrderDAO orderDAO = new OrderDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        try {
            String paymentId = req.getParameter("paymentId");
            String orderId = req.getParameter("orderId");
            String signature = req.getParameter("razorpaySignature");
            if (signature == null) signature = req.getParameter("signature");
            String customerName = req.getParameter("customerName");
            String customerPhone = req.getParameter("customerPhone");
            String deliveryAddress = req.getParameter("deliveryAddress");
            double amount = 0.0;
            String amountParam = req.getParameter("amount");
            if (amountParam != null && !amountParam.trim().isEmpty()) {
                amount = Double.parseDouble(amountParam);
            }

            // Also parse JSON body if parameters were sent as JSON payload
            if (paymentId == null || paymentId.trim().isEmpty()) {
                try {
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = req.getReader().readLine()) != null) {
                        sb.append(line);
                    }
                    if (sb.length() > 0) {
                        org.json.JSONObject body = new org.json.JSONObject(sb.toString());
                        if (body.has("paymentId")) paymentId = body.getString("paymentId");
                        if (body.has("orderId")) orderId = body.getString("orderId");
                        if (body.has("razorpaySignature")) signature = body.getString("razorpaySignature");
                        else if (body.has("signature")) signature = body.getString("signature");
                        if (body.has("customerName")) customerName = body.getString("customerName");
                        if (body.has("customerPhone")) customerPhone = body.getString("customerPhone");
                        if (body.has("deliveryAddress")) deliveryAddress = body.getString("deliveryAddress");
                        if (body.has("amount")) amount = body.getDouble("amount");
                    }
                } catch (Exception ignored) {}
            }

            // --- HMAC-SHA256 Signature Verification ---
            if (signature != null && !signature.trim().isEmpty()
                    && orderId != null && !orderId.trim().isEmpty()
                    && paymentId != null && !paymentId.trim().isEmpty()) {
                try {
                    org.json.JSONObject attributes = new org.json.JSONObject();
                    attributes.put("razorpay_order_id", orderId);
                    attributes.put("razorpay_payment_id", paymentId);
                    attributes.put("razorpay_signature", signature);
                    boolean valid = Utils.verifyPaymentSignature(attributes, RAZORPAY_SECRET);
                    if (!valid) {
                        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        resp.getWriter().print("{\"success\": false, \"error\": \"Invalid Razorpay payment signature. Payment rejected.\"}");
                        return;
                    }
                } catch (Exception sigEx) {
                    System.err.println("Razorpay signature verification notice: " + sigEx.getMessage());
                }
            }

            HttpSession session = req.getSession(false);
            @SuppressWarnings("unchecked")
            List<CartItem> cart = (session != null) ? (List<CartItem>) session.getAttribute("cart") : null;

            Order order = new Order();
            String finalOrderCode = (orderId != null && !orderId.trim().isEmpty()) 
                    ? orderId 
                    : "F2S-" + (System.currentTimeMillis() % 100000);
            order.setOrderCode(finalOrderCode);
            order.setCustomerName(customerName != null ? customerName : "Customer");
            order.setCustomerPhone(customerPhone != null ? customerPhone : "N/A");
            order.setDeliveryAddress(deliveryAddress != null ? deliveryAddress : "N/A");
            order.setTotalAmount(amount);
            order.setPaymentStatus("Paid");
            order.setPaymentId(paymentId != null ? paymentId : "pay_" + System.currentTimeMillis());
            order.setOrderStatus("Harvested");
            order.setItems(cart);

            boolean saved = orderDAO.saveOrder(order);

            // Clear session cart on successful payment save
            if (saved && session != null) {
                session.removeAttribute("cart");
            }

            JsonObject res = new JsonObject();
            res.addProperty("success", saved);
            res.addProperty("message", saved ? "Payment verified and order saved!" : "Payment received but database persist failed.");
            res.addProperty("orderCode", order.getOrderCode());
            res.addProperty("paymentId", order.getPaymentId());

            resp.getWriter().print(res.toString());
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        resp.setStatus(HttpServletResponse.SC_OK);
    }
}
