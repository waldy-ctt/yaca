// UPPER_SNAKE_CASE for const

export const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  SETTINGS: "/settings",
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_REGEX_WITH_COUNTRY_CODE = /^\+\d{1,3}\d{9}$/;

export const PHONE_REGEX_WITH_0_PREFIX = /^0\d{9}$/;

export const PHONE_REGEX_WITH_NO_PREFIX = /^\d{9}$/;
