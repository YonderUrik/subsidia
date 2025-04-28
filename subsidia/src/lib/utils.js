import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(number, currency = true) {
  return new Intl.NumberFormat("it-IT", {
    style: currency ? "currency" : "decimal",
    currency: currency ? "EUR" : undefined
  }).format(number);
}

