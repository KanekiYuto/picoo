"use client";

export function BillingInfo() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm md:text-base font-semibold text-foreground mb-2">
            Current team plan
          </div>
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm font-medium rounded-full">
            Free plan
          </div>
        </div>

        {/* 升级按钮 */}
        <button className="w-full sm:w-auto px-5 py-2 bg-gradient-primary text-white text-sm font-medium rounded-xl transition-all whitespace-nowrap hover:opacity-90">
          Upgrade plan
        </button>
      </div>
    </div>
  );
}
