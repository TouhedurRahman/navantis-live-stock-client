import { useQuery } from "@tanstack/react-query";

const useDamagedProductsWh = () => {
    const { data: products = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const url = 'http://localhost:5000/damaged-in-wh';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [products, loading, refetch];
};

export default useDamagedProductsWh;