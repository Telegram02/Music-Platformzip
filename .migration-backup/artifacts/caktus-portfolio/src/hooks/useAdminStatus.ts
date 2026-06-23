import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAdminStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => api.me().catch(() => ({ loggedIn: false })),
    staleTime: 60_000,
    retry: false,
  });
  return { isAdmin: !!data?.loggedIn, isLoading };
}
