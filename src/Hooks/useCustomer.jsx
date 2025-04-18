import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useCustomer = () => {
    const baseUrl = useApiConfig();

    const { data: customers = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const url = `${baseUrl}/customers`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [customers, loading, refetch];
};

export default useCustomer;