import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserRole } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDashboardPath = (role?: UserRole | null) => {
  if (!role) return "/login";
  return {
    farmer: '/dashboard',
    dealer: '/dealer/dashboard',
    admin: '/admin/dashboard',
  }[role] || '/login';
};
