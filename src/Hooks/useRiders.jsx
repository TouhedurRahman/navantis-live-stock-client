import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useRiders = () => {
    const baseUrl = useApiConfig();

    const { data: riders = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['riders'],
        queryFn: async () => {
            const url = `${baseUrl}/riders`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [riders, loading, refetch];
};

export default useRiders;