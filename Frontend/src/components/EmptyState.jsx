import React from "react";

export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-12 px-6 animate-fade">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-brand-500/10 border border-line text-brand-400">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {text && <p className="text-xs text-muted max-w-xs leading-relaxed">{text}</p>}
      {action}
    </div>
  );
}
