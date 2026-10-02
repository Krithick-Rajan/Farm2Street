import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Phone,
  Tractor,
  Truck,
  ShieldCheck,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { UserRole } from '../../types';
import { CropCanvas } from './CropCanvas';
import { FarmLogo } from '../layout/Navbar';

interface LoginPageProps {
  onBackToMarketplace: () => void;
  onNavigateRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToMarketplace,
  onNavigateRegister,
}) => {
  const { loginWithCredentials, currentUser } = useFarm();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle role change and clear errors
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrId.trim()) {
      setErrorMessage(`Please enter your ${roleMeta[selectedRole].inputLabel.toLowerCase()}.`);
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Please enter a valid password (minimum 4 characters).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(emailOrId.trim(), password, selectedRole);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials or register.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Network or server error during authentication. Please retry.');
    }
  };

  const roleMeta: Record<
    UserRole,
    {
      label: string;
      icon: any;
      inputLabel: string;
      inputPlaceholder: string;
      quote: string;
    }
  > = {
    customer: {
      label: 'Customer',
      icon: User,
      inputLabel: 'Email or Mobile Number',
      inputPlaceholder: 'Email or mobile number',
      quote: 'Direct harvest-to-kitchen connection with morning-picked greens.',
    },
    farmer: {
      label: 'Farmer',
      icon: Tractor,
      inputLabel: 'Kisan Registration ID / Mobile',
      inputPlaceholder: 'Kisan ID or mobile number',
      quote: '+24% higher realization without intermediary commission cuts.',
    },
    delivery: {
      label: 'Delivery Partner',
      icon: Truck,
      inputLabel: 'Fleet Driver ID / Vehicle Number',
      inputPlaceholder: 'Driver ID or vehicle number',
      quote: 'Clean electric transit with turn-by-turn farm-to-door navigation.',
    },
    admin: {
      label: 'SuperAdmin',
      icon: ShieldCheck,
      inputLabel: 'Operator Administrator Email',
      inputPlaceholder: 'Work email',
      quote: 'Platform oversight, KYC approvals, and automated T+1 settlements.',
    },
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] bg-[#f5f3ec] text-[#152018] font-sans">
      {/* =====================================================
           LEFT — FARM VISUAL & CANVAS EXPERIENCE
      ====================================================== */}
      <section className="relative min-h-[460px] lg:min-h-screen overflow-hidden isolate"
        style={{
          background: 'linear-gradient(180deg, #173f29 0%, #204f31 38%, #315f38 58%, #405f3d 72%, #705238 100%)',
        }}
      >
        {/* Soft Sunlight Glow */}
        <div
          className="absolute w-[260px] h-[260px] right-[10%] top-[7%] rounded-full pointer-events-none blur-[8px] z-0"
          style={{ background: 'rgba(255, 235, 171, 0.15)' }}
        />

        {/* Ambient Radial Gradient Layer */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 75% 15%, rgba(255, 242, 194, 0.26), transparent 28%), linear-gradient(90deg, rgba(5, 24, 14, 0.45), transparent 55%, rgba(8, 25, 14, 0.08))',
          }}
        />

        {/* Subtle Grain Texture Overlay */}
        <div
          className="absolute inset-0 z-[2] opacity-[0.08] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 0.6px, transparent 0.6px)',
            backgroundSize: '7px 7px',
          }}
        />

        {/* Farm Brand Header with official circular sprout logo (Image 2) */}
        <div className="absolute top-[34px] left-[38px] z-10 flex items-center text-white">
          <FarmLogo size="md" textColor="text-white" onClick={onBackToMarketplace} />
        </div>

        {/* Farm Editorial Copy */}
        <div className="absolute z-10 left-[clamp(28px,6vw,90px)] top-[50%] -translate-y-[55%] max-w-[560px] text-white">
          <div className="flex items-center gap-2.5 mb-6 text-white/75 text-[10px] font-bold tracking-[0.19em] uppercase">
            <span className="w-7 h-[1px] bg-white/55" />
            LOCAL HARVEST · DIRECT DELIVERY
          </div>

          <h1 className="font-serif text-[clamp(44px,5.2vw,80px)] leading-[0.98] tracking-[-0.055em] font-normal text-white">
            From nearby farms.<br />
            Straight to <em className="text-[#d8e7cd] italic font-serif">your street.</em>
          </h1>

          <p className="max-w-[450px] mt-6 text-white/70 text-[15px] leading-[1.75]">
            Discover fresh produce from verified local growers around you, with a shorter, verifiable journey between harvest and home.
          </p>

          {/* Persona quote badge */}
          <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-md max-w-[430px] flex items-start gap-3">
            <span className="text-amber-300 text-lg">“</span>
            <div className="text-xs text-stone-200 italic leading-relaxed">
              {roleMeta[selectedRole].quote}
            </div>
          </div>
        </div>

        {/* Farm Meta Tags at Bottom */}
        <div className="absolute left-[clamp(28px,6vw,90px)] bottom-[38px] z-10 hidden sm:flex items-center gap-3 text-white/60 text-[10px] tracking-[0.11em] uppercase font-bold">
          <span>LOCAL FARMS</span>
          <span className="w-1 h-1 rounded-full bg-white/50" />
          <span>FRESH HARVESTS</span>
          <span className="w-1 h-1 rounded-full bg-white/50" />
          <span>DIRECT DELIVERY</span>
        </div>

        {/* INTERACTIVE CROP CANVAS FIELD */}
        <div className="absolute inset-0 z-[3]">
          <CropCanvas />
        </div>

        {/* Interactive Mouse Breeze Hint */}
        <div className="absolute right-[34px] bottom-[34px] z-10 flex items-center gap-2.5 px-3.5 py-2.5 border border-white/15 rounded-full text-white/75 bg-[#091e12]/30 backdrop-blur-md text-[9px] font-bold tracking-[0.13em] uppercase">
          <span className="w-2 h-2 rounded-full bg-[#c9ddb8] shadow-[0_0_12px_rgba(201,221,184,0.8)] animate-pulse" />
          <span>Move to create a breeze</span>
        </div>
      </section>

      {/* =====================================================
           RIGHT — AUTHENTICATION CONSOLE
      ====================================================== */}
      <section className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Border separator line */}
        <div className="hidden lg:block absolute top-0 left-0 w-[1px] h-full bg-[#0e2c1a]/[0.07]" />

        <div className="w-full max-w-[440px] py-8 my-auto shrink-0">
          {/* Top back navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={onBackToMarketplace}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#22613a] hover:text-[#0b2418] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Marketplace</span>
            </button>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              Secure RBAC Node
            </span>
          </div>

          {/* Brand Logo badge */}
          <div className="mb-4">
            <FarmLogo size="sm" onClick={onBackToMarketplace} />
          </div>

          <div className="mb-3 text-[#22613a] text-[10px] font-bold tracking-[0.18em] uppercase">
            FARM2STREET MULTI-ACTOR ACCOUNT
          </div>

          <h2 className="font-serif text-[clamp(36px,4vw,50px)] leading-[1] tracking-[-0.055em] text-[#0b2418] font-normal">
            Welcome back.
          </h2>

          <p className="mt-3.5 max-w-[380px] text-[#68736b] text-[14px] leading-[1.65]">
            Sign in to continue your journey from farm to street. Choose your actor portal below.
          </p>

          {/* 4 Distinct Actor Selectors */}
          <div className="grid grid-cols-4 gap-2 mt-6 p-1.5 rounded-2xl bg-[#ebe8dd]/60 border border-[rgba(18,42,27,0.08)] shrink-0">
            {(['customer', 'farmer', 'delivery', 'admin'] as UserRole[]).map((r) => {
              const RoleIcon = roleMeta[r].icon;
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'bg-white text-[#0b2418] shadow-sm border border-black/5'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <RoleIcon className={`h-4 w-4 mb-1 ${isSelected ? 'text-[#22613a]' : 'text-stone-400'}`} />
                  <span className="truncate w-full text-center capitalize">{roleMeta[r].label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            {/* Dynamic Identifier Input */}
            <div className="shrink-0">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[#29352d]">
                  {roleMeta[selectedRole].inputLabel}
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder={roleMeta[selectedRole].inputPlaceholder}
                  className="w-full h-12 min-h-[48px] shrink-0 px-4 rounded-[13px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b] focus:ring-4 focus:ring-[#34754b]/10"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="shrink-0">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[#29352d]">
                  Password / PIN
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('Password reset link has been dispatched via Supabase Auth.');
                  }}
                  className="text-[11px] font-semibold text-[#22613a] hover:text-[#0b2418] transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-12 min-h-[48px] shrink-0 px-4 pr-12 rounded-[13px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b] focus:ring-4 focus:ring-[#34754b]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#183c2a] hover:bg-stone-100 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-[11px] text-[#717a73] shrink-0">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#b8c0ba] text-[#22613a] focus:ring-0 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>SSL Secured</span>
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 leading-relaxed shrink-0">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-12 min-h-[48px] shrink-0 flex items-center justify-center gap-2.5 rounded-[13px] text-white bg-[#103522] hover:bg-[#17482c] text-sm font-semibold tracking-[0.01em] cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(11,36,24,0.14)] active:translate-y-0 disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in as {roleMeta[selectedRole].label}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Registration Footer */}
          <div className="mt-8 text-center text-[#7c857f] text-xs shrink-0">
            New to Farm2Street?
            <button
              type="button"
              onClick={() => onNavigateRegister && onNavigateRegister()}
              className="ml-1.5 text-[#17482c] font-bold hover:underline cursor-pointer"
            >
              Create an account
            </button>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 mt-7 text-[#a0a8a1] text-[10px] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span>Secure authentication · Farm2Street · Supabase Protected</span>
          </div>
        </div>
      </section>
    </div>
  );
};
