package com.farm2street.controller;

import com.farm2street.dao.ProduceDAO;
import com.farm2street.model.CartItem;
import com.farm2street.model.Produce;
import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * Session-based Shopping Cart Servlet.
 * Satisfies Syllabus: Topic 13 (Cookies), Topic 14 (Sessions), Topic 4 (AJAX).
 */
@WebServlet("/api/cart")
public class CartServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final ProduceDAO produceDAO = new ProduceDAO();
    private final Gson gson = new Gson();

    @SuppressWarnings("unchecked")
    private List<CartItem> getOrCreateCart(HttpSession session, HttpServletResponse resp) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
            session.setAttribute("cart", cart);

            // Topic 13: Attach Guest Cart Cookie
            Cookie cartCookie = new Cookie("farm2street_cart_id", session.getId());
            cartCookie.setMaxAge(60 * 60 * 24 * 7); // 7 days
            cartCookie.setPath("/");
            resp.addCookie(cartCookie);
        }
        return cart;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        HttpSession session = req.getSession(true);
        List<CartItem> cart = getOrCreateCart(session, resp);

        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(cart));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        HttpSession session = req.getSession(true);
        List<CartItem> cart = getOrCreateCart(session, resp);

        String action = req.getParameter("action"); // "add", "update", "remove", "clear"
        String produceIdStr = req.getParameter("produceId");

        int produceId = (produceIdStr != null) ? Integer.parseInt(produceIdStr) : 0;

        if ("add".equalsIgnoreCase(action)) {
            boolean found = false;
            for (CartItem item : cart) {
                if (item.getProduce().getId() == produceId) {
                    item.setQuantity(item.getQuantity() + 1);
                    found = true;
                    break;
                }
            }
            if (!found) {
                Produce p = produceDAO.getProduceById(produceId);
                if (p != null) {
                    cart.add(new CartItem(p, 1));
                }
            }
        } else if ("remove".equalsIgnoreCase(action)) {
            cart.removeIf(item -> item.getProduce().getId() == produceId);
        } else if ("update".equalsIgnoreCase(action)) {
            int qty = Integer.parseInt(req.getParameter("quantity"));
            if (qty <= 0) {
                cart.removeIf(item -> item.getProduce().getId() == produceId);
            } else {
                for (CartItem item : cart) {
                    if (item.getProduce().getId() == produceId) {
                        item.setQuantity(qty);
                        break;
                    }
                }
            }
        } else if ("clear".equalsIgnoreCase(action)) {
            cart.clear();
        }

        session.setAttribute("cart", cart);

        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(cart));
        out.flush();
    }
}
