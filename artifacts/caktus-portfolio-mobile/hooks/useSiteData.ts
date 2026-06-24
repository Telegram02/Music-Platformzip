import { useQuery } from "@tanstack/react-query";
import { api, type AudioTrack, type PortfolioItem, type SocialLink, type Service, type PricingItem, type Testimonial } from "@/lib/api";

export function useSiteSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
    staleTime: 60_000,
  });
}

export function useAudioTracks() {
  return useQuery<AudioTrack[]>({
    queryKey: ["tracks"],
    queryFn: () => api.getTracks(),
    staleTime: 30_000,
  });
}

export function usePortfolioItems() {
  return useQuery<PortfolioItem[]>({
    queryKey: ["portfolio"],
    queryFn: () => api.getPortfolio(),
    staleTime: 30_000,
  });
}

export function useSocialLinks() {
  return useQuery<SocialLink[]>({
    queryKey: ["social"],
    queryFn: () => api.getSocial(),
    staleTime: 60_000,
  });
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: () => api.getServices(),
    staleTime: 60_000,
  });
}

export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => api.getTestimonials(),
    staleTime: 60_000,
  });
}

export function usePricing() {
  return useQuery<PricingItem[]>({
    queryKey: ["pricing"],
    queryFn: () => api.getPricing(),
    staleTime: 60_000,
  });
}
