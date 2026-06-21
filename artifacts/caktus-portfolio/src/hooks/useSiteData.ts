import { useQuery } from "@tanstack/react-query";
import { api, type AudioTrack, type PortfolioItem, type SocialLink } from "@/lib/api";

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

export type { AudioTrack, PortfolioItem, SocialLink };
