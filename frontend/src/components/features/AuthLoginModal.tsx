import React, { useState } from 'react';
import {
  X,
  User,
  Tractor,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  KeyRound,
  IdCard,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { UserRole } from '../../types';
import { FarmLogo } from '../layout/Navbar';

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer',
}) => {
  const { loginWithCredentials, currentUser } = useFarm();
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  // Form states (clean empty inputs for live authentication)
  const [customerPhone, setCustomerPhone] = useState('');
  const [farmerKisanId, setFarmerKisanId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    let identifier = '';
    if (selectedRole === 'farmer') identifier = farmerKisanId.trim();
    else if (selectedRole === 'delivery') identifier = driverId.trim();
    else if (selectedRole === 'admin') identifier = adminEmail.trim();
    else identifier = customerPhone.trim();

    if (!identifier) {
      setErrorMessage('Please enter your email or identifier.');
      return;
    }
    if (!passcode) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(identifier, passcode, selectedRole);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        onClose();
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Error during authentication. Please retry.');
    }
  };

  const roleMeta: Record<
    UserRole,
    {
      title: string;
      tagline: string;
      icon: any;
      accentColor: string;
      buttonBg: string;
      responsibilities: string[];
    }
  > = {
    customer: {
      title: 'Customer Authentication',
      tagline: 'Direct buyer connecting with local morning harvests',
      icon: User,
      accentColor: 'text-emerald-700',
      buttonBg: 'bg-[#183c2a] hover:bg-[#2c5b3d]',
      responsibilities: [
        'Browse morning-harvested produce direct from growers',
        'Place orders with instant Razorpay checkout',
        'Subscribe to weekly recurring vegetable boxes',
        'Track live orders across all 8 fulfillment stages',
        'Scan QR codes for field-to-fork origin verification',
      ],
    },
    farmer: {
      title: 'Farmer Producer Console Login',
      tagline: 'Producer & seller portal with zero middleman markups',
      icon: Tractor,
      accentColor: 'text-amber-700',
      buttonBg: 'bg-[#8c5e2d] hover:bg-[#a67138]',
      responsibilities: [
        'Register farm profile, soil health, and organic certs',
        'Add vegetables and produce listings with live images & pricing',
        'Create harvest batches and generate batch QR codes',
        'Receive incoming customer orders & mark ready for pickup',
        'Audit daily sales, mandi margins (+24%), and T+1 settlements',
      ],
    },
    delivery: {
      title: 'Delivery Partner Portal Login',
      tagline: 'Last-mile cold-chain logistics and routing operations',
      icon: Truck,
      accentColor: 'text-sky-700',
      buttonBg: 'bg-[#0f4c3a] hover:bg-[#186650]',
      responsibilities: [
        'View daily assigned delivery manifests and pickup runs',
        'Navigate from farm gate to customer doorstep using Maps/Routing',
        'Collect crates and update status (Picked Up -> Out for Delivery)',
        'Verify delivery handover with doorstep OTP verification',
        'Track completed drops, distance traveled, and daily payout',
      ],
    },
    admin: {
      title: 'Platform Governance & SuperAdmin Login',
      tagline: 'System operations, user moderation, and settlement auditor',
      icon: ShieldCheck,
      accentColor: 'text-purple-700',
      buttonBg: 'bg-[#131920] hover:bg-[#232f3e]',
      responsibilities: [
        'Manage users (farmers, customers, delivery partners)',
        'Review and approve farmer KYC and organic certifications',
        'Audit active orders across all 8 lifecycle stages with overrides',
        'Verify Razorpay transaction signatures & trigger T+1 disbursements',
        'Monitor platform GMV, active subscribers, and SLA compliance',
      ],
    },
  };

  const currentMeta = roleMeta[selectedRole];
  const Icon = currentMeta.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-50 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-[#fbfaf5] shadow-2xl border border-[rgba(24,32,25,0.1)]">
        {/* Header */}
        <div className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FarmLogo size="sm" showText={false} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a48256]">
                Farm2Street Multi-Actor Access Control
              </span>
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#182019]">
                Select Actor Login Portal
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Distinct Actor Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-stone-200 bg-[#f5f4ee] p-2 gap-2">
          {[
            { id: 'customer', label: 'Customer', icon: User },
            { id: 'farmer', label: 'Farmer', icon: Tractor },
            { id: 'delivery', label: 'Delivery Partner', icon: Truck },
            { id: 'admin', label: 'SuperAdmin', icon: ShieldCheck },
          ].map((item) => {
            const RoleIcon = item.icon;
            const isSelected = selectedRole === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedRole(item.id as UserRole)}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'bg-white text-[#182019] shadow-sm border border-stone-300'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
                }`}
              >
                <RoleIcon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Left Form + Right Responsibilities */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Login Form (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-800 font-bold">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-[#182019]">
                  {currentMeta.title}
                </h3>
                <p className="text-xs text-stone-500">{currentMeta.tagline}</p>
              </div>
            </div>

            {/* Login Inputs Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs" noValidate autoComplete="off" data-form-type="other">
              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}
              {selectedRole === 'customer' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Mobile Number (OTP Login) or Email
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      name="m_customer_acc"
                      autoComplete="off"
                      data-lpignore="true"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-stone-800 font-medium"
                      placeholder="Email or mobile number"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'farmer' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Address or Farm Mobile
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      name="m_farmer_acc"
                      autoComplete="off"
                      data-lpignore="true"
                      value={farmerKisanId}
                      onChange={(e) => setFarmerKisanId(e.target.value)}
                      placeholder="Email or mobile number"
                      className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'delivery' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      name="m_driver_acc"
                      autoComplete="off"
                      data-lpignore="true"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      placeholder="Email or mobile number"
                      className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'admin' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    SuperAdmin Operator Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                    <input
                      type="email"
                      name="m_admin_acc"
                      autoComplete="off"
                      data-lpignore="true"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Work email"
                      className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-stone-800 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Security Passcode / OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    name="m_auth_secret"
                    autoComplete="new-password"
                    data-lpignore="true"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Password or OTP"
                    className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-stone-800 font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  } ${currentMeta.buttonBg}`}
                >
                  <span>{isLoading ? 'Verifying with Supabase...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right: Actor Responsibilities & RBAC Capabilities (5 cols) */}
          <div className="md:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 text-xs shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Role Responsibilities & Access Scope
              </span>
              <ul className="space-y-2.5 text-stone-700">
                {currentMeta.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 bg-[#fbfaf5] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Current Session:</span>
              <span className="font-semibold text-stone-800">{currentUser.name}</span>
              <span className="text-[11px] text-stone-500 block capitalize">Role: {currentUser.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
