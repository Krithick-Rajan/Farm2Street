import React, { useState } from 'react';
import { Check, QrCode } from 'lucide-react';
import { Produce } from '../../types';

interface FreshHarvestsProps {
  produceList: Produce[];
  onAddToCart: (item: Produce) => void;
  onInspectBatch: (batchId: string) => void;
}

export const FreshHarvests: React.FC<FreshHarvestsProps> = ({
  produceList,
  onAddToCart,
  onInspectBatch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Vegetables', 'Greens', 'Root', 'Exotic'];

  const filtered =
    selectedCategory === 'All'
      ? produceList
      : produceList.filter((p) => p.category === selectedCategory);

  const handleAdd = (item: Produce) => {
    onAddToCart(item);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  return (
    <section id="marketplace" className="max-w-[1440px] mx-auto px-5 md:px-[5vw] py-20">
      {/* Section Heading matching prototype */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-[34px] gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#687265] block">
            TODAY
          </span>
          <h2 className="font-sans text-[38px] font-bold leading-tight tracking-[-0.05em] text-[#182019] mt-1">
            Fresh harvests
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === cat
                  ? 'bg-[#183c2a] text-white shadow-sm'
                  : 'bg-white/80 text-[#6f776e] hover:bg-white hover:text-[#182019] border border-black/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4-column Produce Grid matching farm2street-full-premium-motion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-[18px]">
        {filtered.map((item) => {
          const isAdded = addedIds[item.id];
          return (
            <article key={item.id} className="group flex flex-col">
              {/* Image Container with Floating Button */}
              <div className="relative h-[260px] sm:h-[320px] w-full overflow-hidden rounded-[18px] bg-[#e4e4db]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />

                {/* Batch Inspection Pill (Top Left) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const batchKey = item.batchId || (item as any).batch_id || 'F2S-TM-20260920-01';
                    onInspectBatch(batchKey);
                  }}
                  title="Click to view batch traceability timeline"
                  className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white/90 transition-colors hover:bg-[#183c2a]"
                >
                  <QrCode className="h-3 w-3 text-[#c5a880]" />
                  <span>#{(item.batchId || (item as any).batch_id || 'BATCH').slice(-6)}</span>
                </button>

                {/* Floating Add to Cart Button (Bottom Right) */}
                <button
                  onClick={() => handleAdd(item)}
                  aria-label={`Add ${item.name} to basket`}
                  className={`absolute right-[14px] bottom-[14px] w-[42px] h-[42px] grid place-items-center rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.13)] transition-all duration-200 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-700 text-white scale-105'
                      : 'bg-[#faf9f1] text-[#183c2a] hover:bg-white hover:scale-105'
                  }`}
                >
                  {isAdded ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 8h12l1 13H5L6 8Z" />
                      <path d="M9 8a3 3 0 0 1 6 0" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Produce Info: Title on Left, ₹Price on Right */}
              <div className="flex items-center justify-between py-[15px] px-[2px]">
                <h3 className="font-sans text-[14px] font-semibold text-[#182019]">
                  {item.name}
                </h3>
                <div className="flex items-baseline gap-[3px]">
                  <strong className="font-sans text-[14px] font-bold text-[#182019]">
                    ₹{item.price}
                  </strong>
                  <span className="font-sans text-[10px] text-[#7d837b]">
                    /{item.unit}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
