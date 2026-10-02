package com.farm2street.controller;

import com.farm2street.dao.UserDAO;
import com.farm2street.model.User;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Authentication and Session Controller.
 * Satisfies Syllabus: Topic 13 (Cookies), Topic 14 (Sessions), Topic 7 (Servlets).
 */
@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final UserDAO userDAO = new UserDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            User user = (User) session.getAttribute("user");
            resp.getWriter().print(gson.toJson(user));
        } else {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().print("{\"authenticated\": false}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        String pathInfo = req.getPathInfo(); // "/login", "/register", "/logout"

        if ("/login".equalsIgnoreCase(pathInfo)) {
            String email = req.getParameter("email");
            String password = req.getParameter("password");
            boolean remember = "true".equalsIgnoreCase(req.getParameter("remember"));

            User user = userDAO.authenticate(email, password);
            if (user != null) {
                // Topic 14: Server-side Session Management
                HttpSession session = req.getSession(true);
                session.setAttribute("user", user);

                // Topic 13: Cookies (Remember Me)
                if (remember) {
                    Cookie rememberCookie = new Cookie("farm2street_user", user.getEmail());
                    rememberCookie.setMaxAge(60 * 60 * 24 * 30); // 30 days
                    rememberCookie.setPath("/");
                    resp.addCookie(rememberCookie);
                }

                JsonObject json = new JsonObject();
                json.addProperty("success", true);
                json.addProperty("sessionId", session.getId());
                json.add("user", gson.toJsonTree(user));
                resp.getWriter().print(json.toString());
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().print("{\"success\": false, \"message\": \"Invalid credentials\"}");
            }
        } else if ("/logout".equalsIgnoreCase(pathInfo)) {
            // Invalidate session
            HttpSession session = req.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            // Clear remember-me cookie
            Cookie killCookie = new Cookie("farm2street_user", "");
            killCookie.setMaxAge(0);
            killCookie.setPath("/");
            resp.addCookie(killCookie);

            resp.getWriter().print("{\"success\": true, \"message\": \"Logged out\"}");
        } else if ("/register".equalsIgnoreCase(pathInfo)) {
            String name = req.getParameter("name");
            String email = req.getParameter("email");
            String password = req.getParameter("password");
            String role = req.getParameter("role") != null ? req.getParameter("role") : "customer";
            String phone = req.getParameter("phone");
            String address = req.getParameter("address");

            boolean registered = userDAO.register(name, email, password, role, phone, address);
            resp.getWriter().print("{\"success\": " + registered + ", \"message\": \"User registered successfully\"}");
        }
    }
}
