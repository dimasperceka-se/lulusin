import { useMutation } from "@tanstack/react-query";
import { api, type WaitlistInput, type WaitlistResponse } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useCreateWaitlist() {
  return useMutation({
    mutationFn: async (data: WaitlistInput): Promise<WaitlistResponse> => {
      const res = await apiRequest(
        api.waitlist.create.method,
        api.waitlist.create.path,
        data
      );
      return await res.json();
    },
  });
}
