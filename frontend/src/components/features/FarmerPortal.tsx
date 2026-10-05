import React, { useState } from 'react';
import {
  Tractor,
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  QrCode,
  CheckCircle2,
  Clock,
  MapPin,
  Leaf,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Produce, TraceabilityBatch } from '../../types';
import { CustomSelect } from '../ui/UiWidgets';

export const FarmerPortal: React.FC = () => {
  const {
    farmerProfile,
    produceList,
    addProduce,
    updateProduceStock,
    removeProduce,
    orders,
    updateOrderStatus,
    createBatch,
    setSelectedBatchId,
    settlements,
    logout,
    currentUser,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'batches' | 'earnings' | 'profile'>('orders');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // New Produce Form State
  const [newProduceName, setNewProduceName] = useState('');
  const [newCategory, setNewCategory] = useState<'Vegetables' | 'Greens' | 'Root' | 'Exotic'>('Vegetables');
  const [newPrice, setNewPrice] = useState(40);
  const [newUnit, setNewUnit] = useState('kg');
  const [newQty, setNewQty] = useState(80);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85');
  const [newDesc, setNewDesc] = useState('');

  // New Batch Form State
  const [batchProduceName, setBatchProduceName] = useState('Heirloom Vine Tomatoes');
  const [batchFieldId, setBatchFieldId] = useState('Field-North-04 (Certified Organic)');
  const [batchGrade, setBatchGrade] = useState('Grade A+ (Export Quality)');
  const [batchSoilCarbon, setBatchSoilCarbon] = useState('0.84% Optimal');

  // Filter orders dynamically matching this farmer's profile or farm name
  const farmerOrders = orders.filter((o) => {
    const fName = (farmerProfile?.name || currentUser?.name || '').toLowerCase();
    const farm = (farmerProfile?.farmName || '').toLowerCase();
    const orderFarmer = (o.farmerName || '').toLowerCase();
    return (
      (farm && orderFarmer.includes(farm)) ||
      (fName && orderFarmer.includes(fName.split(' ')[0])) ||
      orderFarmer.includes('green valley') ||
      orderFarmer.includes('ramesh')
    );
  });
  const pendingPrepOrders = farmerOrders.filter(
    (o) => o.status === 'Order Confirmed' || o.status === 'Preparing'
  );
  const readyPickupOrders = farmerOrders.filter((o) => o.status === 'Ready for Pickup');

  const handleCreateProduce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduceName) return;

    addProduce({
      name: newProduceName,
      category: newCategory,
      price: Number(newPrice),
      unit: newUnit,
      farmer: farmerProfile.farmName,
      farmLocation: farmerProfile.location,
      harvestDate: 'Today 06:00 AM',
      availableQty: Number(newQty),
      image: newImage,
      description: newDesc || `${newProduceName} freshly harvested from ${farmerProfile.farmName}.`,
      batchId: `F2S-BATCH-${Date.now().toString().slice(-6)}`,
      organic: true,
      rating: 5.0,
    });

    setIsAddModalOpen(false);
    setNewProduceName('');
    setNewDesc('');
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const batchId = `F2S-BT-${Date.now().toString().slice(-6)}`;
    const nowStr = new Date().toLocaleString();

    const newBatch: TraceabilityBatch = {
      batchId,
      produceName: batchProduceName,
      farmName: farmerProfile.farmName,
      farmerName: farmerProfile.name,
      location: farmerProfile.location,
      fieldId: batchFieldId,
      harvestDate: nowStr,
      packingDate: `${nowStr} (Packhouse-1)`,
      qualityGrade: batchGrade,
      pesticideFree: true,
      soilHealthIndex: batchSoilCarbon,
      temperatureAtTransit: '16°C (Aerated Crates)',
      timeline: [
        {
          stage: 'Harvest Logged',
          timestamp: nowStr,
          location: farmerProfile.farmName,
          details: `Harvested from ${batchFieldId}. Quality graded ${batchGrade}.`,
        },
      ],
    };

    createBatch(newBatch);
    setSelectedBatchId(batchId);
    setIsBatchModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f4ee] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Farmer Header & Profile Banner */}
        <div className="rounded-3xl bg-[#183c2a] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 shrink-0">
                <Tractor className="h-8 w-8 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#c5a880]">
                    Producer & Seller Console
                  </span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    Verified Organic
                  </span>
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  {farmerProfile.farmName}
                </h1>
                <p className="text-xs text-stone-300 mt-1 flex items-center gap-2">
                  <span>Farmer: <strong>{farmerProfile.name}</strong></span>
                  <span>•</span>
                  <span>{farmerProfile.location}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <QrCode className="h-4 w-4 text-amber-300" />
                <span>Log Harvest Batch</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-[#c5a880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#182019] hover:bg-[#d6ba94] shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Produce</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Orders Awaiting Prep
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
              {pendingPrepOrders.length} Orders
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Next pickup window in 45m</span>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Active Produce Catalog
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#183c2a] mt-1">
              {produceList.length} Items Listed
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              100% In-Stock & Verified
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Weekly Gross Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#182019] mt-1">
              ₹24,850
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              +26% higher than APMC Mandi
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Pending Settlement
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
              ₹6,380
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Auto-disburses via Razorpay T+1
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-white rounded-2xl p-1.5 shadow-sm gap-2 overflow-x-auto">
          {[
            { id: 'orders', label: 'Order Fulfillment Pipeline', icon: Package, count: pendingPrepOrders.length },
            { id: 'inventory', label: 'Manage Produce & Stock', icon: Layers, count: produceList.length },
            { id: 'earnings', label: 'Earnings & Mandi Comparison', icon: TrendingUp },
            { id: 'profile', label: 'Farm Profile & Certifications', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#183c2a] text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isSelected ? 'bg-white text-[#183c2a]' : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ORDER FULFILLMENT PIPELINE */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Awaiting Prep */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-sans text-lg font-bold text-[#182019]">
                    Incoming Customer Orders Awaiting Preparation
                  </h3>
                  <p className="text-xs text-stone-500">
                    Harvest, pack in aerated crates, seal with batch QR label, and mark ready for driver pickup.
                  </p>
                </div>
              </div>

              {pendingPrepOrders.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No orders currently waiting for preparation. You are all caught up!
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPrepOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 transition-all hover:bg-white hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#183c2a]">{order.id}</span>
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                              Status: {order.status}
                            </span>
                            <span className="text-[10px] text-stone-400">Placed: {order.createdAt}</span>
                          </div>
                          <div className="text-xs font-semibold text-stone-800 mt-1">
                            Customer: {order.customerName} ({order.customerPhone})
                          </div>
                          <div className="text-[11px] text-stone-500">{order.deliveryAddress}</div>
                        </div>

                        {/* Order Prep Action Controls */}
                        <div className="flex items-center gap-2">
                          {order.status === 'Order Confirmed' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'Preparing', 'Farmer started harvesting and crate packing.')}
                              className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.status === 'Preparing' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'Ready for Pickup', 'Packed in crate and staged at farm gate.')}
                              className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm"
                            >
                              Mark Ready for Pickup
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items in order */}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {order.items.map((item, i) => (
                          <div key={i} className="rounded-lg bg-white border border-stone-200 px-3 py-1.5 flex items-center gap-2">
                            <span className="font-bold text-stone-900">{item.name}</span>
                            <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 text-[10px]">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ready for Driver Pickup */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-sans text-base font-bold text-[#182019] mb-3">
                Crates Staged at Farm Gate (Ready for Pickup)
              </h3>
              {readyPickupOrders.length === 0 ? (
                <div className="py-6 text-center text-stone-400 text-xs">
                  No orders currently awaiting driver collection.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {readyPickupOrders.map((o) => (
                    <div key={o.id} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs">
                      <div className="flex justify-between font-bold text-emerald-900">
                        <span>{o.id}</span>
                        <span>₹{o.totalAmount}</span>
                      </div>
                      <div className="text-stone-600 mt-1">Deliver to: {o.deliveryAddress}</div>
                      <div className="mt-2 text-[11px] text-emerald-700 font-medium">
                        Waiting for Delivery Partner ({o.assignedDeliveryPartner?.name || 'Assigned Driver'})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & PRODUCE MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#182019]">
                  Live Produce Catalog & Available Stock
                </h3>
                <p className="text-xs text-stone-500">
                  Update quantities as you harvest, adjust prices, or list fresh crop varieties.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#183c2a] px-4 py-2 text-xs font-bold text-white hover:bg-[#2c5b3d]"
              >
                <Plus className="h-4 w-4" />
                <span>Add Crop</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] font-bold uppercase text-stone-400">
                    <th className="pb-3">Produce Item</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price / Unit</th>
                    <th className="pb-3">Stock Available</th>
                    <th className="pb-3">Trace Batch</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {produceList.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover border border-stone-200"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[10px] text-stone-400">{p.farmer}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[#183c2a]">
                        ₹{p.price} / {p.unit}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={p.availableQty}
                            onChange={(e) => updateProduceStock(p.id, Number(e.target.value))}
                            className="w-16 rounded border border-stone-200 px-2 py-1 font-bold text-stone-900"
                          />
                          <span className="text-stone-500">{p.unit}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-emerald-800 font-semibold">
                        {p.batchId}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeProduce(p.id)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EARNINGS & MANDI COMPARISON */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Total Disbursed Earnings
                </span>
                <div className="text-3xl font-black text-[#183c2a] mt-1">₹1,84,500</div>
                <div className="text-xs text-stone-500 mt-1">Direct to Bank via Razorpay Route</div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Middlemen Markup Eliminated
                </span>
                <div className="text-3xl font-black text-emerald-700 mt-1">₹39,200</div>
                <div className="text-xs text-stone-500 mt-1">Retained by farm family instead of agents</div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Average Mandi Premium
                </span>
                <div className="text-3xl font-black text-amber-700 mt-1">+24.6%</div>
                <div className="text-xs text-stone-500 mt-1">Versus standard wholesale APMC Mandi auction rate</div>
              </div>
            </div>

            {/* Settlements Table */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-sans text-base font-bold text-[#182019] mb-4">
                Razorpay Automated T+1 Settlement Disbursements
              </h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] font-bold uppercase text-stone-400">
                    <th className="pb-3">Settlement ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Order Count</th>
                    <th className="pb-3">Net Amount</th>
                    <th className="pb-3">UTR Reference</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {settlements.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 font-mono font-bold text-[#183c2a]">{s.id}</td>
                      <td className="py-3">{s.date}</td>
                      <td className="py-3">{s.orderCount} orders</td>
                      <td className="py-3 font-bold text-stone-900">₹{s.amount.toLocaleString()}</td>
                      <td className="py-3 font-mono text-[11px] text-stone-500">{s.utrNumber}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            s.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FARM PROFILE & CERTIFICATIONS */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-sans text-lg font-bold text-[#182019]">
                Farm Credentials & Soil Traceability Information
              </h3>
              <p className="text-xs text-stone-500">
                Customers view this verified information when scanning produce QR codes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <span className="font-bold text-stone-900 block">Organic Certification</span>
                <div className="text-stone-600">License: {farmerProfile.certificationNumber}</div>
                <div className="text-stone-600">Accreditation: NPOP India Certified Organic</div>
                <div className="text-emerald-700 font-semibold flex items-center gap-1 mt-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Inspected & Verified for 2026</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <span className="font-bold text-stone-900 block">Soil Health & Carbon Index</span>
                <div className="text-stone-600">Organic Carbon: {farmerProfile.soilCarbonIndex}</div>
                <div className="text-stone-600">Water Source: Solar-pumped Artesian Well</div>
                <div className="text-stone-600">Acreage: {farmerProfile.totalAcres} Acres Certified</div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD NEW PRODUCE */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <h3 className="font-sans text-xl font-bold text-[#182019] mb-4">
                List Fresh Harvest Produce
              </h3>
              <form onSubmit={handleCreateProduce} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Produce Name</label>
                  <input
                    type="text"
                    required
                    value={newProduceName}
                    onChange={(e) => setNewProduceName(e.target.value)}
                    placeholder="e.g. Cherry Tomatoes, Crisp Radish"
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 text-xs">Category</label>
                    <CustomSelect
                      value={newCategory}
                      onChange={(val) => setNewCategory(val as any)}
                      options={['Vegetables', 'Greens', 'Root', 'Exotic']}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 text-xs">Unit</label>
                    <CustomSelect
                      value={newUnit}
                      onChange={(val) => setNewUnit(val)}
                      options={['kg', 'bunch', '250g pack', '500g pack', 'box']}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Price (₹ per unit)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-300 p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Quantity Available</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newQty}
                      onChange={(e) => setNewQty(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-300 p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Produce Image URL</label>
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 text-[11px] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description & Notes</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Crisp, hand-picked morning harvest..."
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-stone-600 font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#183c2a] px-5 py-2 font-bold text-white hover:bg-[#2c5b3d]"
                  >
                    Publish to Marketplace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: LOG HARVEST BATCH */}
        {isBatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <h3 className="font-sans text-xl font-bold text-[#182019] mb-4">
                Log New Harvest Batch (QR Traceability)
              </h3>
              <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Produce Name</label>
                  <input
                    type="text"
                    required
                    value={batchProduceName}
                    onChange={(e) => setBatchProduceName(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Field Identifier</label>
                  <input
                    type="text"
                    value={batchFieldId}
                    onChange={(e) => setBatchFieldId(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Quality Grade</label>
                    <input
                      type="text"
                      value={batchGrade}
                      onChange={(e) => setBatchGrade(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Soil Carbon Status</label>
                    <input
                      type="text"
                      value={batchSoilCarbon}
                      onChange={(e) => setBatchSoilCarbon(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 p-2.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-stone-600 font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#183c2a] px-5 py-2 font-bold text-white hover:bg-[#2c5b3d]"
                  >
                    Generate Batch QR Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
