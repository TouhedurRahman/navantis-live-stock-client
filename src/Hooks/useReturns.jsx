import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useReturns = () => {
    const baseUrl = useApiConfig();

    const { data: returns = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['returns'],
        queryFn: async () => {
            const url = `${baseUrl}/returns`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [returns, loading, refetch];
};

export default useReturns;