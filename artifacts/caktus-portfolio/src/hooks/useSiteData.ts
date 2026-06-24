import { useQuery } from "@tanstack/react-query";
import { api, type AudioTrack, type PortfolioItem, type SocialLink, type Service, type ContactMessage, type LoginActivity, type Testimonial } from "@/lib/api";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.getSettings(),
    staleTime: 30_000,
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social-links"],
    queryFn: () => api.getSocial(false),
    staleTime: 30_000,
  });
}

export function useAudioTracks() {
  return useQuery({
    queryKey: ["audio-tracks"],
    queryFn: () => api.getTracks(false),
    staleTime: 30_000,
  });
}

export function usePortfolioItems() {
  return useQuery({
    queryKey: ["portfolio-items"],
    queryFn: () => api.getPortfolio(false),
    staleTime: 30_000,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => api.getServices(false),
    staleTime: 30_000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: () => api.getTestimonials(false),
    staleTime: 30_000,
  });
}

export function useMessages() {
  return useQuery({
    queryKey: ["contact-messages"],
    queryFn: () => api.getMessages(),
    staleTime: 10_000,
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ["login-activity"],
    queryFn: () => api.getActivity(),
    staleTime: 15_000,
  });
}

export type { AudioTrack, PortfolioItem, SocialLink, Service, ContactMessage, LoginActivity, Testimonial };
