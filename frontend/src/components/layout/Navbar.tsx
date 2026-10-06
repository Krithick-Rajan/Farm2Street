import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Package,
  Tractor,
  Truck,
  ShieldCheck,
  User,
  ChevronDown,
  Menu,
  LogOut,
  X,
  Sprout,
  Layers,
  QrCode,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { CurrentUser, UserRole } from '../../types';
import { useFarm } from '../../context/FarmContext';

/* =========================================================================
   1. FARM LOGO
   ========================================================================= */

export interface FarmLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subtext?: string;
  className?: string;
  onClick?: () => void;
}

export const FarmLogo: React.FC<FarmLogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'text-[#182019]',
  subtext,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { circle: 'w-[28px] h-[28px]', icon: 'w-[15px] h-[15px]', text: 'text-[15px]' },
    md: { circle: 'w-[30px] sm:w-[36px] h-[30px] sm:h-[36px]', icon: 'w-[16px] sm:w-[19px] h-[16px] sm:h-[19px]', text: 'text-[15px] sm:text-[17px]' },
    lg: { circle: 'w-[44px] h-[44px]', icon: 'w-[24px] h-[24px]', text: 'text-[20px]' },
    xl: { circle: 'w-[56px] h-[56px]', icon: 'w-[30px] h-[30px]', text: 'text-[26px]' },
  };

  const current = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-[10px] select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <div
        className={`${current.circle} rounded-full bg-[#183c2a] text-white grid place-items-center shrink-0 shadow-sm border border-emerald-950/40 transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={current.icon}
        >
          <path d="M12 21c0-7 3-11 9-14-1 7-4 12-9 14Z" />
          <path d="M12 21c0-6-2-10-7-13 0 6 2 11 7 13Z" />
        </svg>
      </div>

      {showText && (
        <div>
          <span className={`font-sans ${current.text} font-bold tracking-[-0.035em] ${textColor} block leading-none`}>
            Farm2Street
          </span>
          {subtext && (
            <span className="text-[10px] text-stone-500 font-medium tracking-tight hidden sm:block mt-0.5">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   2. SHARED ROLE HELPERS
   ========================================================================= */

const roleNameMap: Record<UserRole, { short: string; full: string; mobile: string }> = {
  customer: { short: 'Market', full: 'Customer Portal', mobile: 'Market' },
  farmer: { short: 'Farmer Console', full: 'Farmer Producer Console', mobile: 'Console' },
  delivery: { short: 'Delivery Hub', full: 'Delivery Partner Portal', mobile: 'Fleet' },
  admin: { short: 'Admin Center', full: 'SuperAdmin Governance', mobile: 'Admin' },
};

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'farmer':
      return <Tractor className="h-3.5 w-3.5 text-amber-700" />;
    case 'delivery':
      return <Truck className="h-3.5 w-3.5 text-sky-700" />;
    case 'admin':
      return <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />;
    default:
      return <User className="h-3.5 w-3.5 text-emerald-700" />;
  }
};

const getRoleView = (role: UserRole) => {
  if (role === 'farmer') return 'farmer';
  if (role === 'delivery') return 'delivery';
  if (role === 'admin') return 'admin';
  return 'marketplace';
};

/* =========================================================================
   3. PRIMARY NAVBAR
   ========================================================================= */

export interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  currentUser: CurrentUser;
  onOpenLoginModal: () => void;
  onOpenTracker?: () => void;
  onOpenSubscriptions: () => void;
  onNavigateHome: () => void;
  onOpenLeftNav?: () => void;
  activeOrdersCount?: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  currentUser,
  onOpenLoginModal,
  onOpenTracker,
  onOpenSubscriptions,
  onNavigateHome,
  onOpenLeftNav,
  activeOrdersCount = 0,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'marketplace' | 'farms' | 'discovery-3d' | 'traceability' | 'reviews'>('marketplace');

  const { activeView, setActiveView } = useFarm();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 15);

      // ScrollSpy section detection
      const sections: Array<{ id: 'reviews' | 'traceability' | 'discovery-3d' | 'farms'; offset: number }> = [
        { id: 'reviews', offset: 280 },
        { id: 'traceability', offset: 280 },
        { id: 'discovery-3d', offset: 280 },
        { id: 'farms', offset: 280 },
      ];

      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= sec.offset) {
            setActiveSection(sec.id);
            return;
          }
        }
      }
      setActiveSection('marketplace');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{ backgroundColor: '#f5f4ee' }}
      className="fixed top-0 left-0 right-0 z-50 w-full bg-[#f5f4ee] border-b border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all"
    >
      <div className="w-full max-w-[1800px] mx-auto flex h-[68px] sm:h-[72px] items-center justify-between px-2.5 sm:px-4 lg:px-6 xl:px-8 gap-1.5 sm:gap-3">
        {/* Left End: Menu Toggle & Brand Logo */}
        <div className="flex items-center shrink-0">
          {onOpenLeftNav && (
            <div className="flex items-center pr-2 sm:pr-3.5 mr-2 sm:mr-3 border-r border-stone-200/90">
              <button
                type="button"
                onClick={onOpenLeftNav}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50 text-[#183c2a] shadow-2xs transition-all shrink-0 cursor-pointer"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-[#183c2a]" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onNavigateHome}
            className="group text-left shrink-0"
          >
            <FarmLogo size="md" subtext="Direct Agri-Marketplace" />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-[13px] font-semibold text-[#2c3d31] whitespace-nowrap">
          <button
            type="button"
            onClick={onNavigateHome}
            className={`py-1 transition-colors hover:text-[#183c2a] ${
              activeSection === 'marketplace' && activeView === 'marketplace' ? 'text-[#183c2a] font-bold' : 'text-[#2c3d31]'
            }`}
          >
            <span>Fresh Produce</span>
          </button>
          <a
            href="#farms"
            className={`py-1 transition-colors hover:text-[#183c2a] ${
              activeSection === 'farms' ? 'text-[#183c2a] font-bold' : 'text-[#2c3d31]'
            }`}
          >
            <span>Partner Farms</span>
          </a>
          <button
            type="button"
            onClick={onOpenSubscriptions}
            className="py-1 transition-colors text-[#2c3d31] hover:text-[#183c2a] font-semibold"
          >
            <span>Subscription Plans</span>
          </button>
          <a
            href="#discovery-3d"
            className={`py-1 transition-colors hover:text-[#183c2a] hidden 2xl:inline ${
              activeSection === 'discovery-3d' ? 'text-[#183c2a] font-bold' : 'text-[#2c3d31]'
            }`}
          >
            <span>3D Discovery</span>
          </a>
          <a
            href="#traceability"
            className={`py-1 transition-colors hover:text-[#183c2a] hidden 2xl:inline ${
              activeSection === 'traceability' ? 'text-[#183c2a] font-bold' : 'text-[#2c3d31]'
            }`}
          >
            <span>QR Traceability</span>
          </a>
          <a
            href="#reviews"
            className={`py-1 transition-colors hover:text-[#183c2a] hidden 2xl:inline ${
              activeSection === 'reviews' ? 'text-[#183c2a] font-bold' : 'text-[#2c3d31]'
            }`}
          >
            <span>Customer Reviews</span>
          </a>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
          {onOpenTracker && (
            <button
              type="button"
              onClick={onOpenTracker}
              className="hidden sm:flex items-center justify-center gap-1.5 h-8.5 sm:h-10 rounded-full border border-stone-200/90 bg-white px-2.5 sm:px-3 text-xs font-semibold text-[#182019] shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition-all shrink-0 whitespace-nowrap cursor-pointer"
              title="Track Orders"
            >
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#183c2a]" />
              <span className="hidden 2xl:inline">Track</span>
              {activeOrdersCount > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse ml-0.5" />
              )}
            </button>
          )}

          {currentUser.id === 'guest' ? (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 h-8.5 sm:h-10 rounded-full border border-[#183c2a] bg-[#183c2a] hover:bg-[#225037] text-white px-3 sm:px-4 text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
              title="Sign In / Switch Actor Portal"
            >
              <User className="h-3.5 w-3.5 text-[#c5a880]" />
              <span>Sign In</span>
            </button>
          ) : (
            <>
              {/* Prominent Dashboard / Market Toggle Button for Farmer, Delivery, Admin */}
              {currentUser.role !== 'customer' && (
                activeView !== currentUser.role ? (
                  <button
                    type="button"
                    onClick={() => setActiveView(getRoleView(currentUser.role))}
                    className="flex items-center gap-1 sm:gap-1.5 h-8.5 sm:h-10 rounded-full bg-[#183c2a] hover:bg-[#225037] text-white px-2 sm:px-3.5 text-xs font-bold transition-all shadow-sm cursor-pointer border border-[#c5a880]/40 shrink-0"
                    title={`Open ${roleNameMap[currentUser.role].full}`}
                  >
                    {getRoleIcon(currentUser.role)}
                    <span className="hidden sm:inline">Go to {roleNameMap[currentUser.role].short}</span>
                    <span className="sm:hidden text-[11px] font-bold">{roleNameMap[currentUser.role].mobile}</span>
                    <ArrowRight className="h-3 w-3 text-[#c5a880] hidden xs:inline" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveView('marketplace')}
                    className="flex items-center gap-1 sm:gap-1.5 h-8.5 sm:h-10 rounded-full bg-white hover:bg-stone-50 text-[#183c2a] border border-stone-200 px-2 sm:px-3.5 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                    title="Browse Fresh Marketplace"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-[#183c2a]" />
                    <span className="hidden sm:inline">Browse Marketplace</span>
                    <span className="sm:hidden text-[11px] font-bold">Market</span>
                  </button>
                )
              )}

              {/* Profile Pill - compact on mobile, detailed on desktop */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser.role !== 'customer') {
                    if (activeView === currentUser.role) {
                      setActiveView('marketplace');
                    } else {
                      setActiveView(getRoleView(currentUser.role));
                    }
                  } else {
                    onOpenLoginModal();
                  }
                }}
                className="flex items-center gap-1 sm:gap-2 h-8.5 sm:h-10 rounded-full border border-stone-200 bg-white px-1.5 sm:px-3 text-xs font-semibold text-[#182019] shadow-2xs hover:border-[#183c2a]/40 hover:bg-stone-50 transition-all shrink-0 whitespace-nowrap cursor-pointer"
                title={currentUser.role !== 'customer' ? `Click to toggle ${roleNameMap[currentUser.role].short}` : 'Click to Switch Actor'}
              >
                <div className="flex h-5.5 w-5.5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#183c2a]/10 text-[#183c2a]">
                  {getRoleIcon(currentUser.role)}
                </div>
                <span className="font-bold text-[#182019] max-w-[80px] truncate hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 hidden 2xl:inline">
                  {currentUser.role}
                </span>
              </button>

              {/* Standalone Logout on tablet/desktop (accessible via left drawer on mobile) */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="hidden sm:flex items-center justify-center gap-1.5 h-8.5 sm:h-10 rounded-full border border-rose-200/80 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 px-2.5 sm:px-3 text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
                  title={`Sign out (${currentUser.name})`}
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-600" />
                  <span className="hidden 2xl:inline">Log Out</span>
                </button>
              )}
            </>
          )}

          {/* Cart / Basket Button */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="View Shopping Cart"
            className="flex items-center gap-1 sm:gap-2 h-8.5 sm:h-10 rounded-full bg-[#183c2a] px-2.5 sm:px-3.5 text-xs font-bold text-white shadow-sm hover:bg-[#214d36] active:scale-95 transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#c5a880]" />
            <span className="hidden sm:inline">Basket</span>
            {cartCount > 0 && (
              <span className="flex h-4 min-w-[16px] sm:h-5 sm:min-w-[20px] items-center justify-center rounded-full bg-[#c5a880] px-1 text-[9px] sm:text-[10px] font-black text-[#07100b]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

/* =========================================================================
   3. LEFT SLIDE-OUT DRAWER NAVIGATION
   ========================================================================= */

export interface LeftSlideNavProps {
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
  } = useFarm();

  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;

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
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        style={{ backgroundColor: '#f5f4ee' }}
        className={`fixed top-0 bottom-0 left-0 z-50 w-[320px] max-w-[90vw] bg-[#f5f4ee] text-[#182019] shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-stone-200/90 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between bg-[#ece8dc] shrink-0">
          <FarmLogo
            size="sm"
            textColor="text-[#182019]"
            onClick={() => {
              setActiveView('marketplace');
              onClose();
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Navigation"
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clean, Non-overlapping User Profile Row */}
        <div className="p-3.5 bg-white border-b border-stone-200 shadow-2xs shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-[#183c2a] border border-emerald-950/20 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#182019] truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-700 capitalize font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span className="truncate">{currentUser.role} Portal</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('login');
                }}
                title="Switch User / Sign In"
                className="text-[10px] font-bold text-stone-700 hover:text-stone-900 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        {/* High-Visibility Return to Role Dashboard Button */}
        {currentUser.id !== 'guest' && currentUser.role !== 'customer' && (
          <div className="p-2.5 bg-[#eef4eb] border-b border-[#2d5a3c]/15 shrink-0">
            {activeView !== currentUser.role ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView(getRoleView(currentUser.role));
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#183c2a] text-white text-xs font-bold shadow-sm hover:bg-[#214f36] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getRoleIcon(currentUser.role)}
                  <span className="truncate">Open {roleNameMap[currentUser.role].full}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#c5a880] shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('marketplace');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-[#183c2a] text-xs font-bold shadow-2xs hover:bg-stone-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShoppingBag className="h-3.5 w-3.5 text-[#183c2a]" />
                  <span className="truncate">Browse Marketplace</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#183c2a] px-3 mb-2">
              Marketplace Exploration
            </div>
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all group cursor-pointer gap-2 ${
                  activeView === 'marketplace'
                    ? 'bg-[#183c2a] text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-[#182019] border border-stone-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`p-2 rounded-xl shrink-0 ${activeView === 'marketplace' ? 'bg-white/15 text-white' : 'bg-[#f5f4ee] text-[#183c2a]'}`}>
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span className="font-bold truncate">Fresh Produce</span>
                </div>
                <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${activeView === 'marketplace' ? 'bg-[#c5a880] text-[#07100b]' : 'bg-stone-100 text-stone-600'}`}>
                  Daily Harvest
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('subscriptions');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all group cursor-pointer gap-2 ${
                  activeView === 'subscriptions'
                    ? 'bg-[#183c2a] text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-[#182019] border border-stone-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`p-2 rounded-xl shrink-0 ${activeView === 'subscriptions' ? 'bg-white/15 text-white' : 'bg-[#f5f4ee] text-[#183c2a]'}`}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-bold truncate">Subscription Plans</span>
                </div>
                <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${activeView === 'subscriptions' ? 'bg-[#c5a880] text-[#07100b]' : 'bg-stone-100 text-stone-600'}`}>
                  Dedicated Page
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('farms')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold bg-white hover:bg-stone-100 text-[#182019] border border-stone-200/80 shadow-2xs transition-all group cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-[#f5f4ee] text-[#183c2a] shrink-0">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <span className="font-bold truncate">Partner Farms</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 shrink-0">
                  NPOP Certified
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('discovery-3d')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold bg-white hover:bg-stone-100 text-[#182019] border border-stone-200/80 shadow-2xs transition-all group cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-[#f5f4ee] text-[#183c2a] shrink-0">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="font-bold truncate">3D Harvest Discovery</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 shrink-0">
                  Interactive
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('traceability')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold bg-white hover:bg-stone-100 text-[#182019] border border-stone-200/80 shadow-2xs transition-all group cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-[#f5f4ee] text-[#183c2a] shrink-0">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="font-bold truncate">QR Traceability Engine</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 shrink-0">
                  Batch Provenance
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToSection('reviews')}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold bg-white hover:bg-stone-100 text-[#182019] border border-stone-200/80 shadow-2xs transition-all group cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-xl bg-[#f5f4ee] text-[#183c2a] shrink-0">
                    <Sparkles className="h-4 w-4 text-[#c5a880]" />
                  </div>
                  <span className="font-bold truncate">Customer Reviews</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#183c2a]/10 text-[#183c2a] shrink-0">
                  Verified Ratings
                </span>
              </button>
            </nav>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#183c2a] px-3 mb-2">
              Order Fulfillment
            </div>
            <div className="space-y-1.5">
              {onOpenTracker && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTracker();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 shadow-2xs transition-all text-xs text-[#182019] cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-bold text-[#182019] truncate">Live Order Tracker</div>
                      <div className="text-[10px] text-stone-500 truncate">8-Stage GPS Tracking</div>
                    </div>
                  </div>
                  {activeOrdersCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#183c2a] text-white shrink-0">
                      {activeOrdersCount} Active
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
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
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 shadow-2xs text-xs text-[#182019] transition-all cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-stone-100 text-[#183c2a] shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="font-bold truncate">Shopping Basket</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#183c2a] px-3 mb-2">
              Multi-Actor Portals
            </div>
            <div className="space-y-1">
              {[
                { role: 'customer' as UserRole, label: 'Customer Portal', icon: User },
                { role: 'farmer' as UserRole, label: 'Farmer Producer Console', icon: Tractor },
                { role: 'delivery' as UserRole, label: 'Delivery Fleet Portal', icon: Truck },
                { role: 'admin' as UserRole, label: 'SuperAdmin Governance', icon: ShieldCheck },
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
                        ? 'bg-[#183c2a] text-white font-bold shadow-xs'
                        : 'bg-white hover:bg-stone-50 border border-stone-200/80 text-[#182019]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ActorIcon className={`h-3.5 w-3.5 ${isCurrent ? 'text-white' : 'text-stone-500'}`} />
                      <span>{actor.label}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[9px] uppercase font-bold text-[#183c2a] bg-[#c5a880] px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <ArrowRight className="h-3 w-3 text-stone-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-stone-200 bg-white shrink-0">
          {currentUser.id === 'guest' ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveView('login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#183c2a] hover:bg-[#23533b] transition-all cursor-pointer shadow-sm"
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
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span>Sign Out ({currentUser.name.split(' ')[0]})</span>
            </button>
          )}
        </div>

        <div className="p-3 border-t border-stone-200 bg-[#ece8dc] text-[10px] text-stone-600 shrink-0 flex items-center justify-between">
          <div>
            <span className="font-bold text-[#183c2a] uppercase tracking-wider block">24/7 Helpline</span>
            <span className="font-bold text-[#182019] text-xs">1800-FARM-2-STREET</span>
          </div>
          <span className="text-[9px] text-stone-500 text-right">Direct harvest<br />residue-free</span>
        </div>
      </aside>
    </>
  );
};

/* =========================================================================
   4. EDITORIAL FOOTER
   ========================================================================= */

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[rgba(24,32,25,0.08)] bg-[#0c140e] text-[#f5f4ee] py-16 px-5 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1 space-y-4">
          <FarmLogo size="md" textColor="text-white" />
          <p className="text-xs text-stone-400 leading-relaxed">
            Direct farmer-to-consumer vegetable marketplace with smart subscription boxes, refrigerated transit, and cryptographic produce traceability.
          </p>
          <div className="text-[11px] text-[#c5a880] font-semibold">
            Fresh from nearby farms directly to your doorstep.
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a880] mb-4">
            Marketplace
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-300">
            <li><a href="#marketplace" className="hover:text-white transition-colors">Morning Harvests</a></li>
            <li><a href="#subscription-boxes" className="hover:text-white transition-colors">Weekly Boxes</a></li>
            <li><a href="#discovery-3d" className="hover:text-white transition-colors">3D Produce Stage</a></li>
            <li><a href="#farms" className="hover:text-white transition-colors">Partner Micro-Farms</a></li>
            <li><a href="#reviews" className="hover:text-white transition-colors">Customer Reviews</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a880] mb-4">
            Traceability & Trust
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-300">
            <li><a href="#traceability" className="hover:text-white transition-colors">Scan Batch QR Code</a></li>
            <li><a href="#traceability" className="hover:text-white transition-colors">Pesticide Testing Lab</a></li>
            <li><a href="#traceability" className="hover:text-white transition-colors">Transit Temperature Log</a></li>
            <li><a href="#farms" className="hover:text-white transition-colors">Soil Health Audits</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a880] mb-4">
            Platform Roles
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-300">
            <li>Farmer Onboarding & Harvest Batches</li>
            <li>Delivery Partner Dispatch Console</li>
            <li>Customer Subscription Management</li>
            <li>Razorpay Settlement Engine</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <div>
          © 2026 Farm2Street Inc. Powered by Supabase Realtime PostgreSQL, Auth & Storage.
        </div>
        <div className="flex items-center gap-1 text-stone-400">
          <span>Crafted for ethical local agriculture</span>
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
        </div>
      </div>
    </footer>
  );
};
