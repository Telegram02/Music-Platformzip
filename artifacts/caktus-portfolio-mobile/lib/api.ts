const domain = process.env.EXPO_PUBLIC_DOMAIN;
const BASE = domain ? `https://${domain}/api` : "/api";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface AudioTrack {
  id: number;
  title: string;
  description: string;
  genre: string;
  iconName: string;
  audioUrl: string;
  coverUrl: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  type: string;
  embedUrl: string;
  imageUrl: string;
  externalLink: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
  active: boolean;
  updatedAt: string;
}

export interface Service {
  id: number;
  iconName: string;
  title: string;
  description: string;
  colorClass: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  rating: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingItem {
  id: number;
  iconName: string;
  title: string;
  subtitle: string;
  price: string;
  priceUnit: string;
  description: string;
  features: string;
  colorClass: string;
  popular: boolean;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  getSettings: () => req<Record<string, string>>("GET", "/settings"),
  getTracks: () => req<AudioTrack[]>("GET", "/tracks"),
  getPortfolio: () => req<PortfolioItem[]>("GET", "/portfolio"),
  getSocial: () => req<SocialLink[]>("GET", "/social"),
  getServices: () => req<Service[]>("GET", "/services"),
  getTestimonials: () => req<Testimonial[]>("GET", "/testimonials"),
  getPricing: () => req<PricingItem[]>("GET", "/pricing"),
  submitContact: (data: { name: string; email: string; subject: string; message: string }) =>
    req<{ ok: boolean }>("POST", "/contact", data),
};

export function storageUrl(objectPath: string): string {
  if (!objectPath) return "";
  if (objectPath.startsWith("http")) return objectPath;
  const base = domain ? `https://${domain}` : "";
  return `${base}/api/storage${objectPath}`;
}
