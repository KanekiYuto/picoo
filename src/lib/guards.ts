import { useUserStore } from "@/stores/userStore";
import { useModalStore } from "@/store/useModalStore";

/**
 * 执行需要登录的操作
 * 如果用户已登录则执行回调函数，否则打开登录模态框
 *
 * @param callback - 用户已登录时执行的回调函数
 * @returns 是否执行了回调函数
 */
export function requireAuth(callback: () => void): boolean {
  const { isAuthenticated } = useUserStore.getState();
  const { openLoginModal } = useModalStore.getState();

  if (isAuthenticated) {
    callback();
    return true;
  } else {
    openLoginModal();
    return false;
  }
}

/**
 * 执行需要付费用户的操作
 * 如果用户不是免费用户则执行回调函数，否则打开定价模态框
 *
 * @param callback - 用户为付费用户时执行的回调函数
 * @returns 是否执行了回调函数
 */
export function requirePaidUser(callback: () => void): boolean {
  const { user } = useUserStore.getState();
  const { openPricingModal } = useModalStore.getState();

  if (user && user.type !== 'free') {
    callback();
    return true;
  } else {
    openPricingModal();
    return false;
  }
}

/**
 * 组合使用：先检查登录，再检查是否为付费用户
 *
 * @param callback - 用户已登录且为付费用户时执行的回调函数
 * @returns 是否执行了回调函数
 */
export function requireAuthAndPaid(callback: () => void): boolean {
  return requireAuth(() => {
    requirePaidUser(callback);
  });
}
