import { useQuery } from "@tanstack/react-query";

const useWhProducts = () => {
    const { data: products = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const url = 'https://localhost:5000/wh-products';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [products, loading, refetch];
};

export default useWhProducts;