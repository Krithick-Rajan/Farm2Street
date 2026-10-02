<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.farm2street.dao.ProduceDAO" %>
<%@ page import="com.farm2street.model.Produce" %>
<%@ page import="java.util.List" %>
<%
    ProduceDAO dao = new ProduceDAO();
    String category = request.getParameter("category");
    List<Produce> produceList = dao.getAllProduce(category);
    String selectedCategory = (category != null && !category.trim().isEmpty()) ? category.trim() : "All";
    String[] categories = new String[]{"All", "Vegetables", "Greens", "Root", "Exotic", "Boxes"};
%>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Farm2Street — Fresh Produce Catalog (JSP &amp; JDBC)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
  <style>
    body { background-color: #fbfaf5; font-family: 'DM Sans', sans-serif; color: #182019; }
    .card-produce { background: #ffffff; border-radius: 1rem; border: 1px solid rgba(24,32,25,0.08); transition: transform 0.2s, box-shadow 0.2s; }
    .card-produce:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(0,0,0,0.08); }
    .badge-organic { background: #dcfce7; color: #166534; font-size: 0.7rem; font-weight: 700; border-radius: 9999px; padding: 0.2rem 0.6rem; }
  </style>
</head>
<body class="p-6 md:p-12">
  <div class="max-w-6xl mx-auto space-y-8">
    
    <!-- Top Bar with Syllabus Badges -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900">
            JSP 3.1 &bull; JSTL &bull; JDBC PreparedStatement
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
            Supabase PostgreSQL
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold font-serif text-[#183c2a]">Fresh Harvest Catalog</h1>
        <p class="text-sm text-stone-600 mt-1">Directly rendered on Apache Tomcat via JavaServer Pages (JSP) &amp; JDBC DAO</p>
      </div>
      
      <div class="flex items-center gap-3">
        <a href="orders.jsp" class="px-4 py-2 border border-stone-300 bg-white text-stone-700 rounded-full text-xs font-bold hover:bg-stone-50 transition-all shadow-sm">
          View Orders Log (JSP) &rarr;
        </a>
        <a href="index.html" class="px-4 py-2 bg-[#183c2a] text-white rounded-full text-xs font-bold hover:bg-[#2c5b3d] transition-all shadow-sm">
          &larr; Back to App
        </a>
      </div>
    </div>

    <!-- Category Filter Tabs (AJAX / GET Form) -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-xs font-bold uppercase tracking-wider text-stone-400 mr-2">Filter Category:</span>
      <% for (String cat : categories) {
           boolean isActive = selectedCategory.equalsIgnoreCase(cat) || ("All".equalsIgnoreCase(selectedCategory) && "All".equalsIgnoreCase(cat));
           String href = "catalog.jsp" + ("All".equalsIgnoreCase(cat) ? "" : "?category=" + cat);
      %>
        <a href="<%= href %>"
           class="px-4 py-1.5 rounded-full text-xs font-bold transition-all <%= isActive ? "bg-[#183c2a] text-white shadow-sm" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400" %>">
          <%= cat %>
        </a>
      <% } %>
    </div>

    <!-- Produce Grid rendered via JSP -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <% if (produceList != null && !produceList.isEmpty()) {
           for (Produce item : produceList) { %>
            <div class="card-produce p-5 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400"><%= item.getCategory() %></span>
                    <h3 class="text-lg font-bold text-stone-900 mt-0.5"><%= item.getName() %></h3>
                  </div>
                  <% if (item.isOrganic()) { %>
                    <span class="badge-organic">&#10003; 100% Organic</span>
                  <% } %>
                </div>
                
                <p class="text-xs text-stone-600 line-clamp-2"><%= (item.isOrganic() ? "Certified Organic " : "Farm Fresh ") + item.getName() + " sourced from " + item.getFarmName() + ", " + item.getFarmLocation() %>.</p>
                
                <div class="bg-stone-50 rounded-xl p-3 text-xs space-y-1 text-stone-600 border border-stone-100">
                  <div class="flex justify-between">
                    <span class="text-stone-400 font-medium">Farm Origin:</span>
                    <span class="font-bold text-stone-800"><%= item.getFarmName() %></span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-400 font-medium">Batch ID:</span>
                    <span class="font-mono text-emerald-800 font-bold"><%= item.getBatchId() %></span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-400 font-medium">Stock Left:</span>
                    <span class="font-bold text-stone-800"><%= item.getStock() %> <%= item.getUnit() %></span>
                  </div>
                </div>
              </div>

              <!-- Price & Action -->
              <div class="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span class="text-xs text-stone-400">Direct Farm Price</span>
                  <div class="text-xl font-bold text-[#183c2a]">&#8377;<%= item.getPrice() %> <span class="text-xs text-stone-500 font-normal">/ <%= item.getUnit() %></span></div>
                </div>
                <a href="index.html" class="px-4 py-2 bg-[#183c2a] text-white rounded-xl text-xs font-bold hover:bg-[#2c5b3d] transition-all">
                  Order in App &rarr;
                </a>
              </div>
            </div>
      <%   }
         } else { %>
          <div class="col-span-3 text-center p-12 bg-white rounded-2xl border border-stone-200">
            <p class="text-stone-500 font-semibold">No harvest items found for this category.</p>
          </div>
      <% } %>
    </div>

    <!-- Syllabus Compliance Footer -->
    <div class="bg-white rounded-2xl p-6 border border-stone-200 text-xs text-stone-500 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <span class="font-bold text-stone-800">Web Technology Lab Demonstration:</span>
        Topic 6 (JSP), Topic 9 (JDBC PreparedStatement), Topic 11 (Apache Tomcat), Topic 12 (Supabase PostgreSQL).
      </div>
      <div class="flex items-center gap-4">
        <a href="produce.xml" target="_blank" class="text-emerald-700 hover:underline font-bold">Inspect produce.xml (XML Feed)</a>
        <a href="api/produce" target="_blank" class="text-emerald-700 hover:underline font-bold">Call /api/produce (Servlet)</a>
      </div>
    </div>

  </div>
</body>
</html>
