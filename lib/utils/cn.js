import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind classes ko safely merge karta hai (conflicts resolve karke).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
