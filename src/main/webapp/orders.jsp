<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<%@ page import="com.farm2street.dao.OrderDAO" %>
<%@ page import="com.farm2street.model.Order" %>
<%@ page import="java.util.List" %>
<%
    OrderDAO orderDao = new OrderDAO();
    List<Order> orderList = orderDao.getAllOrders();
    request.setAttribute("orders", orderList);
%>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Farm2Street — Harvest Allocation &amp; Orders Log (JSP)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
  <style>
    body { background-color: #f5f4ee; font-family: 'DM Sans', sans-serif; color: #182019; }
    .card-table { background: #ffffff; border-radius: 1rem; border: 1px solid rgba(24,32,25,0.08); }
    .status-badge { display: inline-block; padding: 0.25rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .status-paid { background: #dcfce7; color: #166534; }
  </style>
</head>
<body class="p-6 md:p-12">
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-6 border-b border-stone-200">
      <div>
        <h1 class="text-3xl font-bold font-serif text-[#183c2a]">Live Harvest Orders Log</h1>
        <p class="text-sm text-stone-600 mt-1">Rendered via JavaServer Pages (JSP) &amp; JSTL Tag Library</p>
      </div>
      <a href="index.html" class="px-4 py-2 bg-[#183c2a] text-white rounded-full text-xs font-bold hover:bg-[#2c5b3d] transition-all">
        &larr; Back to Platform
      </a>
    </div>

    <!-- JSP Dynamic Table -->
    <div class="card-table shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-[#fbfaf5] border-b border-stone-200 text-stone-500 font-bold text-xs uppercase tracking-wider">
          <tr>
            <th class="p-4">Order Code</th>
            <th class="p-4">Customer</th>
            <th class="p-4">Amount</th>
            <th class="p-4">Payment</th>
            <th class="p-4">Harvest Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <c:choose>
            <c:when test="${not empty orders}">
              <c:forEach var="order" items="${orders}">
                <tr class="hover:bg-stone-50 transition-colors">
                  <td class="p-4 font-mono font-bold text-[#183c2a]">${order.orderCode}</td>
                  <td class="p-4">
                    <div class="font-bold text-stone-900">${order.customerName}</div>
                    <div class="text-xs text-stone-500">${order.customerPhone}</div>
                  </td>
                  <td class="p-4 font-bold text-stone-900">&#8377;${order.totalAmount}</td>
                  <td class="p-4">
                    <span class="status-badge status-paid">Razorpay &#10003;</span>
                  </td>
                  <td class="p-4">
                    <span class="status-badge bg-emerald-100 text-emerald-800">${order.orderStatus}</span>
                  </td>
                </tr>
              </c:forEach>
            </c:when>
            <c:otherwise>
              <tr>
                <td colspan="5" class="p-8 text-center text-stone-400">
                  No orders recorded yet. Place an order on the platform to view live SQL entries!
                </td>
              </tr>
            </c:otherwise>
          </c:choose>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
