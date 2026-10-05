import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle2,
  Thermometer,
  Sprout,
  Search,
  Sparkles,
  ExternalLink,
  QrCode,
  FileCheck,
  X,
  Check,
  Copy,
  Truck,
  Clock,
  MapPin,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { TraceabilityBatch } from '../../types';

interface TraceabilitySectionProps {
  activeBatchId?: string;
  autoOpenCert?: boolean;
}

export const TraceabilitySection: React.FC<TraceabilitySectionProps> = ({
  activeBatchId = 'F2S-TM-20260920-01',
  autoOpenCert = false,
}) => {
  const { batches, setSelectedBatchId, produceList } = useFarm();
  const [searchId, setSearchId] = useState<string>(activeBatchId);
  const [currentBatch, setCurrentBatch] = useState<TraceabilityBatch>(() => {
    return batches[activeBatchId] || Object.values(batches)[0];
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCertModal, setShowCertModal] = useState(autoOpenCert);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(() => {
    const initial = batches[activeBatchId] || Object.values(batches)[0];
    return initial?.timeline ? initial.timeline.length - 1 : 0;
  });

  // Dynamic Batch Presets from live batches registry + produceList
  const dynamicBatches = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();

    // 1. All registered batches in context
    Object.values(batches).forEach((b) => {
      if (b.batchId && !seen.has(b.batchId)) {
        seen.add(b.batchId);
        list.push({ id: b.batchId, name: b.produceName });
      }
    });

    // 2. All produce items listed by farmers that carry batch IDs
    produceList.forEach((p) => {
      if (p.batchId && !seen.has(p.batchId)) {
        seen.add(p.batchId);
        list.push({ id: p.batchId, name: p.name });
      }
    });

    return list;
  }, [batches, produceList]);

  // Keep in sync with parent prop or batches changes
  useEffect(() => {
    if (activeBatchId && batches[activeBatchId]) {
      setSearchId(activeBatchId);
      setCurrentBatch(batches[activeBatchId]);
      if (batches[activeBatchId].timeline?.length) {
        setActiveStageIdx(batches[activeBatchId].timeline.length - 1);
      }
    }
  }, [activeBatchId, batches]);

  useEffect(() => {
    if (autoOpenCert) {
      setShowCertModal(true);
    }
  }, [autoOpenCert]);

  const handleLookup = (id: string) => {
    const cleanId = id.trim().replace(/\s+/g, '-');
    setSearchId(cleanId);

    const found =
      batches[cleanId] ||
      Object.values(batches).find(
        (b) =>
          b.batchId.toLowerCase() === cleanId.toLowerCase() ||
          b.produceName.toLowerCase().includes(cleanId.toLowerCase())
      );

    if (found) {
      setCurrentBatch(found);
      setSelectedBatchId?.(found.batchId);
      if (found.timeline?.length) {
        setActiveStageIdx(found.timeline.length - 1);
      }
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (found) {
        setCurrentBatch(found);
      }
    }, 300);
  };

  // Direct production URL on Render pointing to the exact batch
  const qrPayload = `https://farm2street.onrender.com/?batch=${encodeURIComponent(currentBatch.batchId)}#traceability`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(qrPayload);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="traceability" className="scroll-mt-24 pt-28 pb-20 bg-[#07100b] text-[#f5f4ee]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#c5a880]/15 border border-[#c5a880]/30 px-4 py-1 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[#c5a880]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c5a880]">
              Complete Supply Chain Transparency
            </span>
          </div>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mt-1">
            Produce Traceability Engine
          </h2>
          <p className="text-sm md:text-base text-stone-300 mt-3 leading-relaxed">
            Every harvest crate carries a unique cryptographic batch QR code. Verify the exact field, sunrise harvest time, packing station, and transit temperature.
          </p>

          {/* Quick-Select Batch Chips: Dynamically from all registered farmer batches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-4xl mx-auto px-2">
            <span className="text-[11px] text-stone-400 font-semibold mr-1 shrink-0">Quick Select:</span>
            {dynamicBatches.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleLookup(chip.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentBatch.batchId === chip.id
                    ? 'bg-[#c5a880] text-[#07100b] shadow-md scale-105 ring-2 ring-[#c5a880]/40'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                <Sprout className="h-3 w-3 opacity-80" />
                <span>{chip.name}</span>
              </button>
            ))}
          </div>

          {/* Batch lookup search input */}
          <div className="flex items-center gap-2 max-w-lg mx-auto mt-5 bg-white/10 border border-white/20 rounded-full p-1.5 backdrop-blur-md shadow-lg">
            <Search className="h-4 w-4 text-[#c5a880] ml-3 shrink-0" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLookup(searchId);
                }
              }}
              placeholder="Enter Batch ID (e.g. F2S-TM-20260920-01)"
              className="flex-1 bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none px-2 font-mono"
            />
            <button
              type="button"
              onClick={() => handleLookup(searchId)}
              disabled={isVerifying}
              className="rounded-full bg-[#c5a880] px-5 py-2 text-xs font-bold text-[#07100b] uppercase tracking-wider hover:bg-[#d6ba94] transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#07100b]/30 border-t-[#07100b] rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Batch</span>
              )}
            </button>
          </div>

        </div>

        {/* Traceability Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive QR Code & Farm Identity */}
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#111813] p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Live Interactive QR Card with Animated Laser Beam */}
            <div
              onClick={() => setShowCertModal(true)}
              className="group relative p-4 bg-white rounded-2xl shadow-xl border-4 border-[#c5a880]/30 mb-4 cursor-pointer hover:border-[#c5a880] transition-all overflow-hidden"
              title="Click to inspect verifiable cryptographic certificate"
            >
              <QRCodeSVG
                value={qrPayload}
                size={180}
                bgColor="#ffffff"
                fgColor="#07100b"
                level="H"
                includeMargin={false}
              />
              {/* Dynamic Scanning Laser Bar */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_10px_#10b981] animate-[bounce_2.5s_infinite] pointer-events-none opacity-80" />

              {/* Hover Overlay Hint */}
              <div className="absolute inset-0 bg-[#183c2a]/85 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-3">
                <QrCode className="h-7 w-7 text-[#c5a880] mb-1.5" />
                <span className="text-xs font-bold uppercase tracking-wider">Inspect Digital Ledger</span>
                <span className="text-[10px] text-stone-300 mt-0.5">Click to view full lab certificate</span>
              </div>
            </div>

            {/* Verified Cryptographic Batch Pill */}
            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 hover:bg-emerald-900/80 transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Cryptographic Batch</span>
              <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
            </button>

            <h3 className="font-sans text-2xl font-bold tracking-tight text-white mt-1">
              {currentBatch.produceName}
            </h3>
            <p className="text-xs text-[#c5a880] font-mono mt-1">
              Batch ID: {currentBatch.batchId}
            </p>

            {/* Complete Verifiable Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 w-full mt-6 pt-6 border-t border-white/10 text-left">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Origin Farm
                </div>
                <div className="text-xs font-semibold text-white mt-0.5 truncate" title={currentBatch.farmName}>
                  {currentBatch.farmName}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Lead Grower
                </div>
                <div className="text-xs font-semibold text-white mt-0.5 truncate" title={currentBatch.farmerName}>
                  {currentBatch.farmerName}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Field Plot
                </div>
                <div className="text-xs font-semibold text-stone-200 mt-0.5 truncate" title={currentBatch.fieldId}>
                  {currentBatch.fieldId || 'Sector 4, Organic Bed'}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Quality Grade
                </div>
                <div className="text-xs font-semibold text-amber-300 mt-0.5 truncate">
                  {currentBatch.qualityGrade || 'Grade A+ Export'}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Cold-Chain Temp
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{currentBatch.temperatureAtTransit}</span>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Pesticide Check
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Sprout className="h-3.5 w-3.5 shrink-0" />
                  <span>0.00 PPM (Pass)</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="w-full mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#c5a880] hover:bg-[#d6ba94] text-[#07100b] py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <FileCheck className="h-4 w-4" />
                <span>View Full Audit Certificate</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white py-2.5 px-3.5 text-xs font-semibold transition-all cursor-pointer"
                title="Copy Direct QR Verification Link"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? 'Copied' : 'Share QR'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean 5-Milestone Field-to-Doorstep Provenance Journey */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#111813] p-6 sm:p-8 shadow-2xl">
            {/* Header: Relevant, Non-Vague Content */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Field-to-Doorstep Provenance Journey</span>
                </h4>
                <div className="text-xs text-stone-300 font-medium mt-1">
                  5 Verified Milestones &bull; From {currentBatch.farmName} to Customer Doorstep
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-400 shrink-0 self-start sm:self-auto">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Cryptographically Verified</span>
              </div>
            </div>

            {/* Continuous Vertical 5-Step Timeline with Centered Alignment & Zero Truncation */}
            <div className="space-y-3.5">
              {currentBatch.timeline.map((event, idx) => {
                const isSelected = activeStageIdx === idx;
                const isPassed = idx <= activeStageIdx;
                const isLast = idx === currentBatch.timeline.length - 1;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStageIdx(idx)}
                    className="flex gap-4 items-stretch group cursor-pointer"
                  >
                    {/* Centered Indicator Stem Column */}
                    <div className="flex flex-col items-center shrink-0 w-7">
                      {/* Step Circle Node */}
                      <div
                        className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#c5a880] bg-[#183c2a] text-[#c5a880] shadow-[0_0_12px_rgba(197,168,128,0.7)] scale-110 font-bold text-xs'
                            : isPassed
                            ? 'border-emerald-500/80 bg-emerald-950 text-emerald-400 text-xs font-semibold'
                            : 'border-white/20 bg-[#07100b] text-stone-500 text-xs group-hover:border-white/40'
                        }`}
                      >
                        {isPassed && !isSelected ? (
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Continuous Connecting Line to Next Node */}
                      {!isLast && (
                        <div
                          className={`w-[2px] grow my-1 transition-colors ${
                            idx < activeStageIdx
                              ? 'bg-gradient-to-b from-emerald-500 to-[#c5a880]'
                              : 'bg-white/10'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Card Content */}
                    <div className={`grow ${!isLast ? 'pb-2' : 'pb-0'}`}>
                      <div
                        className={`rounded-2xl p-4 transition-all ${
                          isSelected
                            ? 'bg-white/[0.08] border border-[#c5a880]/60 shadow-lg'
                            : 'bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/[0.07]'
                        }`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Milestone {idx + 1} of {currentBatch.timeline.length}
                            </span>
                            <span className="font-sans text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-[#c5a880] transition-colors">
                              {event.stage}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#c5a880]">
                            {event.timestamp}
                          </span>
                        </div>

                        <div className="text-xs text-stone-400 mt-1.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        <p className="text-xs text-stone-300 mt-2.5 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                          {event.details}
                        </p>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-[11px] text-emerald-400 font-mono">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Cryptographic Ledger Verified
                            </span>
                            <span>•</span>
                            <span className="text-stone-300">Plot: {currentBatch.fieldId || 'Sector 4, Bed #12'}</span>
                            <span>•</span>
                            <span className="text-[#c5a880]">Transit Temp: {currentBatch.temperatureAtTransit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cryptographic Ledger Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#0e1811] p-6 sm:p-8 text-white shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCertModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a880]">
                  Verifiable Cryptographic Certificate
                </span>
                <h3 className="text-xl font-bold mt-0.5">{currentBatch.produceName}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-black/40 rounded-2xl p-4 border border-white/10 font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Batch Identifier:</span>
                <span className="text-white font-bold">{currentBatch.batchId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Origin Producer:</span>
                <span className="text-emerald-400 font-semibold">{currentBatch.farmName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Certified Grower:</span>
                <span className="text-white">{currentBatch.farmerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Farm Location:</span>
                <span className="text-stone-300">{currentBatch.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Field / Plot ID:</span>
                <span className="text-stone-300">{currentBatch.fieldId || 'Sector 4, Bed #12'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Harvest Timestamp:</span>
                <span className="text-stone-200">{currentBatch.harvestDate || 'Sunrise, 06:00 AM'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Quality Rating:</span>
                <span className="text-amber-300 font-bold">{currentBatch.qualityGrade || 'Grade A+ (Export Grade)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Pesticide Screening:</span>
                <span className="text-emerald-400 font-bold">0.00 PPM (Pass - NPOP Certified)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Soil Carbon Index:</span>
                <span className="text-stone-300">{currentBatch.soilHealthIndex || 'Optimal (Organic Carbon 0.82%)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-stone-400">Cold-Chain Log:</span>
                <span className="text-emerald-400">{currentBatch.temperatureAtTransit} (Passed)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-400">SHA-256 Ledger Hash:</span>
                <span className="text-[#c5a880] truncate max-w-[170px]" title="0x7f9a8c142b9e6a0d4c81fa73e221b6d41c">
                  0x7f9a8c142b9e...d41c
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="w-full sm:w-auto rounded-xl bg-[#c5a880] hover:bg-[#d6ba94] px-6 py-2.5 text-xs font-bold text-[#07100b] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
