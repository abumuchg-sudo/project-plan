import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Case } from "@shared/schema";

// Helper for polling interval
const POLL_INTERVAL = 3000; // 3 seconds

// GET /api/cases (History)
export function useCases() {
  return useQuery({
    queryKey: [api.cases.list.path],
    queryFn: async () => {
      const res = await fetch(api.cases.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cases");
      return api.cases.list.responses[200].parse(await res.json());
    },
    // Refresh history periodically to show status updates if needed
    refetchInterval: 10000, 
  });
}

// GET /api/cases/:id (Single Case Status)
export function useCase(id: number) {
  return useQuery({
    queryKey: [api.cases.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cases.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch case");
      return api.cases.get.responses[200].parse(await res.json());
    },
    // Poll while status is pending or processing
    refetchInterval: (query) => {
      const data = query.state.data as Case | undefined;
      if (data?.status === 'pending' || data?.status === 'processing') {
        return POLL_INTERVAL;
      }
      return false;
    },
  });
}

// POST /api/cases (Upload & Create)
export function useCreateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Note: We use FormData directly, so we don't stringify body
      // and we don't set Content-Type header (browser sets it with boundary)
      const res = await fetch(api.cases.create.path, {
        method: api.cases.create.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create case");
      }
      
      return api.cases.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cases.list.path] });
    },
  });
}

// Optional: POST /api/cases/:id/process (Retry processing)
export function useProcessCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cases.process.path, { id });
      const res = await fetch(url, {
        method: api.cases.process.method,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to start processing");
      return api.cases.process.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.cases.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.cases.list.path] });
    },
  });
}
