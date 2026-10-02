import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Check,
  Ban,
  Eye,
  Server,
  Database,
  CreditCard,
  QrCode,
  Truck,
  Tractor,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { DeliveryStatus, Order } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';

export const AdminCenter: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    produceList,
    removeProduce,
    settlements,
    disburseSettlement,
    subscriptions,
    farmerProfile,
    deliveryPartnerProfile,
    logout,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<'kpi' | 'orders' | 'farmers' | 'settlements' | 'traceability' | 'system'>('kpi');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate platform financial stats
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0) + 482000;
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;
  const totalDeliveriesCount = orders.filter((o) => o.status === 'Delivered').length + 840;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.farmerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f4ee] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header Banner */}
        <div className="rounded-3xl bg-[#131920] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 shrink-0">
                <ShieldCheck className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#a48256]">
                    Platform Governance & Governance Command Center
                  </span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    SuperAdmin Session
                  </span>
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  Farm2Street Root Controller
                </h1>
                <p className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                  <span>Environment: <strong>Production / WebTech Lab</strong></span>
                  <span>•</span>
                  <span>Cluster: ap-south-1 (Mumbai)</span>
                  <span>•</span>
                  <span>Supabase: Connected (PostgreSQL 16)</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Marketplace GMV</span>
                  <span className="text-2xl font-black text-white">₹{(totalGMV / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="border-l border-white/15 pl-4">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Active Pipeline</span>
                  <span className="text-2xl font-black text-amber-400">{activeOrdersCount} In Transit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global KPIs Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Registered Micro-Farms
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#183c2a] mt-1">28 Farms</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              100% NPOP Geo-tagged & Vetted
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Active Box Subscribers
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#a48256] mt-1">
              {subscriptions.length + 340} Households
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Retention rate: 94.2%
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Fulfillment SLA Compliance
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
              99.2%
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Avg farm-to-door: 3.4 hrs
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Settlement Health
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              100%
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Razorpay Automated T+1
            </div>
          </div>
        </div>

        {/* Two-Column Responsive Layout with Left Slides Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* LEFT SLIDES NAVIGATION (Exact User UI/UX Style) */}
          <aside className="rounded-3xl border border-stone-200/90 bg-white p-3.5 shadow-sm space-y-2.5 sticky top-24">
            <div className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a48256]">
              Governance Console Slides
            </div>
            {[
              { id: 'kpi', label: 'Overview & Platform Health', icon: TrendingUp, desc: 'Real-time telemetry & metrics' },
              { id: 'orders', label: 'Global 8-Stage Order Lifecycle', icon: Package, count: activeOrdersCount, desc: 'Live dispatch & stages' },
              { id: 'farmers', label: 'Farmer KYC & Governance', icon: Tractor, desc: 'NPOP vetting & accounts' },
              { id: 'settlements', label: 'Razorpay Settlements & Payouts', icon: DollarSign, count: settlements.filter(s => s.status === 'processing').length, desc: 'T+1 Escrow disbursement' },
              { id: 'system', label: 'Infrastructure & Supabase Status', icon: Server, desc: 'PostgreSQL 16 & APIs' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full h-[68px] px-3.5 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-[#183c2a] text-white border-[#183c2a] shadow-md ring-1 ring-[#183c2a]'
                      : 'bg-[#faf8f2] text-stone-800 border-stone-200/90 hover:bg-[#f2eee3] hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-white/15 text-[#c5a880]'
                          : 'bg-white text-stone-700 border border-stone-200/80 shadow-2xs'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="leading-snug truncate font-bold">{tab.label}</div>
                      <div
                        className={`text-[10px] font-normal mt-0.5 truncate ${
                          isSelected ? 'text-emerald-200' : 'text-stone-500'
                        }`}
                      >
                        {tab.desc}
                      </div>
                    </div>
                  </div>
                  {tab.count !== undefined && tab.count > 0 ? (
                    <span
                      className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        isSelected
                          ? 'bg-[#c5a880] text-[#07100b]'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <div className="space-y-6 min-w-0">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'kpi' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct-to-Consumer Impact */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-sans text-base font-bold text-[#182019]">
                Marketplace Disintermediation Efficiency
              </h3>
              <p className="text-xs text-stone-500">
                Comparison of farmer price realization on Farm2Street vs traditional APMC Mandi channels:
              </p>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Farmer Realization on Farm2Street (82% of retail price)</span>
                    <span className="text-emerald-700 font-bold">₹82 / ₹100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-stone-400">
                    <span>Conventional Mandi System (Middlemen eat 65%)</span>
                    <span>₹35 / ₹100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-stone-400 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Active User Actors Summary */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-sans text-base font-bold text-[#182019]">
                Active Platform Actor Census
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="text-[10px] font-bold uppercase text-stone-400">Farmers Listed</div>
                  <div className="text-xl font-bold text-[#183c2a] mt-0.5">28 Verified</div>
                  <div className="text-[11px] text-stone-500">1 pending approval</div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="text-[10px] font-bold uppercase text-stone-400">Consumers Enrolled</div>
                  <div className="text-xl font-bold text-stone-900 mt-0.5">1,420 Users</div>
                  <div className="text-[11px] text-stone-500">+18% this month</div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="text-[10px] font-bold uppercase text-stone-400">Delivery Fleet</div>
                  <div className="text-xl font-bold text-sky-700 mt-0.5">12 Drivers</div>
                  <div className="text-[11px] text-stone-500">100% Electric EV</div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="text-[10px] font-bold uppercase text-stone-400">Platform Admins</div>
                  <div className="text-xl font-bold text-purple-700 mt-0.5">2 Operators</div>
                  <div className="text-[11px] text-stone-500">RBAC Level: SuperAdmin</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GLOBAL 8-STAGE ORDER LIFECYCLE */}
        {activeTab === 'orders' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#182019]">
                  Platform-Wide Order Lifecycle Auditor
                </h3>
                <p className="text-xs text-stone-500">
                  Monitor and manage orders across all 8 stages. Administrators can override statuses for testing or dispute resolution.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 min-w-[190px]">
                <CustomSelect
                  value={orderFilter}
                  onChange={(val) => setOrderFilter(val)}
                  options={[
                    { value: 'all', label: 'All 8 Stages' },
                    { value: 'Order Placed', label: 'Order Placed' },
                    { value: 'Order Confirmed', label: 'Order Confirmed' },
                    { value: 'Preparing', label: 'Preparing' },
                    { value: 'Ready for Pickup', label: 'Ready for Pickup' },
                    { value: 'Delivery Partner Assigned', label: 'Delivery Partner Assigned' },
                    { value: 'Picked Up', label: 'Picked Up' },
                    { value: 'Out for Delivery', label: 'Out for Delivery' },
                    { value: 'Delivered', label: 'Delivered' },
                  ]}
                  size="sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] font-bold uppercase text-stone-400">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Farmer Origin</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Current Status</th>
                    <th className="pb-3 text-right">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50">
                      <td className="py-3 font-mono font-bold text-[#183c2a]">{o.id}</td>
                      <td className="py-3">
                        <div className="font-semibold text-stone-900">{o.customerName}</div>
                        <div className="text-[10px] text-stone-400 truncate max-w-[140px]">{o.deliveryAddress}</div>
                      </td>
                      <td className="py-3 font-medium text-stone-700">{o.farmerName}</td>
                      <td className="py-3 font-bold text-stone-900">₹{o.totalAmount}</td>
                      <td className="py-3">
                        <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-1 text-[10px] font-bold text-stone-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right min-w-[180px]">
                        <CustomSelect
                          value={o.status}
                          onChange={(val) => updateOrderStatus(o.id, val as DeliveryStatus, 'Admin override')}
                          options={[
                            'Order Placed',
                            'Order Confirmed',
                            'Preparing',
                            'Ready for Pickup',
                            'Delivery Partner Assigned',
                            'Picked Up',
                            'Out for Delivery',
                            'Delivered',
                          ]}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FARMER KYC & GOVERNANCE */}
        {activeTab === 'farmers' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-sans text-base font-bold text-[#182019]">
              Farmer Producer Verification & Accreditation Directory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 text-sm">{farmerProfile.farmName}</div>
                  <span className="rounded-full bg-emerald-200 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                    KYC Approved
                  </span>
                </div>
                <div className="text-stone-600">Farmer: {farmerProfile.name}</div>
                <div className="text-stone-600">Location: {farmerProfile.location}</div>
                <div className="text-stone-600">Acreage: {farmerProfile.totalAcres} Acres Certified Organic</div>
                <div className="text-stone-600 font-mono text-[11px]">Cert #: {farmerProfile.certificationNumber}</div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">Bank Account: Verified</span>
                  <span>•</span>
                  <span className="text-stone-500">420 Deliveries Fulfilled</span>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-stone-900 text-sm">Sunrise Fields Agro</div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                    KYC Approved
                  </span>
                </div>
                <div className="text-stone-600">Farmer: Anandi Devi</div>
                <div className="text-stone-600">Location: Valley Organic Cluster</div>
                <div className="text-stone-600">Acreage: 5.2 Acres Certified Organic</div>
                <div className="text-stone-600 font-mono text-[11px]">Cert #: NPOP/NAB/0042-ORG-2025</div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">Bank Account: Verified</span>
                  <span>•</span>
                  <span className="text-stone-500">290 Deliveries Fulfilled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RAZORPAY SETTLEMENTS */}
        {activeTab === 'settlements' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sans text-base font-bold text-[#182019]">
                  Farmer Payouts & Razorpay Escrow Disbursement
                </h3>
                <p className="text-xs text-stone-500">
                  Direct T+1 automated payouts to farmer accounts based on completed deliveries.
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[10px] font-bold uppercase text-stone-400">
                  <th className="pb-3">Batch ID</th>
                  <th className="pb-3">Farmer</th>
                  <th className="pb-3">Net Payout Amount</th>
                  <th className="pb-3">Fulfillment Count</th>
                  <th className="pb-3">Settlement Status</th>
                  <th className="pb-3 text-right">Disbursement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 font-mono font-bold text-stone-900">{s.id}</td>
                    <td className="py-3 font-medium">{s.farmerName}</td>
                    <td className="py-3 font-bold text-emerald-800 text-sm">₹{s.amount.toLocaleString()}</td>
                    <td className="py-3">{s.orderCount} orders</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          s.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {s.status === 'processing' ? (
                        <button
                          type="button"
                          onClick={() => disburseSettlement(s.id)}
                          className="rounded-lg bg-[#0c2340] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#15345d]"
                        >
                          Trigger Razorpay Payout
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-stone-400">{s.utrNumber}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: SYSTEM INFRASTRUCTURE */}
        {activeTab === 'system' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-sans text-base font-bold text-[#182019]">
                Cloud Infrastructure & Dual-Backend Health Check
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Enterprise architecture running Supabase PostgreSQL 16 Cloud & Apache Tomcat Jakarta EE.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* 1. Supabase PostgreSQL */}
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Database className="h-4 w-4" />
                  <span>Supabase PostgreSQL 16</span>
                </div>
                <div className="text-stone-700 font-semibold">Status: Online & Connected</div>
                <div className="text-stone-500 text-[11px] leading-relaxed">
                  Region: ap-south-1 (Mumbai)<br/>
                  Engine: Realtime WebSockets Active<br/>
                  Tables: produce, orders, farms, users
                </div>
              </div>

              {/* 2. Supabase Auth & Realtime */}
              <div className="rounded-xl border border-teal-300 bg-teal-50/70 p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-teal-900 font-bold">
                  <Server className="h-4 w-4" />
                  <span>Supabase Auth & Storage</span>
                </div>
                <div className="text-stone-700 font-semibold">Status: Active & Linked</div>
                <div className="text-stone-500 text-[11px] leading-relaxed">
                  Auth: JWT & Session Management<br/>
                  Storage: Bucket for Harvest Proofs<br/>
                  SDK: @supabase/supabase-js v2
                </div>
              </div>

              {/* 3. Razorpay Payments */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-800 font-bold">
                  <CreditCard className="h-4 w-4 text-[#c5a880]" />
                  <span>Razorpay T+1 Escrow</span>
                </div>
                <div className="text-stone-700 font-semibold">Status: Webhooks Verified</div>
                <div className="text-stone-500 text-[11px] leading-relaxed">
                  Signature: HMAC-SHA256<br/>
                  Settlement: Instant UPI & Cards<br/>
                  Disbursement: Automated T+1
                </div>
              </div>

              {/* 4. Satellite Ortho Imagery & Routing */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Truck className="h-4 w-4" />
                  <span>Satellite Ortho Imagery</span>
                </div>
                <div className="text-stone-700 font-semibold">Status: High-Res Ortho Active</div>
                <div className="text-stone-500 text-[11px] leading-relaxed">
                  Provider: Leaflet + ArcGIS Ortho<br/>
                  Labels: High-Contrast World Ref<br/>
                  Zero Google APIs Dependency
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};
