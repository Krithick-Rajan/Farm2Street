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
  MapPin,
  FileCheck,
  CreditCard,
  Building,
  Calendar,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { UserRole } from '../../types';
import { CropCanvas } from './CropCanvas';
import { FarmLogo } from '../layout/Navbar';
import { CustomSelect } from '../ui/UiWidgets';

interface RegisterPageProps {
  onBackToMarketplace: () => void;
  onNavigateLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onBackToMarketplace,
  onNavigateLogin,
}) => {
  const { registerUser } = useFarm();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Common fields (clean empty state for live user input)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Customer specific
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [preferredWindow, setPreferredWindow] = useState('Morning Harvest (06:00 AM - 09:00 AM)');

  // Farmer specific
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [totalAcres, setTotalAcres] = useState('');
  const [farmingType, setFarmingType] = useState('100% Certified Organic (NPOP)');
  const [kisanId, setKisanId] = useState('');
  const [upiPayoutId, setUpiPayoutId] = useState('');

  // Delivery partner specific
  const [vehicleType, setVehicleType] = useState('Electric Cargo 2W (Ather 450X)');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [operatingZone, setOperatingZone] = useState('');

  // Admin specific
  const [adminOrgEmail, setAdminOrgEmail] = useState('');
  const [adminDept, setAdminDept] = useState('Platform Governance & Traceability Lab');
  const [securityKey, setSecurityKey] = useState('');

  // Handle switching roles and clear errors
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setErrorMessage('Please enter your email address or mobile phone number.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Please create a secure password (minimum 4 characters).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both entries.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Farm2Street platform protocols.');
      return;
    }

    // Platform Governance: Enforce security authorization key for admin accounts
    if (selectedRole === 'admin') {
      const validAdminKeys = ['FARM2STREET_ADMIN_2026', 'ADMIN_F2S_SECURE'];
      if (!securityKey.trim() || !validAdminKeys.includes(securityKey.trim())) {
        setErrorMessage('Invalid platform authorization key. Administrator accounts require a valid security key (e.g., FARM2STREET_ADMIN_2026).');
        return;
      }
    }

    setIsLoading(true);

    const payload: any = {
      role: selectedRole,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      emailOrPhone: (email.trim() || phone.trim()),
      password,
    };

    if (selectedRole === 'customer') {
      payload.location = `${deliveryAddress}, ${deliveryArea}`;
      payload.extraInfo = `${deliveryArea} • ${preferredWindow}`;
    } else if (selectedRole === 'farmer') {
      payload.farmName = farmName;
      payload.location = farmLocation;
      payload.totalAcres = parseFloat(totalAcres) || 5;
      payload.extraInfo = `${farmName} (${farmingType})`;
    } else if (selectedRole === 'delivery') {
      payload.vehicleType = vehicleType;
      payload.vehicleNumber = vehicleNumber;
      payload.extraInfo = `${vehicleType} • ${vehicleNumber}`;
    } else {
      payload.email = (adminOrgEmail || email).trim();
      payload.emailOrPhone = (adminOrgEmail || email || phone).trim();
      payload.extraInfo = adminDept;
    }

    try {
      const res = await registerUser(payload);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Error registering account with Supabase. Please retry.');
    }
  };

  const roleMeta: Record<
    UserRole,
    {
      label: string;
      icon: any;
      tagline: string;
      quote: string;
      badgeText: string;
    }
  > = {
    customer: {
      label: 'Customer',
      icon: User,
      tagline: 'DIRECT BUYER ONBOARDING',
      quote: 'Crisp morning harvests picked at 5 AM and delivered to my doorstep by 8 AM. 100% transparent traceability.',
      badgeText: 'Farm Direct Grocery & Subscriptions',
    },
    farmer: {
      label: 'Farmer',
      icon: Tractor,
      tagline: 'PRODUCER & GROWER ENROLLMENT',
      quote: 'Direct retail realization with zero intermediaries, immediate T+1 payouts, and complete digital batch provenance.',
      badgeText: 'Zero Middlemen · 80%+ Farmer Margin',
    },
    delivery: {
      label: 'Delivery Partner',
      icon: Truck,
      tagline: 'COLD-CHAIN FLEET PARTNER',
      quote: 'Optimized farm-to-kitchen routes, green EV fleet prioritization, and instant per-delivery payouts.',
      badgeText: 'Eco-Friendly Cold-Chain Logistics',
    },
    admin: {
      label: 'SuperAdmin',
      icon: ShieldCheck,
      tagline: 'SYSTEM GOVERNANCE AUDITOR',
      quote: 'Cryptographic batch auditing, KYC certification governance, and end-to-end multi-actor visibility.',
      badgeText: 'Root Level Multi-Actor Control',
    },
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans antialiased text-[#152018] grid grid-cols-1 lg:grid-cols-2 relative">
      {/* =====================================================
           LEFT — FARM VISUAL & CANVAS EXPERIENCE
      ====================================================== */}
      <section
        className="hidden lg:block relative lg:min-h-screen overflow-hidden isolate"
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
            DIRECT HARVEST · TRANSPARENT SUPPLY
          </div>

          <h1 className="font-serif text-[clamp(42px,5vw,76px)] leading-[0.98] tracking-[-0.055em] font-normal text-white">
            From local soil.<br />
            Direct to <em className="text-[#d8e7cd] italic font-serif">your table.</em>
          </h1>

          <p className="max-w-[460px] mt-6 text-white/70 text-[15px] leading-[1.75]">
            Join the agricultural marketplace connecting nearby organic growers directly with street-level consumers. Transparent batches, fair prices, and zero middlemen.
          </p>

          {/* Persona quote badge */}
          <div className="mt-8 rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-md max-w-[440px] flex items-start gap-3">
            <span className="text-amber-300 text-lg">“</span>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#c9ddb8] mb-1">
                {roleMeta[selectedRole].badgeText}
              </div>
              <div className="text-xs text-stone-200 italic leading-relaxed">
                {roleMeta[selectedRole].quote}
              </div>
            </div>
          </div>
        </div>

        {/* Farm Meta Tags at Bottom */}
        <div className="absolute left-[clamp(28px,6vw,90px)] bottom-[38px] z-10 hidden sm:flex items-center gap-3 text-white/60 text-[10px] tracking-[0.11em] uppercase font-bold">
          <span>SOIL TO TABLE</span>
          <span className="w-1 h-1 rounded-full bg-white/50" />
          <span>PROVEN ORIGIN</span>
          <span className="w-1 h-1 rounded-full bg-white/50" />
          <span>T+1 SETTLEMENTS</span>
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
           RIGHT — ONBOARDING CONSOLE
      ====================================================== */}
      <section className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Border separator line */}
        <div className="hidden lg:block absolute top-0 left-0 w-[1px] h-full bg-[#0e2c1a]/[0.07]" />

        <div className="w-full max-w-[480px] py-8">
          {/* Top back navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={onBackToMarketplace}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#22613a] hover:text-[#0b2418] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Marketplace</span>
            </button>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              Secure RBAC Onboarding
            </span>
          </div>

          {/* Official Farm Logo badge */}
          <div className="mb-4">
            <FarmLogo size="sm" onClick={onBackToMarketplace} />
          </div>

          <div className="mb-2 text-[#22613a] text-[10px] font-bold tracking-[0.18em] uppercase">
            FARM2STREET MULTI-ACTOR REGISTRATION
          </div>

          <h2 className="font-serif text-[clamp(34px,3.8vw,46px)] leading-[1.05] tracking-[-0.055em] text-[#0b2418] font-normal">
            Create your account.
          </h2>

          <p className="mt-2.5 max-w-[420px] text-[#68736b] text-[13px] leading-[1.6]">
            Select your actor role to initialize your profile and console permissions.
          </p>

          {/* 4 Distinct Actor Selectors */}
          <div className="grid grid-cols-4 gap-2 mt-5 p-1.5 rounded-2xl bg-[#ebe8dd]/60 border border-[rgba(18,42,27,0.08)]">
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
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                Full Name / Legal Entity
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b] focus:ring-3 focus:ring-[#34754b]/10"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                {selectedRole === 'admin' ? 'Official Work Email' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'admin' ? 'admin@farm2street.org' : 'e.g. name@example.com'}
                className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b] focus:ring-3 focus:ring-[#34754b]/10"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b] focus:ring-3 focus:ring-[#34754b]/10"
              />
            </div>

            {/* ==================== ROLE SPECIFIC FIELDS ==================== */}

            {/* 1. CUSTOMER SPECIFIC FIELDS */}
            {selectedRole === 'customer' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                    Delivery Address (Flat / House / Street)
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Address (house, building, street)"
                    className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b] focus:ring-3 focus:ring-[#34754b]/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Area / City
                    </label>
                    <input
                      type="text"
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      placeholder="Area or city"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b] focus:ring-3 focus:ring-[#34754b]/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Delivery Window
                    </label>
                    <CustomSelect
                      value={preferredWindow}
                      onChange={setPreferredWindow}
                      options={[
                        'Morning Harvest (06:00 AM - 09:00 AM)',
                        'Evening Fresh (05:00 PM - 08:00 PM)',
                      ]}
                    />
                  </div>
                </div>
              </>
            )}

            {/* 2. FARMER SPECIFIC FIELDS */}
            {selectedRole === 'farmer' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="Farm name"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Taluka / Village
                    </label>
                    <input
                      type="text"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="Village or district"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Land Area (Acres)
                    </label>
                    <input
                      type="number"
                      value={totalAcres}
                      onChange={(e) => setTotalAcres(e.target.value)}
                      placeholder="Acres"
                      step="0.5"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Farming Type
                    </label>
                    <CustomSelect
                      value={farmingType}
                      onChange={setFarmingType}
                      options={[
                        '100% Certified Organic (NPOP)',
                        'Natural Farming (ZBNF)',
                        'GAP Hydroponic Greenhouse',
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Kisan Registration ID
                    </label>
                    <input
                      type="text"
                      value={kisanId}
                      onChange={(e) => setKisanId(e.target.value)}
                      placeholder="Kisan ID"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Bank UPI for T+1 Settlement
                    </label>
                    <input
                      type="text"
                      value={upiPayoutId}
                      onChange={(e) => setUpiPayoutId(e.target.value)}
                      placeholder="UPI ID"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 3. DELIVERY SPECIFIC FIELDS */}
            {selectedRole === 'delivery' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Vehicle Type
                    </label>
                    <CustomSelect
                      value={vehicleType}
                      onChange={setVehicleType}
                      options={[
                        'Electric Cargo 2W (Ather 450X)',
                        'Electric 3W Cargo (Mahindra Treo)',
                        'Insulated Temperature-Control Van',
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Vehicle Plate Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="Vehicle number"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Driving License No.
                    </label>
                    <input
                      type="text"
                      value={drivingLicense}
                      onChange={(e) => setDrivingLicense(e.target.value)}
                      placeholder="Driving license number"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                      Operating Hub / Cluster
                    </label>
                    <input
                      type="text"
                      value={operatingZone}
                      onChange={(e) => setOperatingZone(e.target.value)}
                      placeholder="Delivery hub or zone"
                      className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 4. ADMIN SPECIFIC FIELDS */}
            {selectedRole === 'admin' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                    Platform Department / Responsibility
                  </label>
                  <CustomSelect
                    value={adminDept}
                    onChange={setAdminDept}
                    options={[
                      'Platform Governance & Traceability Lab',
                      'Farmer KYC & Organic Cert Audit',
                      'Logistics & EV Routing Operations',
                      'Settlement & Financial Audits',
                    ]}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#29352d] block">
                      Platform Security Root Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setSecurityKey('FARM2STREET_ADMIN_2026')}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                    >
                      Use Key: FARM2STREET_ADMIN_2026
                    </button>
                  </div>
                  <input
                    type="text"
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    placeholder="FARM2STREET_ADMIN_2026"
                    className="w-full h-12 px-4 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] font-mono outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Enter <code className="text-emerald-700 font-bold font-mono">FARM2STREET_ADMIN_2026</code> to authorize SuperAdmin governance access.
                  </p>
                </div>
              </>
            )}

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                  Set Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="reg_new_pwd"
                    autoComplete="new-password"
                    data-lpignore="true"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-12 px-4 pr-11 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-[#183c2a] hover:bg-stone-100 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#29352d] block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="reg_confirm_pwd"
                    autoComplete="new-password"
                    data-lpignore="true"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full h-12 px-4 pr-11 rounded-[12px] border border-[#15301e]/15 bg-white text-sm text-[#152018] outline-none transition-all hover:border-[#15301e]/25 focus:border-[#34754b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-[#183c2a] hover:bg-stone-100 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-shake">
                {errorMessage}
              </div>
            )}

            {/* Terms and Agreements Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#525f56]">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-[#22613a] focus:ring-[#22613a]"
                />
                <span>I accept Farm2Street Protocols & Fair Trade Terms</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 rounded-[13px] bg-[#103522] text-[#f5f3ec] text-sm font-semibold tracking-[-0.01em] shadow-[0_2px_8px_rgba(11,36,24,0.18)] hover:bg-[#18482f] hover:shadow-[0_4px_14px_rgba(11,36,24,0.24)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Configuring {roleMeta[selectedRole].label} Console...</span>
                </>
              ) : (
                <>
                  <span>Create {roleMeta[selectedRole].label} Account & Enter</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Switcher to Login */}
          <div className="mt-6 text-center text-xs text-[#68736b]">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-bold text-[#22613a] hover:underline"
            >
              Sign in to your portal
            </button>
          </div>

          {/* Security footnote */}
          <div className="mt-8 pt-4 border-t border-[rgba(18,42,27,0.08)] flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <Lock className="h-3 w-3" />
            <span>Secure multi-actor onboarding · Farm2Street · Powered by Supabase</span>
          </div>
        </div>
      </section>
    </div>
  );
};
