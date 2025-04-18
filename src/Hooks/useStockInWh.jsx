import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useStockInWh = () => {
    const baseUrl = useApiConfig();

    const { data: products = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const url = `${baseUrl}/stock-in-wh`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [products, loading, refetch];
};

export default useStockInWh;