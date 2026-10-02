import React from 'react';
import { Sprout, Heart, ShieldCheck } from 'lucide-react';
import { FarmLogo } from './Navbar';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[rgba(24,32,25,0.08)] bg-[#0c140e] text-[#f5f4ee] py-16 px-5 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-1 space-y-4">
          <FarmLogo size="md" textColor="text-white" />
          <p className="text-xs text-stone-400 leading-relaxed">
            Direct farmer-to-consumer vegetable marketplace with smart subscription boxes, refrigerated transit, and cryptographic produce traceability.
          </p>
          <div className="text-[11px] text-[#c5a880] font-semibold">
            Fresh from nearby farms directly to your doorstep.
          </div>
        </div>

        {/* Quick Links */}
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

        {/* Traceability & Tech */}
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

        {/* Roles & Operations */}
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
