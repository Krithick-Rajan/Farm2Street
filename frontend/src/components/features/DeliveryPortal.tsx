import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  Clock,
  DollarSign,
  Phone,
  Package,
  Zap,
  Route,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Star,
  LogOut,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { DeliveryStatus, Order } from '../../types';
import { RouteMapVisualizer } from './RouteMapVisualizer';

export const DeliveryPortal: React.FC = () => {
  const {
    deliveryPartnerProfile,
    orders,
    updateOrderStatus,
    setActiveTrackOrderId,
    logout,
  } = useFarm();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manifest' | 'history' | 'profile'>('manifest');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});

  // Relevant delivery orders
  const activeDeliveries = orders.filter(
    (o) =>
      o.status === 'Ready for Pickup' ||
      o.status === 'Delivery Partner Assigned' ||
      o.status === 'Picked Up' ||
      o.status === 'Out for Delivery'
  );

  const completedDeliveries = orders.filter((o) => o.status === 'Delivered');

  // Currently inspected order for routing
  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || activeDeliveries[0] || completedDeliveries[0];

  const handleStatusAdvance = (order: Order) => {
    switch (order.status) {
      case 'Ready for Pickup':
        updateOrderStatus(order.id, 'Delivery Partner Assigned', 'Driver assigned to pickup run.');
        break;
      case 'Delivery Partner Assigned':
        updateOrderStatus(order.id, 'Picked Up', 'Crate inspected and collected from farm gate.');
        break;
      case 'Picked Up':
        updateOrderStatus(order.id, 'Out for Delivery', 'Driver en route to customer doorstep.');
        break;
      case 'Out for Delivery':
        updateOrderStatus(order.id, 'Delivered', 'Doorstep delivery confirmed. OTP verified.');
        break;
      default:
        break;
    }
  };

  const getActionButtonText = (status: DeliveryStatus) => {
    switch (status) {
      case 'Ready for Pickup':
        return 'Accept Delivery Run';
      case 'Delivery Partner Assigned':
        return 'Collect & Pick Up Crate';
      case 'Picked Up':
        return 'Start Out for Delivery';
      case 'Out for Delivery':
        return 'Confirm Handover & Deliver';
      default:
        return 'Delivered';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4ee] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Delivery Header Banner - Clean & Modern */}
        <div className="rounded-3xl bg-[#0e271a] text-white p-6 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/15 shrink-0">
                <Truck className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {deliveryPartnerProfile.name}
                  </h1>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                    EV Fleet
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1 flex items-center gap-2">
                  <span>{deliveryPartnerProfile.vehicleType}</span>
                  <span>•</span>
                  <span>{deliveryPartnerProfile.vehicleNumber}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-white">{deliveryPartnerProfile.rating}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-5 bg-white/5 rounded-2xl px-5 py-3 border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Today's Payout</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-300">₹{completedDeliveries.length * 90}</span>
                </div>
                <div className="border-l border-white/15 pl-5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Completed</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">{completedDeliveries.length} Drops</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Active Runs
            </span>
            <div className="text-2xl font-bold text-sky-700 mt-0.5">
              {activeDeliveries.length} Assigned
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              On-Time Rate
            </span>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">
              98.8%
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Distance Today
            </span>
            <div className="text-2xl font-bold text-stone-900 mt-0.5">
              {(completedDeliveries.length * 4.8).toFixed(1)} km
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Payout / Drop
            </span>
            <div className="text-2xl font-bold text-[#183c2a] mt-0.5">
              ₹90
            </div>
          </div>
        </div>

        {/* Console View Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-white rounded-2xl p-1.5 shadow-2xs gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manifest'
                ? 'bg-[#183c2a] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Route className="h-4 w-4" />
            <span>Active Deliveries ({activeDeliveries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-[#183c2a] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed Runs ({completedDeliveries.length})</span>
          </button>
        </div>

        {/* ACTIVE MANIFEST & ROUTE NAVIGATION */}
        {activeTab === 'manifest' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Manifest Drops List (5 cols) */}
            <div className="lg:col-span-5 space-y-3.5">
              <h3 className="font-sans text-sm font-bold text-[#182019]">
                Assigned Orders
              </h3>

              {activeDeliveries.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-400 shadow-sm">
                  No active runs currently assigned. When a farmer prepares an order and marks it "Ready for Pickup", it will appear here immediately for transit!
                </div>
              ) : (
                activeDeliveries.map((order, idx) => {
                  const isSelected = activeOrder?.id === order.id;

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-[#183c2a] bg-white shadow-md ring-2 ring-[#183c2a]/10'
                          : 'border-stone-200 bg-stone-50/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183c2a] text-white font-bold text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-stone-900">{order.id}</span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            order.status === 'Out for Delivery'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-sky-100 text-sky-900'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Pickup & Drop Points */}
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                          <div>
                            <div className="font-semibold text-stone-900">{order.farmerName}</div>
                            <div className="text-[11px] text-stone-500">{order.farmPickupLocation}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-600 mt-1 shrink-0" />
                          <div>
                            <div className="font-semibold text-stone-900">{order.customerName}</div>
                            <div className="text-[11px] text-stone-500">{order.deliveryAddress}</div>
                          </div>
                        </div>
                      </div>

                      {/* Advance Button */}
                      <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="text-[11px] text-stone-500 font-medium">
                          {order.items.length} items • ₹{order.totalAmount}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusAdvance(order);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-[#183c2a] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2c5b3d] shadow-2xs transition-all"
                        >
                          <span>{getActionButtonText(order.status)}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Live Navigation & Routing Engine (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              <h3 className="font-sans text-sm font-bold text-[#182019]">
                Live Route Navigation
              </h3>

              {activeOrder ? (
                <div className="space-y-4">
                  <RouteMapVisualizer
                    pickupLocation={activeOrder.farmPickupLocation}
                    deliveryLocation={activeOrder.deliveryAddress}
                    distanceKm={activeOrder.distanceKm}
                    estimatedMinutes={activeOrder.estimatedDeliveryMinutes}
                    status={activeOrder.status}
                    driverName={deliveryPartnerProfile.name}
                    vehicleNumber={deliveryPartnerProfile.vehicleNumber}
                  />

                  {/* Order Details & Customer Contact */}
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-sans font-bold text-sm text-[#182019]">
                        Customer & Handover Details
                      </h4>
                      <a
                        href={`tel:${activeOrder.customerPhone}`}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-800 px-3 py-1.5 font-bold hover:bg-emerald-100"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call Customer ({activeOrder.customerPhone})</span>
                      </a>
                    </div>

                    <div className="rounded-xl bg-stone-50 p-3 border border-stone-200 space-y-1">
                      <div className="font-bold text-stone-900">
                        Produce Packages in Crate:
                      </div>
                      <div className="divide-y divide-stone-200">
                        {activeOrder.items.map((it, idx) => (
                          <div key={idx} className="py-1 flex justify-between">
                            <span>{it.name} ({it.quantity} {it.unit})</span>
                            <span className="font-mono text-stone-500">{activeOrder.batchId}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick status progress button inside map pane */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-stone-500">Current Order State: <strong className="text-stone-900">{activeOrder.status}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleStatusAdvance(activeOrder)}
                        className="rounded-xl bg-[#183c2a] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#2c5b3d] shadow-sm"
                      >
                        {getActionButtonText(activeOrder.status)}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-400">
                  Select an order from the manifest to view live route navigation.
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED RUNS TAB */}
        {activeTab === 'history' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-sans text-base font-bold text-[#182019] mb-4">
              Completed Delivery Manifests
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-[10px] font-bold uppercase text-stone-400">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Delivery Address</th>
                  <th className="pb-3">Distance</th>
                  <th className="pb-3">Delivery Fee Paid</th>
                  <th className="pb-3">Proof Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {completedDeliveries.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-mono font-bold text-[#183c2a]">{o.id}</td>
                    <td className="py-3 font-medium">{o.customerName}</td>
                    <td className="py-3 text-stone-500">{o.deliveryAddress}</td>
                    <td className="py-3">{o.distanceKm} km</td>
                    <td className="py-3 font-bold text-emerald-700">₹90 + ₹30</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Delivered & Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
