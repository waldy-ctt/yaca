import {
  EMAIL_REGEX,
  PHONE_REGEX_WITH_0_PREFIX,
  PHONE_REGEX_WITH_COUNTRY_CODE,
  PHONE_REGEX_WITH_NO_PREFIX,
} from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getEnumKeyByValue<T extends Record<string, string>>(
  enumObject: T,
  value: string,
): keyof T | undefined {
  for (const key in enumObject) {
    if (enumObject[key] === value) {
      return key;
    }
  }
  return undefined;
}

export function validatePassword(value: string): boolean {
  if (!value) return false;
  if (value.length < 6) return false;
  // TODO: make strong password validation
  return true;
}

export function validateEmail(value: string): boolean {
  if (!value) return false;
  return EMAIL_REGEX.test(value);
}

export function validatePhoneWithCountryCode(value: string): boolean {
  if (!value) return false;
  return PHONE_REGEX_WITH_COUNTRY_CODE.test(value);
}

export function validatePhoneWith0Prefix(value: string): boolean {
  if (!value) return false;
  return PHONE_REGEX_WITH_0_PREFIX.test(value);
}

export function validatePhoneWithoutPrefix(value: string): boolean {
  if (!value) return false;
  return PHONE_REGEX_WITH_NO_PREFIX.test(value);
}

export function validateIdentifier(value: string): boolean {
  if (!value.trim()) return false;

  // Phone with country code
  if (value.startsWith("+")) {
    const countryCodeMatch = value.match(/^\+(\d{1,3})(\d+)$/);
    if (!countryCodeMatch) return false;

    const [, countryCode, phoneNumber] = countryCodeMatch;
    const validCountryCodes = [
      "1",
      "44",
      "84",
      "86",
      "91",
      "81",
      "82",
      "33",
      "49",
      "61",
      "55",
      "7",
      "34",
      "39",
      "31",
      "46",
      "47",
      "45",
      "358",
      "48",
      "420",
      "421",
      "40",
    ];

    if (!validCountryCodes.includes(countryCode)) return false;

    if (phoneNumber.length !== 9) return false;

    return true;
  }

  if (value.startsWith("0")) {
    if (!validatePhoneWith0Prefix(value)) return false;
    return true;
  }
  return validatePhoneWithoutPrefix(value);
}

/**
 * Joins a list of names and truncates them if they get too long.
 * @param names Array of strings (e.g. ["Hậu", "Hiếu", "Linh"])
 * @param maxLength The character limit before cutting (Default: 30)
 */
export function formatParticipantNames(names: string[], maxLength: number = 30): string {
  // 1. Join them nicely
  const joined = names.join(", ");

  // 2. Check if it fits
  if (joined.length <= maxLength) {
    return joined;
  }

  // 3. Truncate and add ellipsis
  // We subtract 3 so the final string (including "...") fits exactly within maxLength
  return joined.slice(0, maxLength - 3) + "...";
}

// --- usage examples ---

const group = ["Hậu", "Hiếu", "Linh"];

// Case 1: Fits perfectly
console.log(formatParticipantNames(group)); 
// Output: "Hậu, Hiếu, Linh"

// Case 2: Too long (Simulating a small screen or many names)
const bigGroup = ["Hậu", "Hiếu", "Linh", "Kevin", "Michael", "Sarah"];
console.log(formatParticipantNames(bigGroup, 20)); 
// Output: "Hậu, Hiếu, Linh, ..."
