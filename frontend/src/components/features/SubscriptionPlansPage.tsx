import React, { useState, useEffect } from 'react';
import {
  Check,
  Calendar,
  Users,
  PackageCheck,
  ArrowRight,
  Pause,
  Play,
  Trash2,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Truck,
  Leaf,
  Clock,
  Plus,
  Edit3,
  X,
  Sliders,
} from 'lucide-react';
import { SubscriptionBox } from '../../types';
import { useFarm } from '../../context/FarmContext';
import { FarmLogo } from '../layout/Navbar';

interface SubscriptionPlansPageProps {
  onBackToMarketplace: () => void;
  onSubscribe?: (box: SubscriptionBox, frequency: string) => void;
}

export const SubscriptionPlansPage: React.FC<SubscriptionPlansPageProps> = ({
  onBackToMarketplace,
  onSubscribe,
}) => {
  const {
    currentUser,
    subscriptionPlans,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    subscriptions,
    toggleSubscription,
    addSubscription,
    setIsLoginModalOpen,
  } = useFarm();

  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [subscribedId, setSubscribedId] = useState<string | null>(null);
  const [pendingBox, setPendingBox] = useState<SubscriptionBox | null>(null);

  const isGuest = currentUser.id === 'guest' || currentUser.name === 'Guest User' || !currentUser.emailOrPhone;

  useEffect(() => {
    if (pendingBox && !isGuest) {
      const box = pendingBox;
      setPendingBox(null);
      if (onSubscribe) {
        onSubscribe(box, frequency);
      }
      addSubscription(box, frequency);
      setSubscribedId(box.id);
      setTimeout(() => setSubscribedId(null), 2500);
    }
  }, [pendingBox, isGuest, onSubscribe, frequency, addSubscription]);

  // Admin Customization Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionBox | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    pricePerWeek: 399,
    weightApprox: '4.5 - 5.5 kg',
    suitableFor: '2-4 People',
    badgeText: '',
    popular: false,
    itemsIncludedStr: 'Tomatoes (1 kg), Spinach (2 bunches), Farm Carrots (500g)',
    featuresStr: 'Morning field harvest SLA, Zero cold storage, Electric transit',
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      tagline: '',
      pricePerWeek: 399,
      weightApprox: '4.5 - 5.5 kg',
      suitableFor: '2-4 People',
      badgeText: 'NEW HARVEST PLAN',
      popular: false,
      itemsIncludedStr: 'Fresh Greens (1kg), Vine Tomatoes (1kg), Farm Carrots (500g), Fresh Herbs, Field Guarantee',
      featuresStr: 'Morning field harvest SLA, Temperature monitored electric cargo transit, Zero cold storage',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionBox) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      tagline: plan.tagline,
      pricePerWeek: plan.pricePerWeek,
      weightApprox: plan.weightApprox,
      suitableFor: plan.suitableFor,
      badgeText: plan.badgeText || '',
      popular: !!plan.popular,
      itemsIncludedStr: plan.itemsIncluded.join(', '),
      featuresStr: (plan.features || []).join(', '),
    });
  };

  const handleSaveNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newPlan: SubscriptionBox = {
      id: `box-custom-${Date.now().toString().slice(-5)}`,
      name: formData.name.trim(),
      tagline: formData.tagline.trim() || 'Custom farm harvest curated directly from regional growers',
      pricePerWeek: Number(formData.pricePerWeek) || 299,
      weightApprox: formData.weightApprox || '4 - 5 kg',
      suitableFor: formData.suitableFor || 'Families',
      popular: formData.popular,
      badgeText: formData.badgeText.trim() || undefined,
      isCustom: true,
      itemsIncluded: formData.itemsIncludedStr.split(',').map((s) => s.trim()).filter(Boolean),
      features: formData.featuresStr.split(',').map((s) => s.trim()).filter(Boolean),
    };

    addSubscriptionPlan(newPlan);
    setIsAddModalOpen(false);
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !formData.name.trim()) return;

    updateSubscriptionPlan(editingPlan.id, {
      name: formData.name.trim(),
      tagline: formData.tagline.trim(),
      pricePerWeek: Number(formData.pricePerWeek) || 299,
      weightApprox: formData.weightApprox,
      suitableFor: formData.suitableFor,
      popular: formData.popular,
      badgeText: formData.badgeText.trim() || undefined,
      itemsIncluded: formData.itemsIncludedStr.split(',').map((s) => s.trim()).filter(Boolean),
      features: formData.featuresStr.split(',').map((s) => s.trim()).filter(Boolean),
    });

    setEditingPlan(null);
  };

  const handleSubscribe = (box: SubscriptionBox) => {
    if (isGuest) {
      setPendingBox(box);
      setIsLoginModalOpen(true);
      return;
    }
    if (onSubscribe) {
      onSubscribe(box, frequency);
    }
    addSubscription(box, frequency);
    setSubscribedId(box.id);
    setTimeout(() => setSubscribedId(null), 2500);
  };

  // Show all harvest plans (filtering out any deprecated business crates)
  const displayedPlans = subscriptionPlans.filter(
    (p) => !p.tierCategory || p.tierCategory === 'personal'
  );

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#f5f4ee] py-8 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#183c2a] border border-stone-200 hover:bg-stone-50 shadow-xs transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </button>
          <div className="flex items-center gap-2">
            <FarmLogo size="sm" onClick={onBackToMarketplace} />
            <span className="text-xs text-stone-400">/</span>
            <span className="text-xs text-stone-700 font-semibold">
              Subscription Plans
            </span>
          </div>
        </div>

        {/* Delivery Frequency Cadence Pill (Only Cadence Toggle, No Personal/Business) */}
        <div className="flex items-center justify-center pt-2">
          <div className="inline-flex items-center rounded-full bg-white p-1 border border-stone-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => setFrequency('weekly')}
              className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                frequency === 'weekly'
                  ? 'bg-[#183c2a] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Every Week
            </button>
            <button
              type="button"
              onClick={() => setFrequency('biweekly')}
              className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                frequency === 'biweekly'
                  ? 'bg-[#183c2a] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Every 2 Weeks (Save 5%)
            </button>
          </div>
        </div>

        {/* Admin Plan Governance Bar */}
        {isAdmin && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#183c2a] text-white flex items-center justify-center font-bold">
                <Sliders className="h-4 w-4 text-[#c5a880]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183c2a] uppercase tracking-wider">
                  Admin Plan Customization Console
                </div>
                <div className="text-[11px] text-stone-600">
                  SuperAdmin access active: you can modify prices, edit items, or add new generic plans below.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-full bg-[#183c2a] hover:bg-[#2c5b3d] text-white px-5 py-2 text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#c5a880]" />
              <span>+ Add New Subscription Plan</span>
            </button>
          </div>
        )}

        {/* 4-Tier Plan Grid EXACTLY Matching Image 1 UI/UX Design System with Perfectly Equalized Boxes */}
        <div
          className={`grid gap-6 lg:gap-8 items-stretch ${
            displayedPlans.length <= 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : displayedPlans.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {displayedPlans.map((box) => {
            const isSubscribed = subscribedId === box.id;
            const price =
              frequency === 'weekly'
                ? box.pricePerWeek
                : Math.round(box.pricePerWeek * 2 * 0.95);
            const cycleText = frequency === 'weekly' ? '/week' : '/2 weeks';
            const isPopular = box.popular;

            return (
              <div
                key={box.id}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-200 h-full ${
                  isPopular
                    ? 'bg-[#183c2a] text-white shadow-xl border-2 border-[#c5a880]'
                    : 'bg-white text-[#182019] border border-stone-200/90 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Floating Most Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#c5a880] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#07100b] shadow-md whitespace-nowrap">
                    {box.badgeText || 'MOST POPULAR'}
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  {/* Title & Tagline - Symmetrical Heights across all 4 cards */}
                  <div className="mb-5">
                    <div className="h-14 flex items-center">
                      <h3
                        className={`font-sans text-xl sm:text-2xl font-bold tracking-tight line-clamp-2 ${
                          isPopular ? 'text-white' : 'text-[#182019]'
                        }`}
                      >
                        {box.name}
                      </h3>
                    </div>
                    <div className="h-12 mt-2 flex items-start">
                      <p
                        className={`text-xs leading-relaxed line-clamp-2 ${
                          isPopular ? 'text-emerald-100/80' : 'text-stone-500'
                        }`}
                      >
                        {box.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price Display - Symmetrical Heights across all 4 cards */}
                  <div
                    className={`mb-5 pb-5 border-b ${
                      isPopular ? 'border-white/10' : 'border-stone-100'
                    }`}
                  >
                    <div className="h-11 flex items-baseline gap-1.5">
                      {isPopular && (
                        <span className="text-emerald-300/60 line-through text-base font-bold mr-1">
                          ₹{price + 200}
                        </span>
                      )}
                      <span className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight">
                        ₹{price}
                      </span>
                      <span
                        className={`text-xs ${
                          isPopular ? 'text-emerald-200' : 'text-stone-500'
                        }`}
                      >
                        {cycleText}
                      </span>
                    </div>

                    {/* Metadata (Household & Weight approx) */}
                    <div className="flex items-center gap-4 mt-3 text-xs opacity-90 h-6">
                      <span className="flex items-center gap-1.5 truncate">
                        <Users
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isPopular ? 'text-[#c5a880]' : 'text-[#a48256]'
                          }`}
                        />
                        <span className={isPopular ? 'text-emerald-100' : 'text-stone-600'}>
                          {box.suitableFor}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <PackageCheck
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isPopular ? 'text-[#c5a880]' : 'text-[#a48256]'
                          }`}
                        />
                        <span className={isPopular ? 'text-emerald-100' : 'text-stone-600'}>
                          {box.weightApprox}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* What's In This Box Section - Equalized 5-item Height */}
                  <div className="mb-5 space-y-4 flex-1">
                    <div className="min-h-[175px]">
                      <div
                        className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${
                          isPopular ? 'text-[#c5a880]' : 'text-[#a48256]'
                        }`}
                      >
                        What's in this box
                      </div>
                      <ul className="space-y-2.5 text-xs">
                        {box.itemsIncluded.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check
                              className={`h-4 w-4 shrink-0 mt-0.5 ${
                                isPopular ? 'text-[#c5a880]' : 'text-emerald-700'
                              }`}
                            />
                            <span
                              className={
                                isPopular ? 'text-emerald-50' : 'text-stone-700'
                              }
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Additional Features / Harvest Advantages - Equalized 3-item Height */}
                    {box.features && box.features.length > 0 && (
                      <div
                        className={`pt-3 border-t border-dashed min-h-[105px] ${
                          isPopular ? 'border-white/10' : 'border-stone-100'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                            isPopular ? 'text-emerald-200' : 'text-stone-400'
                          }`}
                        >
                          Harvest Advantages
                        </div>
                        <ul className="space-y-2 text-[11px]">
                          {box.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                  isPopular ? 'bg-[#c5a880]' : 'bg-[#183c2a]'
                                }`}
                              />
                              <span
                                className={
                                  isPopular ? 'text-emerald-100/90' : 'text-stone-600'
                                }
                              >
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA Button & Admin Tools */}
                <div
                  className={`space-y-3 pt-4 mt-auto border-t ${
                    isPopular ? 'border-white/10' : 'border-stone-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSubscribe(box)}
                    className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer ${
                      isPopular
                        ? 'bg-[#c5a880] text-[#183c2a] hover:bg-[#d8be98]'
                        : 'bg-[#183c2a] text-white hover:bg-[#2c5b3d]'
                    }`}
                  >
                    {isSubscribed ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Subscription Added!</span>
                      </>
                    ) : (
                      <>
                        <span>Start Subscription</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>

                  {/* Admin Customization Controls on Card */}
                  {isAdmin && (
                    <div
                      className={`border-t pt-2 flex items-center justify-between text-xs ${
                        isPopular ? 'border-white/15' : 'border-stone-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openEditModal(box)}
                        className={`flex items-center gap-1 font-bold ${
                          isPopular ? 'text-[#c5a880] hover:text-white' : 'text-emerald-800 hover:text-emerald-950'
                        }`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Plan</span>
                      </button>
                      {box.isCustom && (
                        <button
                          type="button"
                          onClick={() => deleteSubscriptionPlan(box.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 font-bold"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Customer Subscriptions Section */}
        {subscriptions.length > 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#a48256]">
                    Active Subscriptions
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                    Recurring Escrow Active
                  </span>
                </div>
                <h2 className="font-sans text-xl font-bold text-[#182019] mt-1">
                  Your Recurring Deliveries
                </h2>
                <p className="text-xs text-stone-500">
                  Pause when traveling, modify frequency, or cancel anytime with 1 click.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-stone-200 bg-[#fbfaf5] p-5 text-xs space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#182019]">{sub.boxName}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        sub.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'paused'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="text-stone-600 space-y-1">
                    <div>Frequency: <strong className="capitalize">{sub.frequency}</strong></div>
                    <div>Delivery Schedule: <strong>{sub.deliveryDay}</strong></div>
                    <div>Next Expected Arrival: <strong className="text-emerald-800">{sub.nextDeliveryDate}</strong></div>
                    <div>Price per Cycle: <strong>₹{sub.pricePerCycle}</strong></div>
                  </div>

                  {/* Controls */}
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <div className="text-[10px] text-stone-400">Subscribed: {sub.subscribedSince}</div>
                    <div className="flex items-center gap-2">
                      {sub.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => toggleSubscription(sub.id, 'pause')}
                          className="flex items-center gap-1 rounded-lg bg-amber-100 text-amber-900 px-3 py-1.5 font-bold hover:bg-amber-200 cursor-pointer"
                        >
                          <Pause className="h-3 w-3" />
                          <span>Pause</span>
                        </button>
                      ) : sub.status === 'paused' ? (
                        <button
                          type="button"
                          onClick={() => toggleSubscription(sub.id, 'resume')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-100 text-emerald-900 px-3 py-1.5 font-bold hover:bg-emerald-200 cursor-pointer"
                        >
                          <Play className="h-3 w-3" />
                          <span>Resume</span>
                        </button>
                      ) : null}

                      {sub.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => toggleSubscription(sub.id, 'cancel')}
                          className="flex items-center gap-1 rounded-lg text-red-600 px-2.5 py-1.5 font-bold hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Leaf className="h-5 w-5" />
            </div>
            <h4 className="font-sans font-bold text-stone-900">Zero Middlemen Harvest</h4>
            <p className="text-stone-500 leading-relaxed">
              Harvested at sunrise from verified regional organic micro-farms. Never stored in commercial cold rooms.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Clock className="h-5 w-5" />
            </div>
            <h4 className="font-sans font-bold text-stone-900">6-Hour Delivery SLA</h4>
            <p className="text-stone-500 leading-relaxed">
              Packed in biodegradable sugarcane pulp trays and delivered to your doorstep within 6 hours of harvest.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-sans font-bold text-stone-900">Batch QR Provenance</h4>
            <p className="text-stone-500 leading-relaxed">
              Each crate is tagged with an immutable QR code linking directly to soil test certificates and harvest logs.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          ADMIN MODAL: ADD NEW SUBSCRIPTION PLAN
      ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-sans text-lg font-bold text-stone-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-700" />
                <span>Create New Subscription Plan</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPlan} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydroponic Greens Basket"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Headline / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Crisp pesticide-free greens harvested at dawn"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price per Week (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.pricePerWeek}
                    onChange={(e) => setFormData({ ...formData, pricePerWeek: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CHEF CHOICE, POPULAR"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Weight Approx</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 - 5 kg"
                    value={formData.weightApprox}
                    onChange={(e) => setFormData({ ...formData, weightApprox: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Suitable For</label>
                  <input
                    type="text"
                    placeholder="e.g. 2-3 People"
                    value={formData.suitableFor}
                    onChange={(e) => setFormData({ ...formData, suitableFor: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Included Produce Items (comma separated)</label>
                <textarea
                  rows={2}
                  value={formData.itemsIncludedStr}
                  onChange={(e) => setFormData({ ...formData, itemsIncludedStr: e.target.value })}
                  placeholder="Tomatoes (1 kg), Spinach (2 bunches), Carrots (500g)"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Key Features (comma separated)</label>
                <textarea
                  rows={2}
                  value={formData.featuresStr}
                  onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
                  placeholder="Same-day doorstep delivery, Cryptographic provenance QR, Free eco packaging"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="rounded text-emerald-700 focus:ring-0"
                  />
                  <span className="font-semibold text-stone-700">Highlight as Featured / Most Popular</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#183c2a] text-white font-bold hover:bg-[#2c5b3d] shadow-md cursor-pointer"
                >
                  Save & Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADMIN MODAL: EDIT EXISTING PLAN
      ========================================================= */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-sans text-lg font-bold text-stone-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-emerald-700" />
                <span>Edit Plan: {editingPlan.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price per Week (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.pricePerWeek}
                    onChange={(e) => setFormData({ ...formData, pricePerWeek: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CHEF CHOICE, POPULAR"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Weight Approx</label>
                  <input
                    type="text"
                    value={formData.weightApprox}
                    onChange={(e) => setFormData({ ...formData, weightApprox: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Suitable For</label>
                  <input
                    type="text"
                    value={formData.suitableFor}
                    onChange={(e) => setFormData({ ...formData, suitableFor: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Included Produce Items (comma separated)</label>
                <textarea
                  rows={2}
                  value={formData.itemsIncludedStr}
                  onChange={(e) => setFormData({ ...formData, itemsIncludedStr: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Key Features (comma separated)</label>
                <textarea
                  rows={2}
                  value={formData.featuresStr}
                  onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="rounded text-emerald-700 focus:ring-0"
                  />
                  <span className="font-semibold text-stone-700">Highlight as Featured / Most Popular</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#183c2a] text-white font-bold hover:bg-[#2c5b3d] shadow-md cursor-pointer"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
