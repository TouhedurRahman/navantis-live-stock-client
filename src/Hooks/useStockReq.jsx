import { useQuery } from "@tanstack/react-query";

const useStockReq = () => {
    const { data: products = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const url = 'http://localhost:5000/wh-req';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [products, loading, refetch];
};

export default useStockReq;