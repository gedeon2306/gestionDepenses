// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    EMAIL_SEND: '/auth/email-send',
    CONFIRM: '/auth/confirm',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    SETTINGS: '/dashboard/settings',
    USER_PROFILE: '/dashboard/profile/',
    RAPPORT: '/dashboard/rapport/',
    // USER_PROFILE: (id: string) => `/dashboard/users/${id}`,
  },
} as const;