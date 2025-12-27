"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Gem, Clock, TrendingUp, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettingsNav } from "../_components/SettingsNavContext";
import { useUserStore } from "@/stores/userStore";
import { getPlanInfo } from "@/lib/utils/plan";
import { CreditsSkeleton } from "./CreditsSkeleton";

// 积分信息类型
interface CreditInfo {
  id: string;
  type: string;
  amount: number;
  consumed: number;
  remaining: number;
  issuedAt: string;
  expiresAt: string | null;
}


export default function CreditsPage() {
  const t = useTranslations("settings.credits");
  const tPlans = useTranslations("common.plans");
  const { openMenu } = useSettingsNav();
  const { user, isLoading: userLoading } = useUserStore();
  const [credits, setCredits] = useState<CreditInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  // 获取积分信息
  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoading(true);
      // 设置最小显示时间为 300ms，避免闪烁
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const response = await fetch('/api/credit/balance');

        if (!response.ok) {
          throw new Error('Failed to fetch credits');
        }

        const data = await response.json();
        setCredits(data.credits || []);
      } catch (error) {
        console.error('Failed to fetch credits:', error);
        // 发生错误时设置为空数组
        setCredits([]);
      } finally {
        await minLoadingTime;
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCredits();
    }
  }, [user]);

  // 计算总积分
  const totalCredits = credits.reduce((sum, credit) => sum + credit.remaining, 0);

  // 获取套餐信息
  const planInfo = user ? getPlanInfo(user.type, (key) => tPlans(key)) : null;

  // 筛选积分
  const filteredCredits = credits.filter((credit) => {
    if (filter === 'all') return true;
    const isExpired = credit.expiresAt && new Date(credit.expiresAt).getTime() < Date.now();
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return isExpired;
    return true;
  });

  if (userLoading) {
    return <CreditsSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">未登录</div>
      </div>
    );
  }

  if (isLoading) {
    return <CreditsSkeleton />;
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

      {/* 积分总览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 当前积分 */}
        <div className="bg-sidebar-bg border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Gem className="h-4 w-4" />
              <span>{t("overview.currentBalance")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalCredits}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            {t("overview.availableCredits")}
          </div>
        </div>

        {/* 当前套餐 */}
        <div className="bg-sidebar-bg border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <TrendingUp className="h-4 w-4" />
              <span>{t("overview.currentPlan")}</span>
            </div>
          </div>
          {planInfo && (
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${planInfo.colorClass}`}>
                {planInfo.name}
              </span>
            </div>
          )}
        </div>

        {/* 今日消耗 */}
        <div className="bg-sidebar-bg border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar className="h-4 w-4" />
              <span>{t("overview.todayUsage")}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {credits[0]?.consumed || 0}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {t("overview.creditsUsed")}
          </div>
        </div>
      </div>

      {/* 积分详情 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">{t("details.title")}</h2>

          {/* 筛选组件 */}
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
                  layoutId="filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 ${filter === 'all' ? 'text-background' : ''}`}>
                {t("details.filter.all")}
              </span>
            </motion.button>
            <motion.button
              onClick={() => setFilter('active')}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === 'active'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'active' && (
                <motion.div
                  layoutId="filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 ${filter === 'active' ? 'text-background' : ''}`}>
                {t("details.filter.active")}
              </span>
            </motion.button>
            <motion.button
              onClick={() => setFilter('expired')}
              className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === 'expired'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'expired' && (
                <motion.div
                  layoutId="filter-tab"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 ${filter === 'expired' ? 'text-background' : ''}`}>
                {t("details.filter.expired")}
              </span>
            </motion.button>
          </div>
        </div>

        {filteredCredits.length === 0 ? (
          <div className="bg-sidebar-bg border border-border rounded-2xl p-6 text-center text-muted-foreground">
            {credits.length === 0 ? t("details.noCredits") : t("details.noMatchingCredits")}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCredits.map((credit) => {
              const percentage = credit.amount > 0 ? (credit.remaining / credit.amount) * 100 : 0;
              const usageRate = 100 - percentage; // 使用率
              const isExpiringSoon = credit.expiresAt && new Date(credit.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

              // 根据使用率确定进度条颜色
              let progressColor = '';
              if (usageRate < 50) {
                // 使用率 < 50%: 绿色
                progressColor = 'bg-green-600 dark:bg-green-500';
              } else if (usageRate < 80) {
                // 使用率 50-80%: 黄色
                progressColor = 'bg-yellow-600 dark:bg-yellow-500';
              } else {
                // 使用率 >= 80%: 红色
                progressColor = 'bg-red-600 dark:bg-red-500';
              }

              return (
                <div key={credit.id} className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
                  {/* 标题和状态 */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">
                      {t(`details.types.${credit.type}`)}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded ${
                      isExpiringSoon
                        ? 'bg-yellow-950/80 text-yellow-400'
                        : 'bg-green-950/80 text-green-400'
                    }`}>
                      {isExpiringSoon ? t("details.expiringSoon") : t("details.active")}
                    </span>
                  </div>

                  {/* 日期范围 */}
                  {credit.expiresAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 bg-sidebar-hover/50 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(credit.issuedAt).toLocaleDateString()} → {new Date(credit.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* 主要数据显示 */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        {credit.remaining.toLocaleString()}
                      </span>
                      <span className="text-lg text-muted-foreground">
                        / {credit.amount.toLocaleString()}
                      </span>
                      <span className="ml-auto text-base font-medium text-muted">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-5">
                    <div className="h-3 bg-sidebar-hover rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* 已消耗和剩余 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-sidebar-hover/50 rounded-xl p-3 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">{t("details.consumed")}</div>
                      <div className="text-lg font-semibold text-foreground">{credit.consumed.toLocaleString()}</div>
                    </div>
                    <div className="bg-sidebar-hover/50 rounded-xl p-3 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">{t("details.remaining")}</div>
                      <div className="text-lg font-semibold text-foreground">{credit.remaining.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
