import React, { useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Sprout,
  Layers,
  QrCode,
  Truck,
  Tractor,
  ShieldCheck,
  User,
  Sparkles,
  Database,
  ArrowRight,
  LogOut,
  ChevronRight,
  Package,
  FileText,
} from 'lucide-react';
import { FarmLogo } from './Navbar';
import { useFarm } from '../../context/FarmContext';
import { UserRole } from '../../types';

interface LeftSlideNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTracker?: () => void;
  onOpenCart?: () => void;
}

export const LeftSlideNav: React.FC<LeftSlideNavProps> = ({
  isOpen,
  onClose,
  onOpenTracker,
  onOpenCart,
}) => {
  const {
    currentUser,
    activeView,
    setActiveView,
    loginAsRole,
    logout,
    orders,
    isSupabaseConnected,
  } = useFarm();

  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;

  // Close drawer on Escape key and handle body lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const navigateToSection = (sectionId: string) => {
    onClose();
    if (activeView !== 'marketplace') {
      setActiveView('marketplace');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePortalSwitch = (role: UserRole) => {
    onClose();
    loginAsRole(role);
    if (role === 'farmer') setActiveView('farmer');
    else if (role === 'delivery') setActiveView('delivery');
    else if (role === 'admin') setActiveView('admin');
    else setActiveView('marketplace');
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Left Slide Drawer Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-[#0d1f15] text-white shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/25">
          <FarmLogo
            size="sm"
            textColor="text-white"
            onClick={() => {
              setActiveView('marketplace');
              onClose();
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Navigation"
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Session Mini-Card */}
        <div className="px-5 py-4 bg-[#14281c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#183c2a] border border-[#c5a880]/40 flex items-center justify-center font-bold text-[#c5a880] text-xs shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-[#c5a880] capitalize font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentUser.role} Portal</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveView('login');
              }}
              title="Switch User / Sign In"
              className="text-[11px] text-stone-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>Switch</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              title="Log Out"
              className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* 1. MARKETPLACE EXPLORATION */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a880] px-3 mb-2">
              Marketplace Exploration
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all group cursor-pointer ${
                  activeView === 'marketplace'
                    ? 'bg-[#183c2a] text-[#c5a880] border border-[#c5a880]/30 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-stone-300 group-hover:text-white">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span className="font-bold">Fresh Produce</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                  Daily Harvest
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('subscriptions');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all group cursor-pointer ${
                  activeView === 'subscriptions'
                    ? 'bg-[#183c2a] text-[#c5a880] border border-[#c5a880]/30 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#c5a880]/20 text-[#c5a880]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[#c5a880]">Subscription Plans</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c5a880] text-[#07100b]">
                  Dedicated Page
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('farms')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-stone-300 group-hover:text-white">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <span className="font-bold">Partner Farms</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                  NPOP Certified
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('discovery-3d')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-stone-300 group-hover:text-white">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="font-bold">3D Harvest Discovery</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                  Interactive
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('traceability')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-stone-300 group-hover:text-white">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="font-bold">QR Traceability Engine</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                  Batch Provenance
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('reviews')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-stone-300 group-hover:text-white">
                    <Sparkles className="h-4 w-4 text-[#c5a880]" />
                  </div>
                  <span className="font-bold">Customer Reviews</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#c5a880]">
                  Verified Ratings
                </span>
              </button>
            </nav>
          </div>

          {/* SYLLABUS DIRECT VIEWS: JSP, XML, SERVLETS */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a880] px-3 mb-2 flex items-center justify-between">
              <span>Jakarta EE &bull; JSP &bull; XML</span>
              <span className="text-[8px] bg-[#c5a880]/20 text-[#c5a880] px-1.5 py-0.5 rounded">Tomcat</span>
            </div>
            <div className="space-y-1">
              <a
                href="orders.jsp"
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>JSP Live Orders Log</span>
                </div>
                <span className="text-[9px] font-mono text-stone-500">orders.jsp</span>
              </a>

              <a
                href="catalog.jsp"
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Sprout className="h-3.5 w-3.5 text-[#c5a880]" />
                  <span>JSP Produce Catalog</span>
                </div>
                <span className="text-[9px] font-mono text-stone-500">catalog.jsp</span>
              </a>

              <a
                href="produce.xml"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  <span>XML Traceability Feed</span>
                </div>
                <span className="text-[9px] font-mono text-stone-500">produce.xml</span>
              </a>

              <a
                href="api/produce"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-3.5 w-3.5 text-sky-400" />
                  <span>Jakarta Produce Servlet</span>
                </div>
                <span className="text-[9px] font-mono text-stone-500">/api/produce</span>
              </a>
            </div>
          </div>

          {/* 2. ORDER FULFILLMENT & CART */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a880] px-3 mb-2">
              Order Fulfillment
            </div>
            <div className="space-y-1">
              {onOpenTracker && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTracker();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs text-white cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Live Order Tracker</div>
                      <div className="text-[10px] text-stone-400">8-Stage GPS Satellite Tracking</div>
                    </div>
                  </div>
                  {activeOrdersCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-stone-900">
                      {activeOrdersCount} Active
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-stone-500" />
                  )}
                </button>
              )}

              {onOpenCart && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenCart();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-xs text-stone-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-stone-300">
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="font-bold">Shopping Basket</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-500" />
                </button>
              )}
            </div>
          </div>

          {/* 3. MULTI-ACTOR PORTALS */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a880] px-3 mb-2">
              Multi-Actor Portals
            </div>
            <div className="space-y-1">
              {[
                { role: 'customer' as UserRole, label: 'Customer Portal', icon: User, view: 'marketplace' },
                { role: 'farmer' as UserRole, label: 'Farmer Producer Console', icon: Tractor, view: 'farmer' },
                { role: 'delivery' as UserRole, label: 'Delivery Fleet Portal', icon: Truck, view: 'delivery' },
                { role: 'admin' as UserRole, label: 'SuperAdmin Governance', icon: ShieldCheck, view: 'admin' },
              ].map((actor) => {
                const ActorIcon = actor.icon;
                const isCurrent = currentUser.role === actor.role;
                return (
                  <button
                    key={actor.role}
                    type="button"
                    onClick={() => handlePortalSwitch(actor.role)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-white/15 text-white font-bold'
                        : 'text-stone-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ActorIcon className="h-3.5 w-3.5 text-stone-400" />
                      <span>{actor.label}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <ArrowRight className="h-3 w-3 text-stone-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-3 border-t border-white/10 bg-[#0a150e]">
          {currentUser.id === 'guest' ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveView('login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#183c2a] hover:bg-[#23533b] border border-[#c5a880]/30 transition-all cursor-pointer shadow-sm"
            >
              <User className="h-3.5 w-3.5 text-[#c5a880]" />
              <span>Sign In / Switch Portal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-400" />
              <span>Sign Out ({currentUser.name.split(' ')[0]})</span>
            </button>
          )}
        </div>

        {/* Drawer Footer with Supabase Connection Badge */}
        <div className="p-3.5 border-t border-white/10 bg-black/40 text-[11px] text-stone-400 space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Database className="h-3 w-3" />
              <span>Supabase PostgreSQL 16</span>
            </div>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>
          <div className="text-[10px] text-stone-500">
            OpenStreetMap & Satellite Ortho Transit • Zero Google APIs
          </div>
        </div>
      </aside>
    </>
  );
};
