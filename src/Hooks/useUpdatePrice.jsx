import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useUpdatePrice = () => {
    const baseUrl = useApiConfig();

    const { data: updatePrices = [], isLoading: updatePricesLoading, refetch } = useQuery({
        queryKey: ['updatePrices'],
        queryFn: async () => {
            const url = `${baseUrl}/price-update`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [updatePrices, updatePricesLoading, refetch];
};

export default useUpdatePrice;