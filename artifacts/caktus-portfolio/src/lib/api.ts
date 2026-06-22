const BASE = "/api";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (username: string, password: string, rememberMe = false) =>
    req<{ ok: boolean }>("POST", "/auth/login", { username, password, rememberMe }),
  logout: () => req<{ ok: boolean }>("POST", "/auth/logout"),
  me: () => req<{ loggedIn: boolean }>("GET", "/auth/me"),

  // Settings
  getSettings: () => req<Record<string, string>>("GET", "/settings"),
  updateSettings: (data: Record<string, string>) => req<{ ok: boolean }>("PUT", "/settings", data),

  // Tracks
  getTracks: (all = false) => req<AudioTrack[]>("GET", all ? "/tracks/all" : "/tracks"),
  createTrack: (data: Partial<AudioTrack>) => req<AudioTrack>("POST", "/tracks", data),
  updateTrack: (id: number, data: Partial<AudioTrack>) => req<AudioTrack>("PUT", `/tracks/${id}`, data),
  deleteTrack: (id: number) => req<void>("DELETE", `/tracks/${id}`),

  // Portfolio
  getPortfolio: (all = false) => req<PortfolioItem[]>("GET", all ? "/portfolio/all" : "/portfolio"),
  createPortfolioItem: (data: Partial<PortfolioItem>) => req<PortfolioItem>("POST", "/portfolio", data),
  updatePortfolioItem: (id: number, data: Partial<PortfolioItem>) => req<PortfolioItem>("PUT", `/portfolio/${id}`, data),
  deletePortfolioItem: (id: number) => req<void>("DELETE", `/portfolio/${id}`),

  // Social links
  getSocial: (all = false) => req<SocialLink[]>("GET", all ? "/social/all" : "/social"),
  createSocialLink: (data: Partial<SocialLink>) => req<SocialLink>("POST", "/social", data),
  updateSocialLink: (id: number, data: Partial<SocialLink>) => req<SocialLink>("PUT", `/social/${id}`, data),
  deleteSocialLink: (id: number) => req<void>("DELETE", `/social/${id}`),

  // Services
  getServices: (all = false) => req<Service[]>("GET", all ? "/services/all" : "/services"),
  createService: (data: Partial<Service>) => req<Service>("POST", "/services", data),
  updateService: (id: number, data: Partial<Service>) => req<Service>("PUT", `/services/${id}`, data),
  deleteService: (id: number) => req<void>("DELETE", `/services/${id}`),

  // Testimonials
  getTestimonials: (all = false) => req<Testimonial[]>("GET", all ? "/testimonials/all" : "/testimonials"),
  createTestimonial: (data: Partial<Testimonial>) => req<Testimonial>("POST", "/testimonials", data),
  updateTestimonial: (id: number, data: Partial<Testimonial>) => req<Testimonial>("PUT", `/testimonials/${id}`, data),
  deleteTestimonial: (id: number) => req<void>("DELETE", `/testimonials/${id}`),

  // Contact messages
  submitContact: (data: { name: string; email: string; subject: string; message: string; _hp?: string }) =>
    req<{ ok: boolean }>("POST", "/contact", data),
  getMessages: () => req<ContactMessage[]>("GET", "/contact/messages"),
  getUnreadCount: () => req<{ count: number }>("GET", "/contact/unread-count"),
  markMessageRead: (id: number, read = true) =>
    req<{ ok: boolean }>("PUT", `/contact/messages/${id}/read`, { read }),
  deleteMessage: (id: number) => req<void>("DELETE", `/contact/messages/${id}`),

  // Login activity
  getActivity: () => req<LoginActivity[]>("GET", "/activity"),

  // Pricing
  getPricing: (all = false) => req<PricingItem[]>("GET", all ? "/pricing/all" : "/pricing"),
  createPricingItem: (data: Partial<PricingItem>) => req<PricingItem>("POST", "/pricing", data),
  updatePricingItem: (id: number, data: Partial<PricingItem>) => req<PricingItem>("PUT", `/pricing/${id}`, data),
  deletePricingItem: (id: number) => req<void>("DELETE", `/pricing/${id}`),

  // Upload
  requestUploadUrl: (name: string, size: number, contentType: string) =>
    req<{ uploadURL: string; objectPath: string }>("POST", "/storage/uploads/request-url", { name, size, contentType }),
};

export async function uploadFile(file: File): Promise<string> {
  const { uploadURL, objectPath } = await api.requestUploadUrl(file.name, file.size, file.type);
  await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  return objectPath;
}

export function storageUrl(objectPath: string): string {
  if (!objectPath) return "";
  if (objectPath.startsWith("http")) return objectPath;
  return `/api/storage${objectPath}`;
}

export interface AudioTrack {
  id: number; title: string; description: string; genre: string;
  iconName: string; audioUrl: string; coverUrl: string;
  sortOrder: number; active: boolean;
  createdAt: string; updatedAt: string;
}

export interface PortfolioItem {
  id: number; title: string; description: string; type: string;
  embedUrl: string; imageUrl: string; externalLink: string;
  sortOrder: number; active: boolean; createdAt: string; updatedAt: string;
}

export interface SocialLink {
  id: number; platform: string; url: string;
  sortOrder: number; active: boolean; updatedAt: string;
}

export interface Service {
  id: number; iconName: string; title: string; description: string;
  colorClass: string; sortOrder: number; active: boolean;
  createdAt: string; updatedAt: string;
}

export interface Testimonial {
  id: number; quote: string; authorName: string; authorTitle: string;
  authorAvatar: string; rating: number; sortOrder: number; active: boolean;
  createdAt: string; updatedAt: string;
}

export interface ContactMessage {
  id: number; name: string; email: string; subject: string;
  message: string; read: boolean; createdAt: string;
}

export interface LoginActivity {
  id: number; username: string; success: boolean;
  ipAddress: string; createdAt: string;
}

export interface PricingItem {
  id: number; iconName: string; title: string; subtitle: string;
  price: string; priceUnit: string; description: string; features: string;
  colorClass: string; popular: boolean; sortOrder: number; active: boolean;
  createdAt: string; updatedAt: string;
}
