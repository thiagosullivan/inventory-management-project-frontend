import { fetchNextBarcode } from "@/services/products";
import { useQuery } from "@tanstack/react-query";

export function useBarcodePreview() {
  return useQuery({
    queryKey: ["barcode", "next"],
    queryFn: fetchNextBarcode,
    enabled: false,
    gcTime: 0,
    staleTime: 0,
  });
}
