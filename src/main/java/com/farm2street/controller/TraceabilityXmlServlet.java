package com.farm2street.controller;

import com.farm2street.dao.ProduceDAO;
import com.farm2street.model.Produce;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Harvest Traceability XML Feed Controller.
 * Satisfies Syllabus: Topic 5 (XML) & Topic 4 (AJAX XML parsing).
 */
@WebServlet("/api/traceability.xml")
public class TraceabilityXmlServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final ProduceDAO produceDAO = new ProduceDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/xml");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        List<Produce> list = produceDAO.getAllProduce(null);

        PrintWriter out = resp.getWriter();
        out.println("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        out.println("<harvestTraceabilityFeed platform=\"Farm2Street\" generated=\"" + java.time.Instant.now() + "\">");

        for (Produce p : list) {
            out.println("  <batch id=\"" + escapeXml(p.getBatchId()) + "\">");
            out.println("    <produceId>" + p.getId() + "</produceId>");
            out.println("    <name>" + escapeXml(p.getName()) + "</name>");
            out.println("    <category>" + escapeXml(p.getCategory()) + "</category>");
            out.println("    <price currency=\"INR\" unit=\"" + escapeXml(p.getUnit()) + "\">" + p.getPrice() + "</price>");
            out.println("    <farmOrigin>");
            out.println("      <name>" + escapeXml(p.getFarmName()) + "</name>");
            out.println("      <coordinates>" + escapeXml(p.getFarmLocation()) + "</coordinates>");
            out.println("      <harvestDate>" + escapeXml(p.getHarvestDate()) + "</harvestDate>");
            out.println("    </farmOrigin>");
            out.println("    <pesticideFree>" + p.isOrganic() + "</pesticideFree>");
            out.println("    <stockAvailable>" + p.getStock() + "</stockAvailable>");
            out.println("  </batch>");
        }

        out.println("</harvestTraceabilityFeed>");
        out.flush();
    }

    private String escapeXml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&apos;");
    }
}
