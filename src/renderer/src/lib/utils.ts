import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  value: string
): keyof T | undefined {
  for (const key in enumObject) {
    if (enumObject[key] === value) {
      return key;
    }
  }
  return undefined;
}
