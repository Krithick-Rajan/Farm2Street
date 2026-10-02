import React, { useState, useEffect } from 'react';
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
  FileText,
  Code,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { TraceabilityBatch } from '../../types';

interface TraceabilitySectionProps {
  activeBatchId?: string;
}

export const TraceabilitySection: React.FC<TraceabilitySectionProps> = ({
  activeBatchId = 'F2S-TM-20260920-01',
}) => {
  const { batches } = useFarm();
  const [searchId, setSearchId] = useState<string>(activeBatchId);
  const [currentBatch, setCurrentBatch] = useState<TraceabilityBatch>(() => {
    return batches[activeBatchId] || Object.values(batches)[0];
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number | null>(null);
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [parsedXmlBatches, setParsedXmlBatches] = useState<any[]>([]);
  const [isXmlLoading, setIsXmlLoading] = useState(false);

  // Topic 4: AJAX implementation fetching Topic 5: XML Feed
  const fetchTraceabilityXml = () => {
    setIsXmlLoading(true);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'produce.xml', true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        setIsXmlLoading(false);
        if (xhr.status === 200 || xhr.status === 0) {
          const raw = xhr.responseText;
          setXmlContent(raw);
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(raw, 'text/xml');
            const batchNodes = xmlDoc.getElementsByTagName('batch');
            const items = [];
            for (let i = 0; i < batchNodes.length; i++) {
              const node = batchNodes[i];
              items.push({
                id: node.getAttribute('id') || `BATCH-${i}`,
                name: node.getElementsByTagName('name')[0]?.textContent || '',
                category: node.getElementsByTagName('category')[0]?.textContent || '',
                price: node.getElementsByTagName('price')[0]?.textContent || '',
                unit: node.getElementsByTagName('price')[0]?.getAttribute('unit') || 'kg',
                currency: node.getElementsByTagName('price')[0]?.getAttribute('currency') || 'INR',
                farm: node.getElementsByTagName('farmOrigin')[0]?.getElementsByTagName('name')[0]?.textContent || '',
                harvestDate: node.getElementsByTagName('harvestDate')[0]?.textContent || '',
                stock: node.getElementsByTagName('stockAvailable')[0]?.textContent || '',
              });
            }
            setParsedXmlBatches(items);
          } catch (e) {
            console.error('XML parsing error:', e);
          }
        }
      }
    };
    xhr.send();
  };

  // Keep in sync with parent prop or batches changes
  useEffect(() => {
    if (activeBatchId && batches[activeBatchId]) {
      setSearchId(activeBatchId);
      setCurrentBatch(batches[activeBatchId]);
    }
  }, [activeBatchId, batches]);

  const handleLookup = (id: string) => {
    const cleanId = id.trim().replace(/\s+/g, '-');
    setSearchId(cleanId);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (batches[cleanId]) {
        setCurrentBatch(batches[cleanId]);
      } else {
        const matched = Object.values(batches).find(
          (b) =>
            b.batchId.toLowerCase() === cleanId.toLowerCase() ||
            b.produceName.toLowerCase().includes(cleanId.toLowerCase())
        );
        if (matched) {
          setCurrentBatch(matched);
        }
      }
    }, 400);
  };

  const qrPayload = `https://farm2street.in/trace/${currentBatch.batchId}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(qrPayload);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Quick select presets
  const sampleBatches = [
    { id: 'F2S-TM-20260920-01', name: 'Heirloom Tomatoes' },
    { id: 'F2S-BP-20260920-05', name: 'Bell Peppers' },
    { id: 'F2S-CR-20260919-02', name: 'Organic Carrots' },
    { id: 'F2S-SP-20260920-04', name: 'Malabar Spinach' },
  ];

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

          {/* Quick-Select Batch Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-[11px] text-stone-400 font-semibold mr-1">Quick Select:</span>
            {sampleBatches.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleLookup(chip.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
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

          {/* Syllabus Demonstration: Topic 4 (AJAX) & Topic 5 (XML) Feed Inspector */}
          <div className="flex justify-center mt-3">
            <button
              type="button"
              onClick={() => {
                setShowXmlModal(true);
                fetchTraceabilityXml();
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-[#c5a880] border border-[#c5a880]/30 bg-white/5 hover:bg-[#c5a880]/15 transition-all cursor-pointer shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Topic 4 &amp; 5: Inspect Live XML Feed (AJAX + DOM Parser)</span>
            </button>
          </div>
        </div>

        {/* Traceability Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive QR Code & Farm Identity */}
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#111813] p-7 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Live Interactive QR Card with Animated Laser Beam */}
            <div
              onClick={() => setShowCertModal(true)}
              className="group relative p-4 bg-white rounded-2xl shadow-xl border-4 border-[#c5a880]/30 mb-5 cursor-pointer hover:border-[#c5a880] transition-all overflow-hidden"
              title="Click to inspect cryptographic ledger certificate"
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
              <div className="absolute inset-0 bg-[#183c2a]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-2">
                <QrCode className="h-6 w-6 text-[#c5a880] mb-1" />
                <span className="text-xs font-bold">Inspect Digital Ledger</span>
                <span className="text-[10px] text-stone-300 mt-0.5">Click to view certificate</span>
              </div>
            </div>

            {/* Click to Open Certificate Button */}
            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 hover:bg-emerald-900/80 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Cryptographic Batch</span>
              <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
            </button>

            <h3 className="font-sans text-2xl font-bold tracking-tight text-white mt-1">
              {currentBatch.produceName}
            </h3>
            <p className="text-xs text-[#c5a880] font-mono mt-1">
              Batch: {currentBatch.batchId}
            </p>

            {/* Verification Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-6 border-t border-white/10 text-left">
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Origin Farm
                </div>
                <div className="text-xs font-semibold text-white mt-0.5 truncate">
                  {currentBatch.farmName}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Lead Grower
                </div>
                <div className="text-xs font-semibold text-white mt-0.5 truncate">
                  {currentBatch.farmerName}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Transit Ambient Temp
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5" />
                  {currentBatch.temperatureAtTransit}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Pesticide Check
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Sprout className="h-3.5 w-3.5" />
                  0.00 PPM (Pass)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Correctly Fixed & Mathematically Centered Timeline */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#111813] p-7 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Field-to-Doorstep Provenance Journey</span>
              </h4>
              <span className="text-[11px] text-stone-400 font-mono">
                {currentBatch.timeline.length} Verified Milestones
              </span>
            </div>

            {/* Continuous Vertical Timeline with Exact Circle Stem Centering */}
            <div className="space-y-4">
              {currentBatch.timeline.map((event, idx) => {
                const isSelected = activeStageIdx === idx;
                const isLast = idx === currentBatch.timeline.length - 1;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStageIdx(isSelected ? null : idx)}
                    className="flex gap-4 items-stretch group cursor-pointer"
                  >
                    {/* Centered Indicator Stem Column */}
                    <div className="flex flex-col items-center shrink-0 w-6">
                      {/* Step Circle Node */}
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#c5a880] bg-[#183c2a] shadow-[0_0_12px_rgba(197,168,128,0.9)] scale-110'
                            : 'border-[#c5a880] bg-[#07100b] group-hover:border-emerald-400'
                        }`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-[#c5a880]'
                          }`}
                        />
                      </div>

                      {/* Continuous Connecting Line to Next Node */}
                      {!isLast && (
                        <div className="w-[2px] grow bg-gradient-to-b from-[#c5a880] via-[#c5a880]/50 to-emerald-500/25 my-1" />
                      )}
                    </div>

                    {/* Step Card Content */}
                    <div className={`grow ${!isLast ? 'pb-4' : 'pb-0'}`}>
                      <div className="rounded-2xl bg-white/5 border border-white/5 p-4 hover:border-white/15 hover:bg-white/[0.07] transition-all">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-sans text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-[#c5a880] transition-colors">
                            {event.stage}
                          </span>
                          <span className="text-[11px] font-mono text-[#c5a880]">
                            {event.timestamp}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {event.location}
                        </div>
                        <p className="text-xs text-stone-300 mt-2 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                          {event.details}
                        </p>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-[11px] text-emerald-400 font-mono">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> Digital Signature Verified
                            </span>
                            <span>•</span>
                            <span className="text-stone-300">GPS Geo-Fix: 10.658° N, 77.008° E</span>
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
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#0e1811] p-6 sm:p-8 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setShowCertModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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
              <div className="flex justify-between">
                <span className="text-stone-400">Batch Identifier:</span>
                <span className="text-white font-bold">{currentBatch.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Origin Producer:</span>
                <span className="text-emerald-400">{currentBatch.farmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Certified Grower:</span>
                <span className="text-white">{currentBatch.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Ledger SHA-256 Hash:</span>
                <span className="text-[#c5a880] truncate max-w-[180px]">
                  0x7f9a8c142b9e6...d41c
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Cold-Chain Log:</span>
                <span className="text-emerald-400">{currentBatch.temperatureAtTransit} (Passed)</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="rounded-xl bg-[#c5a880] hover:bg-[#d6ba94] px-5 py-2.5 text-xs font-bold text-[#07100b] uppercase tracking-wider transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Demonstration Modal: Topic 4 (AJAX) & Topic 5 (XML DOM Parser) */}
      {showXmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0f1712] border border-[#c5a880]/30 p-6 sm:p-8 text-stone-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowXmlModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#c5a880]/20 text-[#c5a880]">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Topic 4: AJAX &bull; XMLHttpRequest
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Topic 5: XML DOM Parser
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Harvest Traceability XML Feed</h3>
                <p className="text-xs text-stone-400">Asynchronously fetched from <code className="text-emerald-400">produce.xml</code> and parsed client-side</p>
              </div>
            </div>

            {/* XML Parsed Batches Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c5a880]">
                <span>Parsed XML Nodes ({parsedXmlBatches.length} Batches Found)</span>
                <button
                  type="button"
                  onClick={fetchTraceabilityXml}
                  disabled={isXmlLoading}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {isXmlLoading ? 'Fetching via AJAX...' : 'Re-fetch AJAX'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {parsedXmlBatches.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">{item.id}</span>
                    <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                    <div className="text-xs text-stone-400">
                      <div>Farm: <span className="text-stone-200 font-medium">{item.farm}</span></div>
                      <div>Date: <span className="text-stone-200">{item.harvestDate}</span></div>
                      <div>Price: <span className="text-emerald-400 font-bold">&#8377;{item.price} / {item.unit}</span></div>
                      <div>Stock: <span className="text-stone-300">{item.stock} left</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw XML Source Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a880]">Raw XML Document Structure</span>
              <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 leading-relaxed">
                {xmlContent || 'Loading XML payload...'}
              </pre>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-stone-400">
                Servlet XML Endpoint: <a href="api/traceability.xml" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-mono">/api/traceability.xml</a>
              </div>
              <button
                type="button"
                onClick={() => setShowXmlModal(false)}
                className="w-full sm:w-auto rounded-xl bg-[#c5a880] hover:bg-[#d6ba94] px-5 py-2 font-bold text-[#07100b] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
