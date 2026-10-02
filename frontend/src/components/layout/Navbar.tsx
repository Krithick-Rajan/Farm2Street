import React from 'react';
import {
  ShoppingBag,
  Package,
  Tractor,
  Truck,
  ShieldCheck,
  User,
  LogIn,
  ChevronDown,
  Menu,
  LogOut,
} from 'lucide-react';
import { CurrentUser, UserRole } from '../../types';

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
    md: { circle: 'w-[36px] h-[36px]', icon: 'w-[19px] h-[19px]', text: 'text-[17px]' },
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

interface NavbarProps {
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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'delivery':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'admin':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/90 bg-[#fbfaf5]/95 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all">
      <div className="w-full flex h-[68px] sm:h-[72px] items-center justify-between px-3 sm:px-6 lg:px-10 gap-2 sm:gap-4">
        {/* Left End: Menu Toggle & Brand Logo */}
        <div className="flex items-center shrink-0">
          {onOpenLeftNav && (
            <div className="flex items-center pr-2.5 sm:pr-5 mr-2 sm:mr-3 border-r border-stone-200/90">
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

        {/* Desktop Navigation Links - Single line, non-wrapping, clean spacing */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] font-semibold text-[#2c3d31] whitespace-nowrap">
          <button
            type="button"
            onClick={onNavigateHome}
            className="transition-colors hover:text-[#183c2a] whitespace-nowrap py-1"
          >
            Fresh Produce
          </button>
          <a
            href="#farms"
            className="transition-colors hover:text-[#183c2a] whitespace-nowrap py-1"
          >
            Partner Farms
          </a>
          <button
            type="button"
            onClick={onOpenSubscriptions}
            className="transition-colors hover:text-[#183c2a] text-[#183c2a] whitespace-nowrap py-1 font-bold"
          >
            Subscription Plans
          </button>
          <a
            href="#discovery-3d"
            className="transition-colors hover:text-[#183c2a] whitespace-nowrap py-1"
          >
            3D Discovery
          </a>
          <a
            href="#traceability"
            className="transition-colors hover:text-[#183c2a] whitespace-nowrap py-1"
          >
            QR Traceability
          </a>
          <a
            href="#reviews"
            className="transition-colors hover:text-[#183c2a] whitespace-nowrap py-1"
          >
            Customer Reviews
          </a>
        </nav>

        {/* Right Side Actions - Evenly sized, horizontally aligned h-9 sm:h-10 pills */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap">
          {/* Track Orders Button */}
          {onOpenTracker && (
            <button
              type="button"
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 h-9 sm:h-10 rounded-full border border-stone-200/90 bg-white px-2.5 sm:px-3.5 text-xs font-semibold text-[#182019] shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition-all shrink-0 whitespace-nowrap cursor-pointer"
              title="Track Orders"
            >
              <Package className="h-4 w-4 text-[#183c2a]" />
              <span className="hidden xl:inline">Track</span>
              {activeOrdersCount > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse ml-0.5" />
              )}
            </button>
          )}

          {/* User Profile & Multi-Actor Login Portal Switcher */}
          {currentUser.id === 'guest' ? (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 h-9 sm:h-10 rounded-full border border-[#183c2a] bg-[#183c2a] hover:bg-[#225037] text-white px-3 sm:px-4 text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
              title="Sign In / Switch Actor Portal"
            >
              <User className="h-3.5 w-3.5 text-[#c5a880]" />
              <span>Sign In</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 rounded-full border border-stone-200 bg-white px-2 sm:px-3.5 text-xs font-semibold text-[#182019] shadow-2xs hover:border-[#183c2a]/40 hover:bg-stone-50 transition-all shrink-0 whitespace-nowrap cursor-pointer"
                title="Click to Switch Actor Login (Farmer, Delivery, Admin, Customer)"
              >
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#183c2a]/10 text-[#183c2a]">
                  {getRoleIcon(currentUser.role)}
                </div>
                <span className="font-bold text-[#182019] max-w-[55px] sm:max-w-[110px] truncate hidden xs:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 hidden md:inline">
                  {currentUser.role}
                </span>
                <ChevronDown className="h-3 w-3 text-stone-400 shrink-0" />
              </button>

              {/* Dedicated Log Out Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 h-9 sm:h-10 rounded-full border border-rose-200/80 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 px-2 sm:px-3 text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
                  title={`Sign out (${currentUser.name})`}
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              )}
            </>
          )}

          {/* Cart Basket */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="View Shopping Cart"
            className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 rounded-full bg-[#183c2a] px-3 sm:px-4 text-xs font-bold text-white shadow-sm hover:bg-[#214d36] active:scale-95 transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 text-[#c5a880]" />
            <span className="hidden sm:inline">Basket</span>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#c5a880] px-1.5 text-[11px] font-extrabold text-[#07100b]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
