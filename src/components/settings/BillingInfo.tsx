"use client";

export function BillingInfo() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm md:text-base font-semibold text-foreground mb-2">
            当前团队计划
          </div>
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm font-medium rounded-full">
            免费计划
          </div>
        </div>

        {/* 升级按钮 */}
        <button className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
          升级计划
        </button>
      </div>
    </div>
  );
}
