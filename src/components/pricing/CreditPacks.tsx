"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CREDIT_PACKS,
  getCreemPayCreditPackProductId,
} from "@/shared/payment/config/payment";
import { CREDIT_PACK_ACCENT_COLORS_BY_NAME } from "@/shared/payment/config/payment.constants";
import { createPaymentCheckout } from "@/shared/payment/client";

type CreditPackWithProduct = (typeof CREDIT_PACKS)[number] & {
  productId: ReturnType<typeof getCreemPayCreditPackProductId>;
  bonusRate?: number;
};

interface CreditPacksProps {
  user?: { id: string; email: string; name?: string } | null;
  i18nNamespace?: string;
  variant?: "settings" | "pricing";
}

export function CreditPacks({
  user,
  i18nNamespace = "settings.credits.packs",
  variant = "settings",
}: CreditPacksProps) {
  const t = useTranslations(i18nNamespace);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const isPricingVariant = variant === "pricing";

  const packs = useMemo<CreditPackWithProduct[]>(
    () =>
      CREDIT_PACKS.map((pack) => ({
        ...pack,
        productId: getCreemPayCreditPackProductId(pack.id),
      })),
    [],
  );

  const gridClassName = isPricingVariant
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4";
  const headerClassName = isPricingVariant
    ? "flex items-center justify-between px-1"
    : "flex items-center justify-between";
  const headerTitleClass = isPricingVariant
    ? "text-sm font-semibold text-foreground"
    : "text-sm font-medium text-foreground/90";
  const headerHintClass = isPricingVariant
    ? "text-xs text-muted-foreground"
    : "text-xs text-foreground/70";

  const groupedPacks = useMemo(() => {
    const groups = new Map<number, CreditPackWithProduct[]>();
    packs.forEach((pack) => {
      if (!groups.has(pack.validDays)) {
        groups.set(pack.validDays, []);
      }
      groups.get(pack.validDays)?.push(pack);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [packs]);

  const getAccentColor = (pack: CreditPackWithProduct) =>
    CREDIT_PACK_ACCENT_COLORS_BY_NAME[pack.name.toLowerCase()] || "bg-[#3A86FF]";

  const getButtonLabel = (pack: CreditPackWithProduct, isLoading: boolean) => {
    if (!user) return t("loginRequired");
    if (!pack.productId) return t("configuring");
    if (isLoading) return t("processing");
    return t("cta");
  };

  const getButtonClassName = (disabled: boolean) =>
    isPricingVariant
      ? `w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          disabled
            ? "bg-white/20 text-white cursor-not-allowed"
            : "bg-white text-black hover:bg-white/90 cursor-pointer"
        }`
      : `w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`;

  const getBonusLabel = (pack: CreditPackWithProduct) =>
    t("bonusRate", { percent: Math.round((pack.bonusRate ?? 0) * 100) });

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      Math.round(value),
    );

  const formatCredits = (value: number) => {
    const absValue = Math.abs(value);
    const formatWithUnit = (amount: number, unit: "k" | "w") => {
      const rounded = Math.round(amount * 10) / 10;
      return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}${unit}`;
    };

    if (absValue >= 10000) return formatWithUnit(value / 10000, "w");
    if (absValue >= 1000) return formatWithUnit(value / 1000, "k");
    return `${value}`;
  };

  const getTotalCreditsLabel = (pack: CreditPackWithProduct) =>
    t("credits", { credits: formatCredits(pack.credits) });

  const getPromoLabel = (
    baseCredits: number,
    bonusCredits: number,
    isPricing: boolean,
  ) => {
    const tagClassName = isPricing
      ? "inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs md:text-xs lg:text-sm mx-1"
      : "inline-flex items-center px-2 py-0.5 rounded bg-primary/15 text-primary font-semibold text-xs md:text-xs lg:text-sm mx-1";

    return t.rich("creditsPromo", {
      base: formatCredits(baseCredits),
      bonus: formatCredits(bonusCredits),
      tag: (chunks) => <span className={tagClassName}>{chunks}</span>,
    });
  };

  const getMiniMarketingLabel = (baseCredits: number) =>
    t("marketing.mini", { base: formatCredits(baseCredits) });

  const startCheckout = async (pack: CreditPackWithProduct) => {
    if (!user || !pack.productId) {
      return;
    }
    setLoadingPackId(pack.id);
    try {
      const { checkoutUrl } = await createPaymentCheckout({
        productId: pack.productId,
        successUrl: `${window.location.origin}/subscription/success`,
        metadata: {
          userId: user.id,
          packId: pack.id,
          source: variant,
        },
        customer: {
          email: user.email,
          name: user.name,
        },
      });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } finally {
      setLoadingPackId(null);
    }
  };

  const renderCardContent = (pack: CreditPackWithProduct, isLoading: boolean) => {
    const buttonLabel = getButtonLabel(pack, isLoading);
    const buttonDisabled = !user || !pack.productId || isLoading;
    const bonusPercent = Math.round((pack.bonusRate ?? 0) * 100);
    const shouldShowBonus = bonusPercent > 0;

    if (isPricingVariant) {
      return (
        <div className="rounded-xl overflow-hidden bg-[#0F0F0F] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.0)_100%)] flex flex-col flex-1">
          <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                {pack.name}
              </h3>
              {shouldShowBonus && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs md:text-xs lg:text-sm whitespace-nowrap">
                  {t("bonusRate", { percent: bonusPercent })}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                ${formatPrice(pack.price)}
              </div>
              <div className="text-xs md:text-sm lg:text-lg text-white/70">
                {getTotalCreditsLabel(pack)}
              </div>
            </div>
            {shouldShowBonus ? (
              <div className="mb-6 text-xs md:text-sm lg:text-base text-white/70">
                {getPromoLabel(
                  Math.round(pack.credits / (1 + (pack.bonusRate ?? 0))),
                  Math.max(
                    0,
                    pack.credits - Math.round(pack.credits / (1 + (pack.bonusRate ?? 0))),
                  ),
                  true,
                )}
              </div>
            ) : pack.name.toLowerCase() === "mini" ? (
              <div className="mb-6 text-xs md:text-sm lg:text-base text-white/70">
                {getMiniMarketingLabel(
                  Math.round(pack.credits / (1 + (pack.bonusRate ?? 0))),
                )}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => startCheckout(pack)}
              disabled={buttonDisabled}
              className={`${getButtonClassName(buttonDisabled)} mt-auto`}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-muted-foreground/10 bg-background p-4 flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-semibold">{pack.name}</div>
          {shouldShowBonus && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/15 text-primary font-semibold text-xs md:text-xs lg:text-sm whitespace-nowrap">
              {t("bonusRate", { percent: bonusPercent })}
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-lg font-bold text-foreground">${formatPrice(pack.price)}</div>
          <div className="text-xs text-muted-foreground">
            {getTotalCreditsLabel(pack)}
          </div>
        </div>
        {shouldShowBonus ? (
          <div className="text-xs text-muted-foreground">
            {getPromoLabel(
              Math.round(pack.credits / (1 + (pack.bonusRate ?? 0))),
              Math.max(
                0,
                pack.credits - Math.round(pack.credits / (1 + (pack.bonusRate ?? 0))),
              ),
              false,
            )}
          </div>
        ) : pack.name.toLowerCase() === "mini" ? (
          <div className="text-xs text-muted-foreground">
            {getMiniMarketingLabel(
              Math.round(pack.credits / (1 + (pack.bonusRate ?? 0))),
            )}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => startCheckout(pack)}
          disabled={buttonDisabled}
          className={`${getButtonClassName(buttonDisabled)} mt-auto`}
        >
          {buttonLabel}
        </button>
      </div>
    );
  };

  const renderPackCard = (pack: CreditPackWithProduct) => {
    const isLoading = loadingPackId === pack.id;
    const cardContent = renderCardContent(pack, isLoading);
    const cardWrapper = isPricingVariant ? (
      <div className={`relative h-full rounded-2xl p-[3px] flex flex-col ${getAccentColor(pack)}`}>
        {cardContent}
      </div>
    ) : (
      cardContent
    );

    return <div key={pack.id}>{cardWrapper}</div>;
  };

  return (
    <div className="space-y-3">
      <div className={headerClassName}>
        <h2 className={headerTitleClass}>{t("title")}</h2>
        <span className={headerHintClass}>{t("hint")}</span>
      </div>

      <div className={isPricingVariant ? "space-y-5" : "space-y-4"}>
        {groupedPacks.map(([days, items]) => (
          <div key={days} className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={
                  isPricingVariant
                    ? "rounded-md border border-muted/30 bg-transparent px-3 py-1.5 text-sm font-medium text-foreground/80"
                    : "text-xs font-medium text-muted-foreground"
                }
              >
                {t("groupTitle", { days })}
              </span>
              {isPricingVariant && <div className="h-px flex-1 border-t-2 border-dashed border-muted/30" />}
            </div>
            <div className={gridClassName}>
              {items.map((pack) => renderPackCard(pack))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
