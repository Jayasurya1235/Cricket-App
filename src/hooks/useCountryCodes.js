import { useQuery } from "@tanstack/react-query";
import { countryCodesApi } from "../api/countryCodes";

export function useCountryCodes() {
  return useQuery({
    queryKey: ["country-codes"],
    queryFn: () => countryCodesApi.list(),
    staleTime: 1000 * 60 * 60,
  });
}
