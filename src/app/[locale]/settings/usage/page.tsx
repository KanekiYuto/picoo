"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, TrendingDown, Calendar, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettingsNav } from "../_components/SettingsNavContext";
import { useUserStore } from "@/stores/userStore";
import { UsageSkeleton } from "./UsageSkeleton";

// 用量记录类型
interface UsageRecord {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
  creditType: string;
}

export default function UsagePage() {
  const t = useTranslations("settings.usage");
  const { openMenu } = useSettingsNav();
  const { user, isLoading: userLoading } = useUserStore();
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'consume' | 'refund'>('all');

  // 获取用量记录
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/credit/usage');

        if (!response.ok) {
          throw new Error('Failed to fetch usage');
        }

        const data = await response.json();
        setRecords(data.records || []);
      } catch (error) {
        console.error('Failed to fetch usage:', error);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUsage();
    }
  }, [user]);

  // 筛选记录
  const filteredRecords = records.filter((record) => {
    if (filter === 'all') return true;
    return record.type === filter;
  });

  // 计算总消耗
  const totalConsumed = records
    .filter((r) => r.type === 'consume')
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);

  if (userLoading || isLoading) {
    return <UsageSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">未登录</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="lg:hidden flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar-hover border border-border text-foreground hover:bg-sidebar-active transition-colors"
              aria-label={t("openMenu")}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              {t("title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("description")}
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-sidebar-bg border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <TrendingDown className="h-4 w-4" />
              <span>{t("stats.totalConsumed")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalConsumed.toLocaleString()}</div>
        </div>

        <div className="bg-sidebar-bg border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar className="h-4 w-4" />
              <span>{t("stats.recordCount")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{filteredRecords.length}</div>
        </div>

        <div className="bg-sidebar-bg border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <FileText className="h-4 w-4" />
              <span>{t("stats.avgPerRecord")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {records.length > 0 ? Math.round(totalConsumed / records.filter(r => r.type === 'consume').length || 0) : 0}
          </div>
        </div>
      </div>

      {/* 用量明细表格 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">{t("table.title")}</h2>

          {/* 筛选按钮 */}
          <div className="relative flex gap-1 bg-sidebar-bg border border-border rounded-lg p-1">
            <motion.button
              onClick={() => setFilter('all')}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'all' && (
                <motion.div
                  layoutId="usage-filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 ${filter === 'all' ? 'text-background' : ''}`}>
                {t("filter.all")}
              </span>
            </motion.button>
            <motion.button
              onClick={() => setFilter('consume')}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === 'consume'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'consume' && (
                <motion.div
                  layoutId="usage-filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 ${filter === 'consume' ? 'text-background' : ''}`}>
                {t("filter.consume")}
              </span>
            </motion.button>
            <motion.button
              onClick={() => setFilter('refund')}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === 'refund'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'refund' && (
                <motion.div
                  layoutId="usage-filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 ${filter === 'refund' ? 'text-background' : ''}`}>
                {t("filter.refund")}
              </span>
            </motion.button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-sidebar-bg border border-border rounded-2xl p-6 text-center text-muted-foreground">
            {records.length === 0 ? t("table.noRecords") : t("table.noMatchingRecords")}
          </div>
        ) : (
          <div className="bg-sidebar-bg border border-border rounded-2xl overflow-hidden">
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sidebar-hover/50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.time")}
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.type")}
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.description")}
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.amount")}
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("table.columns.balance")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-sidebar-hover/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-foreground">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          record.type === 'consume'
                            ? 'bg-red-950/80 text-red-400'
                            : 'bg-green-950/80 text-green-400'
                        }`}>
                          {t(`table.types.${record.type}`)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {record.note || '-'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm">
                        <span className={`font-semibold ${
                          record.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.amount > 0 ? '+' : ''}{record.amount}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm text-muted-foreground">
                        {record.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
