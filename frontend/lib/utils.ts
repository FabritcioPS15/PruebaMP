import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSoles(monto: number): string {
  return `S/ ${monto.toLocaleString('es-PE')}`;
}
