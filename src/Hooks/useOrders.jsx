import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useOrders = () => {
    const baseUrl = useApiConfig();

    const { data: orders = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const url = `${baseUrl}/orders`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [orders, loading, refetch];
};

export default useOrders;