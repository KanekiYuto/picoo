'use client';

import { useTranslations } from 'next-intl';
import { CreemPortal } from '@creem_io/nextjs';

interface ManageSubscriptionButtonProps {
  customerId: string;
}

/**
 * 管理订阅按钮组件
 * 点击后打开 Creem 客户门户，用户可以管理订阅、查看发票等
 */
export function ManageSubscriptionButton({ customerId }: ManageSubscriptionButtonProps) {
  const t = useTranslations('settings.billing');

  return (
    <CreemPortal customerId={customerId}>
      <button className="px-4 py-2 bg-sidebar-hover hover:bg-sidebar-active border border-border text-foreground text-sm font-medium rounded-xl transition-colors cursor-pointer">
        {t('manageSubscription')}
      </button>
    </CreemPortal>
  );
}
