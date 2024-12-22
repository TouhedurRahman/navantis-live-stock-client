import { useQuery } from "@tanstack/react-query";

const useDepotExpireRequest = () => {
    const { data: products = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const url = 'http://localhost:5000/expire-request';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [products, loading, refetch];
};

export default useDepotExpireRequest;