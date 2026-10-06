'use client';

export const PROMO_EXPIRES_AT_KEY = 'reroom_promo_expires_at';
export const PROMO_PURCHASED_AT_KEY = 'reroom_promo_purchased_at';
export const PROMO_PURCHASED_PLAN_KEY = 'reroom_promo_purchased_plan';
export const PROMO_PURCHASED_CREDITS_KEY = 'reroom_promo_purchased_credits';
export const PROMO_STORAGE_EVENT = 'reroom:storage';

// 프로모션 결제 내역 유효기간: 30일 (ms)
export const PROMO_VALIDITY_DAYS = 30;
export const PROMO_VALIDITY_MS = PROMO_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

/**
 * 프로모션 기간 결제 시 30일 유효기간 기록
 */
export function recordPromoPurchase(planId: string, creditsAdded: number) {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const expiresAt = now + PROMO_VALIDITY_MS;

  localStorage.setItem(PROMO_PURCHASED_AT_KEY, String(now));
  localStorage.setItem(PROMO_EXPIRES_AT_KEY, String(expiresAt));
  localStorage.setItem(PROMO_PURCHASED_PLAN_KEY, planId);
  localStorage.setItem(PROMO_PURCHASED_CREDITS_KEY, String(creditsAdded));

  window.dispatchEvent(new Event(PROMO_STORAGE_EVENT));
}

export interface PromoExpiryStatus {
  hasPromoPurchase: boolean;
  isExpired: boolean;
  expiresAt: number | null;
  daysRemaining: number;
  hoursRemaining: number;
  formattedRemaining: string;
}

/**
 * 프로모션 구매 내역의 30일 만료 여부 확인 및 30일 경과 시 제로(0)화 초기화
 */
export function checkAndHandlePromoExpiry(): PromoExpiryStatus {
  if (typeof window === 'undefined') {
    return {
      hasPromoPurchase: false,
      isExpired: false,
      expiresAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      formattedRemaining: '',
    };
  }

  const rawExpiresAt = localStorage.getItem(PROMO_EXPIRES_AT_KEY);
  if (!rawExpiresAt) {
    return {
      hasPromoPurchase: false,
      isExpired: false,
      expiresAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      formattedRemaining: '',
    };
  }

  const expiresAt = parseInt(rawExpiresAt, 10);
  const now = Date.now();

  // 30일 경과 시: 크레딧 및 구독 상태를 제로(0)로 초기화!
  if (now >= expiresAt) {
    localStorage.setItem('reroom_free_generations', '0');
    localStorage.setItem('reroom_user_plan', 'free');
    localStorage.removeItem('reroom_pro_subscribed');
    localStorage.removeItem(PROMO_EXPIRES_AT_KEY);
    localStorage.removeItem(PROMO_PURCHASED_AT_KEY);
    localStorage.removeItem(PROMO_PURCHASED_PLAN_KEY);
    localStorage.removeItem(PROMO_PURCHASED_CREDITS_KEY);
    localStorage.setItem('reroom_promo_expired_notice', 'true');

    // UI 전체 실시간 갱신 이벤트 발송
    window.dispatchEvent(new Event(PROMO_STORAGE_EVENT));

    return {
      hasPromoPurchase: true,
      isExpired: true,
      expiresAt,
      daysRemaining: 0,
      hoursRemaining: 0,
      formattedRemaining: '0일 (만료됨)',
    };
  }

  // 아직 유효한 경우 남은 일수/시간 계산
  const remainingMs = expiresAt - now;
  const daysRemaining = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hoursRemaining = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return {
    hasPromoPurchase: true,
    isExpired: false,
    expiresAt,
    daysRemaining,
    hoursRemaining,
    formattedRemaining: daysRemaining > 0 ? `D-${daysRemaining}` : `${hoursRemaining}시간 남음`,
  };
}
