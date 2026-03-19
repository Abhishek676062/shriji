import React from 'react';

interface EmotionBadgeProps {
  emotion?: string;
  domain?: string;
}

const colorMap: Record<string, string> = {
  anger: "bg-red-100 text-red-800 border-red-200",
  fear: "bg-blue-100 text-blue-800 border-blue-200",
  grief: "bg-gray-100 text-gray-800 border-gray-200",
  confusion: "bg-amber-100 text-amber-800 border-amber-200",
  despair: "bg-slate-800 text-white border-slate-700",
  greed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  lust: "bg-pink-100 text-pink-800 border-pink-200",
  ego: "bg-indigo-100 text-indigo-800 border-indigo-200",
  attachment: "bg-purple-100 text-purple-800 border-purple-200",
  doubt: "bg-yellow-100 text-yellow-800 border-yellow-200",
  anxiety: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

export default function EmotionBadge({ emotion, domain }: EmotionBadgeProps) {
  if (!emotion && !domain) return null;

  const renderBadge = (item: string) => {
    const key = item.toLowerCase().trim();
    // Default fallback pill is our primary Gold brand styling
    const colorClass = colorMap[key] || "bg-gold/20 text-saffron border-gold/30";
    
    return (
      <span key={item} className={`px-2 py-0.5 text-xs font-semibold rounded-full border shadow-sm ${colorClass} capitalize`}>
        {item.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {emotion && renderBadge(emotion)}
      {domain && renderBadge(domain)}
    </div>
  );
}
