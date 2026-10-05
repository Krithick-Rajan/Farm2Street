package com.farm2street.controller;

import com.farm2street.dao.ProduceDAO;
import com.farm2street.model.Produce;
import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * REST API Servlet for Produce & Harvest Batches.
 * Satisfies Syllabus: Topic 4 (AJAX), Topic 7 (Servlets), Topic 10 (SQL/CRUD).
 */
@WebServlet("/api/produce")
public class ProduceServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final ProduceDAO produceDAO = new ProduceDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        // CORS support
        resp.setHeader("Access-Control-Allow-Origin", "*");

        String category = req.getParameter("category");
        List<Produce> list = produceDAO.getAllProduce(category);

        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(list));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            String name = req.getParameter("name");
            String category = req.getParameter("category");
            double price = Double.parseDouble(req.getParameter("price"));
            String unit = req.getParameter("unit");
            int stock = Integer.parseInt(req.getParameter("stock"));
            String farmName = req.getParameter("farmName");
            String farmLocation = req.getParameter("farmLocation");
            String harvestDate = req.getParameter("harvestDate");
            String batchId = "BATCH-" + System.currentTimeMillis() % 10000;
            String imageUrl = req.getParameter("imageUrl");
            boolean organic = Boolean.parseBoolean(req.getParameter("organic"));

            Produce p = new Produce(0, name, category, price, unit, stock, farmName, farmLocation, harvestDate, batchId, imageUrl, organic);
            boolean success = produceDAO.addProduce(p);

            resp.getWriter().print("{\"success\": " + success + ", \"message\": \"Harvest batch logged successfully\"}");
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
