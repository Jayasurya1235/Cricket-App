import { useMutation } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function useResendOtp() {
  return useMutation({
    mutationFn: (playerId) => playersApi.resendOtp(playerId),
  });
}
