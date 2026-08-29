import { useMutation, useQueryClient } from "@tanstack/react-query";
import { otpApi } from "../api/otp";

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => otpApi.verify(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}
